const mongoose = require("mongoose");
const Booking = require("../modules/Booking");
const Event = require("../modules/Event");

const bookingStatuses = ["pending", "cancelling", "confirmed", "cancelled"];
const paymentStatuses = ["unpaid", "paid"];

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parsePositiveInteger(value, fallback, maximum) {
    if (value === undefined) return fallback;
    if (typeof value !== "string" || !/^\d+$/.test(value)) return null;

    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed >= 1 && parsed <= maximum
        ? parsed
        : null;
}

async function getAdminBookings(req, res) {
    const allowedQueryKeys = new Set(["page", "limit", "search", "bookingStatus", "paymentStatus"]);
    if (Object.keys(req.query).some((key) => !allowedQueryKeys.has(key))) {
        return res.status(400).json({ message: "Unsupported booking list query parameter" });
    }

    const page = parsePositiveInteger(req.query.page, 1, 1000000);
    const limit = parsePositiveInteger(req.query.limit, 10, 100);
    if (page === null || limit === null) {
        return res.status(400).json({ message: "Page and limit must be valid positive integers" });
    }

    let search = "";
    if (req.query.search !== undefined) {
        if (typeof req.query.search !== "string" || req.query.search.trim().length > 100) {
            return res.status(400).json({ message: "Search must be 100 characters or fewer" });
        }
        search = req.query.search.trim();
    }

    let bookingStatus;
    if (req.query.bookingStatus !== undefined) {
        if (typeof req.query.bookingStatus !== "string" || !bookingStatuses.includes(req.query.bookingStatus)) {
            return res.status(400).json({ message: "Booking status must be pending, cancelling, confirmed, or cancelled" });
        }
        bookingStatus = req.query.bookingStatus;
    }

    let paymentStatus;
    if (req.query.paymentStatus !== undefined) {
        if (typeof req.query.paymentStatus !== "string" || !paymentStatuses.includes(req.query.paymentStatus)) {
            return res.status(400).json({ message: "Payment status must be unpaid or paid" });
        }
        paymentStatus = req.query.paymentStatus;
    }

    const filter = {};
    if (bookingStatus) filter.bookingStatus = bookingStatus;
    if (paymentStatus) filter.paymentStatus = paymentStatus;

    try {
        if (search) {
            const searchPattern = new RegExp(escapeRegex(search), "i");
            const searchConditions = [
                { attendeeName: searchPattern },
                { attendeeEmail: searchPattern },
            ];

            if (mongoose.isObjectIdOrHexString(search)) {
                searchConditions.push({ _id: new mongoose.Types.ObjectId(search) });
            }

            const matchingEvents = await Event.find({ title: searchPattern }).select("_id").lean();
            if (matchingEvents.length > 0) {
                searchConditions.push({ event: { $in: matchingEvents.map((event) => event._id) } });
            }
            filter.$or = searchConditions;
        }

        const skip = (page - 1) * limit;
        const [totalBookings, bookings] = await Promise.all([
            Booking.countDocuments(filter),
            Booking.find(filter)
                .select("_id event ticketQuantity attendeeName attendeeEmail subtotal bookingStatus paymentStatus createdAt razorpayAmount paymentVerifiedAt")
                .populate({
                    path: "event",
                    select: "title organizer",
                    populate: { path: "organizer", select: "name" },
                })
                .sort({ createdAt: -1, _id: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
        ]);

        return res.status(200).json({
            bookings: bookings.map((booking) => {
                const paymentWasVerified = booking.paymentStatus === "paid"
                    && booking.bookingStatus === "confirmed"
                    && booking.paymentVerifiedAt instanceof Date
                    && Number.isFinite(booking.razorpayAmount);
                const totalAmount = paymentWasVerified
                    ? booking.razorpayAmount / 100
                    : booking.subtotal;

                return {
                    id: booking._id.toString(),
                    attendeeName: booking.attendeeName,
                    attendeeEmail: booking.attendeeEmail,
                    event: booking.event
                        ? {
                            title: booking.event.title,
                            organizer: booking.event.organizer
                                ? { name: booking.event.organizer.name }
                                : null,
                        }
                        : null,
                    ticketQuantity: booking.ticketQuantity,
                    totalAmount,
                    currency: "INR",
                    bookingStatus: booking.bookingStatus,
                    paymentStatus: booking.paymentStatus,
                    createdAt: booking.createdAt,
                };
            }),
            pagination: {
                page,
                limit,
                totalBookings,
                totalPages: Math.ceil(totalBookings / limit),
            },
        });
    } catch {
        return res.status(500).json({ message: "Could not load bookings. Please try again." });
    }
}

module.exports = { getAdminBookings };
