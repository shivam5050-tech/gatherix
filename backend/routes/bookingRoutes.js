const express = require("express");
const authMiddleware = require("../middleware/authmiddleware");
const {
    createBooking,
    getMyBookings,
    createPaymentOrder,
    verifyPayment,
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/", authMiddleware, createBooking);
router.get("/mine", authMiddleware, getMyBookings);
router.post("/:id/payment-order", authMiddleware, createPaymentOrder);
router.post("/:id/verify-payment", authMiddleware, verifyPayment);

module.exports = router;
