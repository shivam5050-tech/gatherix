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
const { cleanupEventImageController, uploadEventImageController } = require("../controllers/eventImageController");

const router = express.Router();
const parseImageBody = express.raw({ type: "application/octet-stream", limit: "5mb" });
function parseImageRequest(req, res, next) {
    parseImageBody(req, res, (error) => {
        if (!error) return next();
        return res.status(error.status === 413 ? 413 : 400).json({ message: error.status === 413 ? "Image must be 5 MB or smaller." : "Could not read the image upload." });
    });
}


router.get("/", getAllEvents);

router.get("/mine", authMiddleware, getMyEvents);

router.get("/:id", getEventById);

router.post("/images", authMiddleware, parseImageRequest, uploadEventImageController);
router.delete("/images", authMiddleware, cleanupEventImageController);

router.post("/", authMiddleware, createEvent);

router.put("/:id", authMiddleware, updateEvent);

router.delete("/:id", authMiddleware, deleteEvent);

module.exports = router;
