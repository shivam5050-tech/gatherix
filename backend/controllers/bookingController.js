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
        const error = new Error("Razorpay test credentials are not configured on the server");
        error.kind = "configuration";
        throw error;
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
                    const error = new Error("Razorpay returned an invalid response");
                    error.kind = "invalid_response";
                    error.statusCode = response.statusCode;
                    return reject(error);
                }

                if (response.statusCode < 200 || response.statusCode >= 300) {
                    const error = new Error("Razorpay API rejected the request");
                    error.kind = "provider";
                    error.statusCode = response.statusCode;
                    error.providerCode = data.error?.code;
                    error.providerDescription = data.error?.description;
                    return reject(error);
                }

                return resolve(data);
            });
        });

        request.setTimeout(15000, () => {
            const error = new Error("Razorpay request timed out");
            error.code = "ETIMEDOUT";
            request.destroy(error);
        });
        request.on("error", (cause) => {
            const error = new Error("Razorpay network request failed");
            error.kind = "network";
            error.cause = cause;
            error.code = cause.code;
            error.syscall = cause.syscall;
            error.hostname = cause.hostname;
            error.port = cause.port;
            reject(error);
        });
        if (requestBody) request.write(requestBody);
        request.end();
    });
}

function getSafeDiagnosticCode(value) {
    return typeof value === "string" && /^[A-Za-z0-9_.-]{1,64}$/.test(value)
        ? value
        : undefined;
}

function sanitizeProviderDescription(value) {
    if (typeof value !== "string") return undefined;

    let description = value
        .replace(/[\u0000-\u001f\u007f]+/g, " ")
        .replace(/rzp_(?:test|live)_[A-Za-z0-9]+/gi, "[redacted Razorpay key]")
        .replace(/(authorization|api[_ -]?key|secret)\s*[:=]\s*[^\s,;]+/gi, "$1=[redacted]");

    for (const credential of [process.env.RAZORPAY_KEY_ID, process.env.RAZORPAY_KEY_SECRET]) {
        if (typeof credential === "string" && credential.length >= 8) {
            description = description.split(credential).join("[redacted credential]");
        }
    }

    return description.slice(0, 240);
}

function respondToRazorpayError(error, res, operation) {
    const cause = error.cause || error;
    const networkCode = cause.code || error.code;
    const category = error.kind === "network"
        ? (/TLS|CERT|SSL|LEAF_SIGNATURE/i.test(networkCode || "")
            ? "tls"
            : (["ENOTFOUND", "EAI_AGAIN", "EAI_FAIL"].includes(networkCode)
                ? "dns"
                : (networkCode === "ETIMEDOUT" ? "timeout" : "network")))
        : (error.kind || "application");
    const diagnostic = {
        category,
        errorName: getSafeDiagnosticCode(error.name),
        errorCode: getSafeDiagnosticCode(error.code),
        causeCode: getSafeDiagnosticCode(cause.code),
        httpStatus: Number.isInteger(error.statusCode) ? error.statusCode : undefined,
        providerCode: getSafeDiagnosticCode(error.providerCode),
        providerDescription: sanitizeProviderDescription(error.providerDescription),
        networkCode: getSafeDiagnosticCode(networkCode),
        syscall: getSafeDiagnosticCode(cause.syscall || error.syscall),
        hostname: "api.razorpay.com",
        port: Number.isInteger(cause.port || error.port) ? cause.port || error.port : 443,
    };

    if (process.env.NODE_ENV !== "production") {
        console.error(`Razorpay ${operation} failed`, diagnostic);
    }

    if (error.kind === "network") {
        return res.status(503).json({ message: "Could not reach the payment provider. Please try again later." });
    }

    if (error.kind === "configuration") {
        return res.status(503).json({ message: "Online payments are temporarily unavailable. Please try again later." });
    }

    if (error.kind === "provider" && [401, 403].includes(error.statusCode)) {
        return res.status(502).json({ message: "The payment provider rejected the server configuration. Please contact support." });
    }

    if (error.kind === "provider" && error.statusCode === 400) {
        return res.status(502).json({ message: "The payment provider rejected the order details. Please try again or contact support." });
    }

    return res.status(error.kind === "provider" || error.kind === "invalid_response" ? 502 : 500)
        .json({ message: "The payment request could not be completed. Please try again later." });
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
            .populate("event", "title date location city image availableTickets")
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

// Return booking details only to the event's organizer or an administrator.
const getEventBookings = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.eventId)) {
        return res.status(404).json({ message: "Event not found" });
    }

    try {
        const event = await Event.findById(req.params.eventId)
            .select("title date location city price organizer");

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        const isAdmin = req.user.role === "admin";
        const isOwner = event.organizer?.toString() === req.user._id.toString();
        if (!isAdmin && !isOwner) {
            return res.status(403).json({ message: "Only the event organizer or an administrator can view these bookings" });
        }

        const bookings = await Booking.find({ event: event._id })
            .select("attendeeName attendeeEmail ticketQuantity subtotal bookingStatus paymentStatus createdAt")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            event: {
                _id: event._id,
                title: event.title,
                date: event.date,
                location: event.location,
                city: event.city,
                price: event.price,
            },
            count: bookings.length,
            bookings,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Could not fetch bookings for this event",
            error: error.message,
        });
    }
};

