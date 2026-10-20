const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        event: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Event",
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        ticketQuantity: {
            type: Number,
            required: true,
            min: 1,
        },
        attendeeName: {
            type: String,
            required: true,
            trim: true,
        },
        attendeeEmail: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        pricePerTicket: {
            type: Number,
            required: true,
            min: 0,
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0,
        },
        bookingStatus: {
            type: String,
            enum: ["pending", "cancelling", "confirmed", "cancelled"],
            default: "pending",
        },
        paymentStatus: {
            type: String,
            enum: ["unpaid", "paid", "not_required"],
            default: "unpaid",
        },
        ticketToken: {
            type: String,
            unique: true,
            sparse: true,
            select: false,
        },
        razorpayOrderId: {
            type: String,
            unique: true,
            sparse: true,
        },
        razorpayPaymentId: {
            type: String,
            unique: true,
            sparse: true,
        },
        razorpayAmount: {
            type: Number,
            min: 0,
        },
        razorpayCurrency: {
            type: String,
            default: "INR",
        },
        paymentVerifiedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Booking", bookingSchema);
