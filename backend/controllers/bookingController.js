const mongoose = require("mongoose");
const crypto = require("crypto");
const https = require("https");
const Booking = require("../modules/Booking");
const Event = require("../modules/Event");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function getRazorpayCredentials() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret || !keyId.startsWith("rzp_test_")) {
        throw new Error("Razorpay test credentials are not configured on the server");
    }

    return { keyId, keySecret };
}

function razorpayRequest(path, method, body, keyId, keySecret) {
    return new Promise((resolve, reject) => {
        const requestBody = body ? JSON.stringify(body) : null;
        const request = https.request({
            hostname: "api.razorpay.com",
            path: `/v1${path}`,
            method,
            headers: {
                Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
                ...(requestBody ? {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(requestBody),
                } : {}),
            },
        }, (response) => {
            let responseBody = "";
            response.on("data", (chunk) => {
                responseBody += chunk;
            });
            response.on("end", () => {
                let data;
                try {
                    data = JSON.parse(responseBody || "{}");
                } catch {
                    return reject(new Error("Razorpay returned an invalid response"));
                }

                if (response.statusCode < 200 || response.statusCode >= 300) {
                    return reject(new Error(data.error?.description || "Razorpay request failed"));
                }

                return resolve(data);
            });
        });

        request.setTimeout(15000, () => request.destroy(new Error("Razorpay request timed out")));
        request.on("error", () => reject(new Error("Could not connect to Razorpay")));
        if (requestBody) request.write(requestBody);
        request.end();
    });
}

function sameSignature(expected, received) {
    const expectedBuffer = Buffer.from(expected, "hex");
    const receivedBuffer = Buffer.from(received, "hex");

    return expectedBuffer.length === receivedBuffer.length
        && crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

// Create a pending, unpaid booking and reserve tickets.
const createBooking = async (req, res) => {
    const { eventId, ticketQuantity, attendeeName, attendeeEmail } = req.body;
    const cleanName = typeof attendeeName === "string" ? attendeeName.trim() : "";
    const cleanEmail = typeof attendeeEmail === "string" ? attendeeEmail.trim().toLowerCase() : "";

    if (!mongoose.isValidObjectId(eventId)) {
        return res.status(404).json({ message: "Event not found" });
    }

    if (!Number.isInteger(ticketQuantity) || ticketQuantity < 1 || ticketQuantity > 10) {
        return res.status(400).json({ message: "Ticket quantity must be a whole number between 1 and 10" });
    }

    if (!cleanName) {
        return res.status(400).json({ message: "Attendee name is required" });
    }

    if (!emailPattern.test(cleanEmail)) {
        return res.status(400).json({ message: "Enter a valid attendee email address" });
    }

    let ticketsReserved = false;

    try {
        // This single update only succeeds when enough tickets remain.
        const event = await Event.findOneAndUpdate(
            { _id: eventId, availableTickets: { $gte: ticketQuantity } },
            { $inc: { availableTickets: -ticketQuantity } },
            { new: true }
        );

        if (!event) {
            const eventExists = await Event.exists({ _id: eventId });
            return res.status(eventExists ? 400 : 404).json({
                message: eventExists ? "Not enough tickets are available" : "Event not found",
            });
        }

        ticketsReserved = true;
        const booking = await Booking.create({
            event: event._id,
            user: req.user._id,
            ticketQuantity,
            attendeeName: cleanName,
            attendeeEmail: cleanEmail,
            pricePerTicket: event.price,
            subtotal: event.price * ticketQuantity,
            bookingStatus: "pending",
            paymentStatus: "unpaid",
        });

        return res.status(201).json({
            message: "Booking created. Payment is still pending.",
            booking,
            event,
        });
    } catch (error) {
        if (ticketsReserved) {
            await Event.updateOne({ _id: eventId }, { $inc: { availableTickets: ticketQuantity } });
        }

        return res.status(500).json({
            message: "Could not create the booking",
            error: error.message,
        });
    }
};

// Get bookings belonging only to the logged-in user.
const getMyBookings = async (req, res) => {
    try {
        const bookings = await Booking.find({ user: req.user._id })
            .populate("event", "title date location city image")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            count: bookings.length,
            bookings,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Could not fetch your bookings",
            error: error.message,
        });
    }
};