// Cancel an unpaid booking and release its reserved tickets exactly once.
const cancelBooking = async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(404).json({ message: "Booking not found" });
    }

    try {
        let booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        if (booking.paymentStatus === "paid" || booking.bookingStatus === "confirmed") {
            return res.status(409).json({ message: "Paid bookings cannot be cancelled through this flow" });
        }

        if (booking.bookingStatus === "cancelled") {
            return res.status(200).json({
                message: "This booking is already cancelled.",
                booking,
                alreadyCancelled: true,
            });
        }

        if (booking.bookingStatus === "pending") {
            booking = await Booking.findOneAndUpdate(
                {
                    _id: booking._id,
                    user: req.user._id,
                    bookingStatus: "pending",
                    paymentStatus: "unpaid",
                },
                { $set: { bookingStatus: "cancelling" } },
                { new: true }
            );

            if (!booking) {
                booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });
                if (!booking) {
                    return res.status(404).json({ message: "Booking not found" });
                }
                if (booking.paymentStatus === "paid" || booking.bookingStatus === "confirmed") {
                    return res.status(409).json({ message: "Paid bookings cannot be cancelled through this flow" });
                }
                if (booking.bookingStatus === "cancelled") {
                    return res.status(200).json({ message: "This booking is already cancelled.", booking, alreadyCancelled: true });
                }
            }
        }

        if (booking.bookingStatus !== "cancelling" || booking.paymentStatus !== "unpaid") {
            return res.status(409).json({ message: "This booking cannot be cancelled in its current state" });
        }

        const eventExists = await Event.exists({ _id: booking.event });
        if (eventExists) {
            const releasedEvent = await Event.findOneAndUpdate(
                {
                    _id: booking.event,
                    ticketReleaseBookingIds: { $ne: booking._id },
                    $expr: {
                        $and: [
                            { $gte: ["$availableTickets", 0] },
                            { $lte: [{ $add: ["$availableTickets", booking.ticketQuantity] }, "$totalTickets"] },
                        ],
                    },
                },
                {
                    $inc: { availableTickets: booking.ticketQuantity },
                    $addToSet: { ticketReleaseBookingIds: booking._id },
                },
                { new: true }
            );

            if (!releasedEvent) {
                const alreadyReleased = await Event.exists({
                    _id: booking.event,
                    ticketReleaseBookingIds: booking._id,
                });

                if (!alreadyReleased) {
                    return res.status(409).json({
                        message: "Tickets could not be released because the event inventory changed. Please retry or contact support.",
                    });
                }
            }
        }

        let cancelledBooking = await Booking.findOneAndUpdate(
            {
                _id: booking._id,
                user: req.user._id,
                bookingStatus: "cancelling",
                paymentStatus: "unpaid",
            },
            { $set: { bookingStatus: "cancelled" } },
            { new: true }
        );

        if (!cancelledBooking) {
            cancelledBooking = await Booking.findOne({ _id: booking._id, user: req.user._id });
            if (cancelledBooking?.bookingStatus !== "cancelled" || cancelledBooking.paymentStatus !== "unpaid") {
                return res.status(409).json({ message: "Booking state changed while cancellation was finishing. Please refresh and retry." });
            }
        }

        const event = await Event.findById(booking.event).select("availableTickets");
        return res.status(200).json({
            message: "Booking cancelled and reserved tickets released.",
            booking: cancelledBooking,
            availableTickets: event?.availableTickets,
        });
    } catch (error) {
        console.error("Booking cancellation failed", {
            name: error.name,
            code: typeof error.code === "string" ? error.code : undefined,
        });
        return res.status(500).json({
            message: "Cancellation is still processing. Refresh your bookings and retry if it remains in progress.",
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
        return respondToRazorpayError(error, res, "order creation");
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
        return respondToRazorpayError(error, res, "payment verification");
    }
};

module.exports = {
    createBooking,
    getMyBookings,
    getEventBookings,
    cancelBooking,
    createPaymentOrder,
    verifyPayment,
};
