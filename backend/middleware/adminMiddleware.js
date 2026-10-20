const authMiddleware = require("./authmiddleware");

// Authenticate first, then authorize using the user record loaded from MongoDB.
function adminMiddleware(req, res, next) {
    return authMiddleware(req, res, () => {
        if (req.user.role !== "admin") {
            return res.status(403).json({ message: "Administrator access required" });
        }

        return next();
    });
}

module.exports = adminMiddleware;
