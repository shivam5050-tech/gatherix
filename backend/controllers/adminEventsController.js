const Event = require("../modules/Event");
const Booking = require("../modules/Booking");
const mongoose = require("mongoose");

const eventStatuses = ["draft", "published", "cancelled"];

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

async function getAdminEvents(req, res) {
    const allowedQueryKeys = new Set(["page", "limit", "search", "category", "status"]);
    if (Object.keys(req.query).some((key) => !allowedQueryKeys.has(key))) {
        return res.status(400).json({ message: "Unsupported event list query parameter" });
    }

    const page = parsePositiveInteger(req.query.page, 1, 1000000);
    const limit = parsePositiveInteger(req.query.limit, 10, 100);
    if (page === null || limit === null) {
        return res.status(400).json({ message: "Page and limit must be valid positive integers" });
    }

    let search = "";
    if (req.query.search !== undefined) {
        if (typeof req.query.search !== "string" || req.query.search.trim().length > 100) {
            return res.status(400).json({ message: "Title search must be 100 characters or fewer" });
        }
        search = req.query.search.trim();
    }

    let category = "";
    if (req.query.category !== undefined) {
        if (typeof req.query.category !== "string" || req.query.category.trim().length > 80) {
            return res.status(400).json({ message: "Category must be 80 characters or fewer" });
        }
        category = req.query.category.trim();
    }

    let status;
    if (req.query.status !== undefined) {
        if (typeof req.query.status !== "string" || !eventStatuses.includes(req.query.status)) {
            return res.status(400).json({ message: "Status must be draft, published, or cancelled" });
        }
        status = req.query.status;
    }

    const filter = {};
    if (search) filter.title = new RegExp(escapeRegex(search), "i");
    if (category) filter.category = new RegExp(`^${escapeRegex(category)}$`, "i");
    if (status) filter.status = status;

    try {
        const skip = (page - 1) * limit;
        const [totalEvents, events] = await Promise.all([
            Event.countDocuments(filter),
            Event.find(filter)
                .select("_id title description category city location date price totalTickets availableTickets image status organizer createdAt updatedAt")
                .populate({ path: "organizer", select: "name email" })
                .sort({ createdAt: -1, _id: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
        ]);

        const eventIds = events.map((event) => event._id);
        const bookingCounts = eventIds.length ? await Booking.aggregate([
            { $match: { event: { $in: eventIds } } },
            { $group: {
                _id: "$event",
                total: { $sum: 1 },
                pending: { $sum: { $cond: [{ $eq: ["$bookingStatus", "pending"] }, 1, 0] } },
                confirmed: { $sum: { $cond: [{ $eq: ["$bookingStatus", "confirmed"] }, 1, 0] } },
                paid: { $sum: { $cond: [{ $eq: ["$paymentStatus", "paid"] }, 1, 0] } },
                cancelled: { $sum: { $cond: [{ $eq: ["$bookingStatus", "cancelled"] }, 1, 0] } },
            } },
        ]) : [];
        const countsByEvent = new Map(bookingCounts.map((count) => [count._id.toString(), count]));

        return res.status(200).json({
            events: events.map((event) => ({
                id: event._id.toString(),
                title: event.title,
                description: event.description,
                category: event.category,
                city: event.city,
                location: event.location,
                date: event.date,
                price: event.price,
                totalTickets: event.totalTickets,
                availableTickets: event.availableTickets,
                status: event.status,
                image: event.image,
                updatedAt: event.updatedAt,
                bookingCounts: (() => {
                    const count = countsByEvent.get(event._id.toString()) || {};
                    return { total: count.total || 0, pending: count.pending || 0, confirmed: count.confirmed || 0, paid: count.paid || 0, cancelled: count.cancelled || 0 };
                })(),
                organizer: event.organizer
                    ? {
                        id: event.organizer._id.toString(),
                        name: event.organizer.name,
                        email: event.organizer.email,
                    }
                    : null,
                createdAt: event.createdAt,
            })),
            pagination: {
                page,
                limit,
                totalEvents,
                totalPages: Math.ceil(totalEvents / limit),
            },
        });
    } catch {
        return res.status(500).json({ message: "Could not load events. Please try again." });
    }
}

function validEventId(id) {
    return typeof id === "string" && mongoose.isValidObjectId(id);
}

async function updateAdminEventStatus(req, res) {
    if (!validEventId(req.params.id)) return res.status(400).json({ message: "Invalid event ID" });
    const { status } = req.body || {};
    if (!eventStatuses.includes(status)) return res.status(400).json({ message: "Status must be draft, published, or cancelled" });

    try {
        const event = await Event.findById(req.params.id);
        if (!event) return res.status(404).json({ message: "Event not found" });
        if (event.status === "cancelled" && status !== "cancelled") {
            return res.status(409).json({ message: "Cancelled events cannot be reopened" });
        }
        if (event.status === status) return res.status(200).json({ message: `Event is already ${status}`, event: { id: event._id.toString(), status: event.status } });

        event.status = status;
        await event.save();
        return res.status(200).json({
            message: status === "published" ? "Event published" : status === "draft" ? "Event unpublished" : "Event cancelled",
            event: { id: event._id.toString(), status: event.status },
        });
    } catch {
        return res.status(500).json({ message: "Could not update event status. Please try again." });
    }
}

async function deleteAdminEvent(req, res) {
    if (!validEventId(req.params.id)) return res.status(400).json({ message: "Invalid event ID" });
    try {
        const event = await Event.findById(req.params.id).select("_id status");
        if (!event) return res.status(404).json({ message: "Event not found" });
        if (event.status === "published") {
            return res.status(409).json({ message: "Unpublish the event before deleting it." });
        }
        if (await Booking.exists({ event: event._id })) {
            return res.status(409).json({ message: "This event has booking history and cannot be deleted. Unpublish or cancel it instead." });
        }
        await Event.deleteOne({ _id: event._id });
        return res.status(200).json({ message: "Event deleted" });
    } catch {
        return res.status(500).json({ message: "Could not delete event. Please try again." });
    }
}

module.exports = { getAdminEvents, updateAdminEventStatus, deleteAdminEvent };
