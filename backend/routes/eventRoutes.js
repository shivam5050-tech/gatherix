const express = require("express");

const {
    createEvent,
    getAllEvents,
    getMyEvents,
    getEventById,
    updateEvent,
    deleteEvent,
} = require("../controllers/eventController");
const authMiddleware = require('../middleware/authmiddleware')

const router = express.Router();


router.get("/", getAllEvents);

router.get("/mine", authMiddleware, getMyEvents);

router.get("/:id", getEventById);

router.post("/", authMiddleware, createEvent);

router.put("/:id", authMiddleware, updateEvent);

router.delete("/:id", authMiddleware, deleteEvent);

module.exports = router;
