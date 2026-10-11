const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            required: true,
        },

        category: {
            type: String,
            required: true,
        },

        date: {
            type: Date,
            required: true,
        },

        location: {
            type: String,
            required: true,
        },

        city: {
            type: String,
            required: true,
        },

        price: {
            type: Number,
            required: true,
        },

        totalTickets: {
            type: Number,
            required: true,
        },

        availableTickets: {
            type: Number,
            required: true,
        },

        image: {
            type: String,
            default: "",
        },

        organizer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },

        status: {
            type: String,
            enum: ["draft", "published", "cancelled"],
            default: "draft",
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Event", eventSchema);