const Event = require("../modules/Event");
const mongoose = require("mongoose");

const editableEventFields = [
    "title",
    "description",
    "category",
    "date",
    "location",
    "city",
    "price",
    "totalTickets",
    "availableTickets",
    "image",
    "status",
];

function validateEventUpdates(updates) {
    for (const [field, value] of Object.entries(updates)) {
        if (["title", "description", "category", "location", "city"].includes(field)) {
            if (typeof value !== "string" || !value.trim()) {
                return `${field} must be a non-empty string`;
            }
        }

        if (field === "image" && typeof value !== "string") {
            return "image must be a string";
        }

        if (field === "date" && (typeof value !== "string" || Number.isNaN(Date.parse(value)))) {
            return "date must be a valid date string";
        }

        if (field === "price" && (typeof value !== "number" || !Number.isFinite(value) || value < 0)) {
            return "price must be a non-negative number";
        }

        if (field === "totalTickets" && (!Number.isInteger(value) || value < 0)) {
            return "totalTickets must be a non-negative integer";
        }

        if (field === "availableTickets" && (!Number.isInteger(value) || value < 0)) {
            return "availableTickets must be a non-negative integer";
        }

        if (field === "status" && !["draft", "published", "cancelled"].includes(value)) {
            return "status must be draft, published, or cancelled";
        }
    }

    return null;
}

function isOrganizerOrAdmin(req, event) {
    return req.user.role === "admin" || event.organizer?.toString() === req.user._id.toString();
}

// Create Event
const createEvent = async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            date,
            location,
            city,
            price,
            totalTickets,
            image,
        } = req.body;

        const event = await Event.create({
            title,
            description,
            category,
            date,
            location,
            city,
            price,
            totalTickets,
            availableTickets: totalTickets,
            image,
            organizer: req.user._id,
        });

        res.status(201).json({
            message: "Event created successfully",
            event,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to create event",
            error: error.message,
        });
    }
};


// Get All Events
const getAllEvents = async (req, res) => {
    try {
        const events = await Event.find().populate("organizer", "name email");

        res.status(200).json({
            count: events.length,
            events,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch events",
            error: error.message,
        });
    }
};

// Get Events Created By The Logged-In User
const getMyEvents = async (req, res) => {
    try {
        const events = await Event.find({ organizer: req.user._id }).sort({ createdAt: -1 });

        res.status(200).json({
            count: events.length,
            events,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch your events",
            error: error.message,
        });
    }
};


// Get Single Event
const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate("organizer", "name email");

        if (!event) {
            return res.status(404).json({
                message: "Event not found",
            });
        }

        res.status(200).json({
            event,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to fetch event",
            error: error.message,
        });
    }
};


// Update Event
const updateEvent = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ message: "Event not found" });
        }

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found",
            });
        }

        if (!isOrganizerOrAdmin(req, event)) {
            return res.status(403).json({ message: "Only the event organizer or an administrator can update this event" });
        }

        const body = req.body && typeof req.body === "object" ? req.body : {};
        const updates = Object.fromEntries(
            editableEventFields
                .filter((field) => Object.prototype.hasOwnProperty.call(body, field))
                .map((field) => [field, body[field]])
        );

        if (Object.keys(updates).length === 0) {
            return res.status(400).json({ message: "No editable event fields provided" });
        }

        const validationError = validateEventUpdates(updates);
        if (validationError) {
            return res.status(400).json({ message: validationError });
        }

        const finalTotalTickets = updates.totalTickets ?? event.totalTickets;
        const finalAvailableTickets = updates.availableTickets ?? event.availableTickets;
        if (finalAvailableTickets > finalTotalTickets) {
            return res.status(400).json({
                message: "availableTickets cannot be greater than totalTickets",
            });
        }

        const updatedEvent = await Event.findByIdAndUpdate(
            event._id,
            { $set: updates },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            message: "Event updated successfully",
            event: updatedEvent,
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to update event",
            error: error.message,
        });
    }
};


// Delete Event
const deleteEvent = async (req, res) => {
    try {
        if (!mongoose.isValidObjectId(req.params.id)) {
            return res.status(404).json({ message: "Event not found" });
        }

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found",
            });
        }

        if (!isOrganizerOrAdmin(req, event)) {
            return res.status(403).json({ message: "Only the event organizer or an administrator can delete this event" });
        }

        await event.deleteOne();

        res.status(200).json({
            message: "Event deleted successfully",
        });
    } catch (error) {
        res.status(500).json({
            message: "Failed to delete event",
            error: error.message,
        });
    }
};


module.exports = {
    createEvent,
    getAllEvents,
    getMyEvents,
    getEventById,
    updateEvent,
    deleteEvent,
};
