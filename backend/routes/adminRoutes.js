const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const { getDashboardStats, getAdminUsers, changeUserStatus, changeUserRole } = require("../controllers/adminController");
const { getAdminEvents, updateAdminEventStatus, deleteAdminEvent } = require("../controllers/adminEventsController");
const { getAdminBookings } = require("../controllers/adminBookingsController");

const router = express.Router();

// Put future admin-only routes below this guard.
router.use(adminMiddleware);

// Small protected endpoint for verifying the admin authorization flow.
router.get("/access-check", (req, res) => {
    res.status(200).json({ message: "Administrator access confirmed" });
});

router.get("/dashboard-stats", getDashboardStats);
router.get("/users", getAdminUsers);
router.patch("/users/:id/status", changeUserStatus);
router.patch("/users/:id/role", changeUserRole);
router.get("/events", getAdminEvents);
router.patch("/events/:id/status", updateAdminEventStatus);
router.delete("/events/:id", deleteAdminEvent);
router.get("/bookings", getAdminBookings);

module.exports = router;
