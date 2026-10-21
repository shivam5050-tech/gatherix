const crypto = require("node:crypto");
const { createCleanupToken, deleteEventImage, uploadEventImage } = require("../services/imageUploadService");

async function uploadEventImageController(req, res) {
    try {
        const result = await uploadEventImage(req.body);
        return res.status(201).json({ ...result, cleanupToken: createCleanupToken(req.user._id, result.publicId) });
    } catch (error) {
        return res.status(error.status || 502).json({ message: error.status ? error.message : "Could not upload this image. Please try again." });
    }
}

async function cleanupEventImageController(req, res) {
    try {
        const { publicId, cleanupToken } = req.body || {};
        if (typeof publicId !== "string" || !publicId.startsWith("gatherix/events/") || typeof cleanupToken !== "string") {
            return res.status(400).json({ message: "Invalid image cleanup request." });
        }
        const expected = createCleanupToken(req.user._id, publicId);
        const supplied = Buffer.from(cleanupToken, "hex");
        const expectedBuffer = Buffer.from(expected, "hex");
        if (supplied.length !== expectedBuffer.length || !crypto.timingSafeEqual(supplied, expectedBuffer)) {
            return res.status(403).json({ message: "You cannot remove this image." });
        }
        await deleteEventImage(publicId);
        return res.status(200).json({ message: "Uploaded image removed." });
    } catch {
        return res.status(502).json({ message: "Could not remove the unused image." });
    }
}

module.exports = { cleanupEventImageController, uploadEventImageController };
