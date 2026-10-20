
const jwt = require("jsonwebtoken");
const Users = require("../modules/userSchema.js");

async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                message: "Authentication token required",
            });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        const user = await Users.findById(decoded.userId).select(
            "-password"
        );

        if (!user) {
            return res.status(401).json({
                message: "User no longer exists",
            });
        }

        // Missing status is treated as active for accounts created before this field existed.
        if (user.status && user.status !== "active") {
            return res.status(403).json({ message: "This account is suspended" });
        }

        req.user = user;

        next();
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                message: "Invalid or expired token",
            });
        }

        next(error);
    }
}

module.exports = authMiddleware;