// Create or return a Razorpay Test Mode order for the logged-in user's booking.
const createPaymentOrder = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({ message: "Booking not found" });
    }

    try {
        const { keyId, keySecret } = getRazorpayCredentials();
        let booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.paymentStatus !== "unpaid" || booking.bookingStatus !== "pending") {
            return res.status(409).json({ message: "This booking is not awaiting payment" });
        }

        if (booking.paymentStatus === "paid" || booking.bookingStatus === "confirmed") {
            return res.status(409).json({ message: "This booking has already been paid" });
        }

        if (!booking.razorpayOrderId) {
            const amount = Math.round(booking.subtotal * 100);
            if (!Number.isSafeInteger(amount) || amount < 100) {
                return res.status(400).json({ message: "This booking has an invalid payment amount" });
            }

            const order = await razorpayRequest("/orders", "POST", {
                amount,
                currency: "INR",
                receipt: `booking_${booking._id}`,
                notes: { bookingId: booking._id.toString() },
            }, keyId, keySecret);

            if (typeof order.id !== "string" || !order.id
                || order.amount !== amount || order.currency !== "INR"
                || !["created", "attempted"].includes(order.status)) {
                return res.status(502).json({ message: "Razorpay returned an order that does not match this booking" });
            }

            booking = await Booking.findOneAndUpdate(
                {
                    _id: booking._id,
                    user: req.user._id,
                    paymentStatus: "unpaid",
                    bookingStatus: "pending",
                    razorpayOrderId: { $exists: false },
                },
                {
                    $set: {
                        razorpayOrderId: order.id,
                        razorpayAmount: amount,
                        razorpayCurrency: order.currency,
                    },
                },
                { new: true }
            );

            if (!booking) {
                booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
            }
        }

        if (!booking || booking.paymentStatus !== "unpaid" || booking.bookingStatus !== "pending"
            || !booking.razorpayOrderId || !Number.isSafeInteger(booking.razorpayAmount)) {
            return res.status(409).json({ message: "Booking payment state changed. Please refresh and try again." });
        }

        return res.status(200).json({
            bookingId: booking._id,
            keyId,
            orderId: booking.razorpayOrderId,
            amount: booking.razorpayAmount,
            currency: booking.razorpayCurrency,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not create a payment order" });
    }
};

// Verify Razorpay's signature and payment details before confirming a booking.
const verifyPayment = async (req, res) => {
    const { razorpayPaymentId, razorpayOrderId, razorpaySignature } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({ message: "Booking not found" });
    }

    if (![razorpayPaymentId, razorpayOrderId, razorpaySignature].every((value) => typeof value === "string" && value)) {
        return res.status(400).json({ message: "Payment verification details are required" });
    }

    try {
        const { keyId, keySecret } = getRazorpayCredentials();
        const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.paymentStatus === "paid" && booking.bookingStatus === "confirmed") {
            if (booking.razorpayOrderId === razorpayOrderId && booking.razorpayPaymentId === razorpayPaymentId) {
                return res.status(200).json({ booking, alreadyVerified: true });
            }

            return res.status(409).json({ message: "This booking has already been verified with another payment" });
        }

        if (booking.razorpayOrderId !== razorpayOrderId) {
            return res.status(400).json({ message: "Payment order does not match this booking" });
        }

        const expectedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(`${booking.razorpayOrderId}|${razorpayPaymentId}`)
            .digest("hex");

        if (!sameSignature(expectedSignature, razorpaySignature)) {
            return res.status(400).json({ message: "Invalid payment signature" });
        }

        const payment = await razorpayRequest(`/payments/${razorpayPaymentId}`, "GET", null, keyId, keySecret);
        if (payment.order_id !== booking.razorpayOrderId
            || payment.amount !== booking.razorpayAmount
            || payment.currency !== booking.razorpayCurrency
            || payment.status !== "captured") {
            return res.status(400).json({ message: "Payment details do not match a captured booking payment" });
        }

        const updatedBooking = await Booking.findOneAndUpdate(
            {
                _id: booking._id,
                user: req.user._id,
                bookingStatus: "pending",
                paymentStatus: "unpaid",
                razorpayOrderId: razorpayOrderId,
            },
            {
                $set: {
                    bookingStatus: "confirmed",
                    paymentStatus: "paid",
                    razorpayPaymentId,
                    paymentVerifiedAt: new Date(),
                },
            },
            { new: true }
        );

        if (!updatedBooking) {
            const currentBooking = await Booking.findOne({ _id: booking._id, user: req.user._id });
            if (currentBooking?.paymentStatus === "paid" && currentBooking.razorpayPaymentId === razorpayPaymentId) {
                return res.status(200).json({ booking: currentBooking, alreadyVerified: true });
            }

            return res.status(409).json({ message: "Booking payment state changed. Please refresh and try again." });
        }

        return res.status(200).json({ booking: updatedBooking, alreadyVerified: false });
    } catch (error) {
        return res.status(500).json({ message: error.message || "Could not verify payment" });
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    createPaymentOrder,
    verifyPayment,
};
