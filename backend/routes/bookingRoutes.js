const express = require("express");
const authMiddleware = require("../middleware/authmiddleware");
const {
    createBooking,
    getMyBookings,
    getEventBookings,
    cancelBooking,
    createPaymentOrder,
    verifyPayment,
    verifyTicket,
} = require("../controllers/bookingController");

const router = express.Router();

// Public verification uses an unguessable capability token in the request body.
router.post("/tickets/verify", verifyTicket);
router.post("/", authMiddleware, createBooking);
router.get("/mine", authMiddleware, getMyBookings);
router.get("/events/:eventId", authMiddleware, getEventBookings);
router.post("/:id/cancel", authMiddleware, cancelBooking);
router.post("/:id/payment-order", authMiddleware, createPaymentOrder);
router.post("/:id/verify-payment", authMiddleware, verifyPayment);

module.exports = router;
