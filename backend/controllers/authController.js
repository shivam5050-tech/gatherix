
const Users = require("../modules/userSchema.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendWelcomeEmail } = require("../services/emailService");

// Signup
async function signup(req, res, next) {
    try {
        const body = req.body && typeof req.body === "object" ? req.body : {};
        const name = typeof body.name === "string" ? body.name.trim() : "";
        const password = body.password;
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "Name, email, and password are required",
            });
        }

        if (name.length > 100) {
            return res.status(400).json({ message: "Name must be 100 characters or fewer" });
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            return res.status(400).json({ message: "Please enter a valid email address" });
        }

        if (typeof password !== "string" || password.length < 8 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
            return res.status(400).json({
                message: "Password must be at least 8 characters and include uppercase, lowercase, and a number",
            });
        }

        const existingUser = await Users.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered",
            });
        }

        const user = await Users.create({ name, email, password });
        let welcomeEmailSent = false;

        try {
            welcomeEmailSent = await sendWelcomeEmail(user.email, user.name);
        } catch (emailError) {
            // Do not let mail provider details or a delivery failure affect signup.
            console.error("Welcome email could not be sent", { code: emailError.code || "EMAIL_SEND_FAILED" });
        }

        return res.status(201).json({
            message: welcomeEmailSent
                ? "Signup successful. A welcome email is on its way."
                : "Signup successful, but the welcome email could not be sent. You can still log in.",
            welcomeEmailSent,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
            },
        });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: "Email already registered" });
        }
        next(error);
    }
}

// Login
async function login(req, res, next) {
    try {
        const body = req.body && typeof req.body === "object" ? req.body : {};
        const password = body.password;
        const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

        if (!email || typeof password !== "string" || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        const user = await Users.findOne({ email });

        // Use the same message for unknown emails and wrong passwords.
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        if (user.status && user.status !== "active") {
            return res.status(401).json({ message: "This account is suspended. Contact support for assistance." });
        }

        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    signup,
    login,
};
