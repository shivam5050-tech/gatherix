const Users = require("../modules/userSchema");
const Event = require("../modules/Event");
const Booking = require("../modules/Booking");
const mongoose = require("mongoose");

const allowedUserRoles = ["user", "admin"];

function escapeRegex(value) {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parsePositiveInteger(value, fallback, maximum) {
    if (value === undefined) return fallback;
    if (typeof value !== "string" || !/^\d+$/.test(value)) return null;

    const parsed = Number(value);
    return Number.isSafeInteger(parsed) && parsed >= 1 && parsed <= maximum
        ? parsed
        : null;
}

async function getAdminUsers(req, res) {
    const allowedQueryKeys = new Set(["page", "limit", "search", "role"]);
    if (Object.keys(req.query).some((key) => !allowedQueryKeys.has(key))) {
        return res.status(400).json({ message: "Unsupported user list query parameter" });
    }

    const page = parsePositiveInteger(req.query.page, 1, 1000000);
    const limit = parsePositiveInteger(req.query.limit, 10, 100);
    if (page === null || limit === null) {
        return res.status(400).json({ message: "Page and limit must be valid positive integers" });
    }

    let search = "";
    if (req.query.search !== undefined) {
        if (typeof req.query.search !== "string" || req.query.search.trim().length > 100) {
            return res.status(400).json({ message: "Search must be 100 characters or fewer" });
        }
        search = req.query.search.trim();
    }

    let role;
    if (req.query.role !== undefined) {
        if (typeof req.query.role !== "string" || !allowedUserRoles.includes(req.query.role)) {
            return res.status(400).json({ message: "Role must be user or admin" });
        }
        role = req.query.role;
    }

    const filter = {};
    if (role) filter.role = role;
    if (search) {
        const searchPattern = new RegExp(escapeRegex(search), "i");
        filter.$or = [{ name: searchPattern }, { email: searchPattern }];
    }

    try {
        const skip = (page - 1) * limit;
        const [totalUsers, users] = await Promise.all([
            Users.countDocuments(filter),
            Users.find(filter)
                .select("_id name email role status createdAt")
                .sort({ createdAt: -1, _id: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
        ]);

        return res.status(200).json({
            users: users.map((user) => ({
                id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                status: user.status || "active",
                createdAt: user.createdAt,
            })),
            pagination: {
                page,
                limit,
                totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
            },
        });
    } catch {
        return res.status(500).json({ message: "Could not load users. Please try again." });
    }
}

function validUserId(id) {
    return typeof id === "string" && mongoose.isValidObjectId(id);
}

async function changeUserStatus(req, res) {
    if (!validUserId(req.params.id)) return res.status(400).json({ message: "Invalid user ID" });
    const { status } = req.body || {};
    if (status !== "active" && status !== "suspended") {
        return res.status(400).json({ message: "Status must be active or suspended" });
    }

    try {
        const user = await Users.findById(req.params.id).select("_id role status");
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user._id.toString() === req.user._id.toString() && status === "suspended") {
            return res.status(400).json({ message: "You cannot suspend your own account" });
        }
        if (user.role === "admin" && (user.status || "active") === "active" && status === "suspended") {
            const activeAdmins = await Users.countDocuments({ role: "admin", $or: [{ status: "active" }, { status: { $exists: false } }] });
            if (activeAdmins <= 1) return res.status(409).json({ message: "The last active administrator cannot be suspended" });
        }
        user.status = status;
        await user.save();
        return res.status(200).json({ message: status === "suspended" ? "User suspended" : "User reactivated", user: { id: user._id.toString(), status: user.status } });
    } catch {
        return res.status(500).json({ message: "Could not update user status. Please try again." });
    }
}

async function changeUserRole(req, res) {
    if (!validUserId(req.params.id)) return res.status(400).json({ message: "Invalid user ID" });
    const { role } = req.body || {};
    if (!allowedUserRoles.includes(role)) return res.status(400).json({ message: "Role must be user or admin" });

    try {
        const user = await Users.findById(req.params.id).select("_id role status");
        if (!user) return res.status(404).json({ message: "User not found" });
        if (user._id.toString() === req.user._id.toString() && role !== "admin") {
            return res.status(400).json({ message: "You cannot remove your own administrator role" });
        }
        if (user.role === "admin" && role === "user" && (user.status || "active") === "active") {
            const activeAdmins = await Users.countDocuments({ role: "admin", $or: [{ status: "active" }, { status: { $exists: false } }] });
            if (activeAdmins <= 1) return res.status(409).json({ message: "The last active administrator cannot be demoted" });
        }
        user.role = role;
        await user.save();
        return res.status(200).json({ message: "User role updated", user: { id: user._id.toString(), role: user.role } });
    } catch {
        return res.status(500).json({ message: "Could not update user role. Please try again." });
    }
}

async function getDashboardStats(req, res) {
    try {
        const [totalUsers, totalEvents, totalBookings, paidBookingStats] = await Promise.all([
            Users.countDocuments(),
            Event.countDocuments(),
            Booking.countDocuments(),
            Booking.aggregate([
                {
                    $match: {
                        paymentStatus: "paid",
                        bookingStatus: "confirmed",
                        paymentVerifiedAt: { $type: "date" },
                        razorpayAmount: { $type: "number" },
                    },
                },
                {
                    $group: {
                        _id: null,
                        count: { $sum: 1 },
                        revenueInPaise: { $sum: "$razorpayAmount" },
                    },
                },
            ]),
        ]);

        const paidStats = paidBookingStats[0] || { count: 0, revenueInPaise: 0 };

        return res.status(200).json({
            stats: {
                totalUsers,
                totalEvents,
                totalBookings,
                paidBookings: paidStats.count,
                verifiedRevenue: paidStats.revenueInPaise / 100,
                currency: "INR",
            },
        });
    } catch {
        return res.status(500).json({
            message: "Could not load dashboard statistics. Please try again.",
        });
    }
}

module.exports = { getDashboardStats, getAdminUsers, changeUserStatus, changeUserRole };
