const Event = require("../modules/Event");

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
            // organizer: req.user.id,
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
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true,
            }
        );

        if (!event) {
            return res.status(404).json({
                message: "Event not found",
            });
        }

        res.status(200).json({
            message: "Event updated successfully",
            event,
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
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                message: "Event not found",
            });
        }

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
    getEventById,
    updateEvent,
    deleteEvent,
};