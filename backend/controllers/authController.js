
const Users = require("../modules/userSchema.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("node:crypto");
const { sendWelcomeEmail, sendPasswordResetOtp } = require("../services/emailService");

const RESET_GENERIC_MESSAGE = "If an account exists for that email, a verification code has been sent.";
const RESET_FIELD = "passwordReset";
function hashResetValue(value) {
    return crypto.createHmac("sha256", process.env.JWT_SECRET).update(value).digest("hex");
}
function resetPasswordState() {
    return { otpHash: null, otpExpiresAt: null, otpAttempts: 0, otpRequestedAt: null, otpWindowStartedAt: null, otpRequestCount: 0, tokenHash: null, tokenExpiresAt: null };
}
function validPassword(password) {
    return typeof password === "string" && password.length >= 8 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password);
}

async function requestPasswordReset(req, res, next) {
    try {
        const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(200).json({ message: RESET_GENERIC_MESSAGE });
        const user = await Users.findOne({ email });
        if (!user) return res.status(200).json({ message: RESET_GENERIC_MESSAGE });
        const now = new Date();
        const state = user.passwordReset || {};
        const windowValid = state.otpWindowStartedAt && now - state.otpWindowStartedAt < 60 * 60 * 1000;
        if (state.otpRequestedAt && now - state.otpRequestedAt < 60 * 1000) return res.status(200).json({ message: RESET_GENERIC_MESSAGE });
        if (windowValid && state.otpRequestCount >= 3) return res.status(200).json({ message: RESET_GENERIC_MESSAGE });

        const otp = crypto.randomInt(0, 1000000).toString().padStart(6, "0");
        const nextState = {
            ...resetPasswordState(),
            otpHash: hashResetValue(otp),
            otpExpiresAt: new Date(now.getTime() + 10 * 60 * 1000),
            otpRequestedAt: now,
            otpWindowStartedAt: windowValid ? state.otpWindowStartedAt : now,
            otpRequestCount: windowValid ? (state.otpRequestCount || 0) + 1 : 1,
        };
        user.set(RESET_FIELD, nextState);
        await user.save();
        try {
            await sendPasswordResetOtp(user.email, otp);
        } catch (emailError) {
            // Avoid logging recipient, code, or mail credentials.
            console.error("Password reset email could not be sent", { code: emailError.code || "EMAIL_SEND_FAILED" });
            user.set(RESET_FIELD, resetPasswordState());
            await user.save();
        }
        return res.status(200).json({ message: RESET_GENERIC_MESSAGE });
    } catch (error) { next(error); }
}

async function verifyPasswordResetOtp(req, res, next) {
    try {
        const email = typeof req.body?.email === "string" ? req.body.email.trim().toLowerCase() : "";
        const otp = typeof req.body?.otp === "string" ? req.body.otp.trim() : "";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{6}$/.test(otp)) return res.status(400).json({ message: "The code is invalid or expired. Request a new code and try again." });
        const user = await Users.findOne({ email });
        const state = user?.passwordReset;
        if (!user || !state?.otpHash || !state.otpExpiresAt || state.otpExpiresAt <= new Date() || state.otpAttempts >= 5) return res.status(400).json({ message: "The code is invalid or expired. Request a new code and try again." });
        const attemptedHash = hashResetValue(otp);
        if (attemptedHash !== state.otpHash) {
            await Users.updateOne(
                { _id: user._id, "passwordReset.otpHash": state.otpHash, "passwordReset.otpExpiresAt": { $gt: new Date() }, "passwordReset.otpAttempts": { $lt: 5 } },
                [{ $set: { "passwordReset.otpAttempts": { $add: [{ $ifNull: ["$passwordReset.otpAttempts", 0] }, 1] }, "passwordReset.otpHash": { $cond: [{ $gte: [{ $add: [{ $ifNull: ["$passwordReset.otpAttempts", 0] }, 1] }, 5] }, null, "$passwordReset.otpHash"] } } }]
            );
            return res.status(400).json({ message: "The code is invalid or expired. Request a new code and try again." });
        }
        const resetToken = crypto.randomBytes(32).toString("base64url");
        const consumed = await Users.updateOne(
            { _id: user._id, "passwordReset.otpHash": state.otpHash, "passwordReset.otpExpiresAt": { $gt: new Date() }, "passwordReset.otpAttempts": { $lt: 5 } },
            { $set: { "passwordReset.otpHash": null, "passwordReset.otpExpiresAt": null, "passwordReset.tokenHash": hashResetValue(resetToken), "passwordReset.tokenExpiresAt": new Date(Date.now() + 10 * 60 * 1000) }, $inc: { "passwordReset.otpAttempts": 1 } }
        );
        if (!consumed.modifiedCount) return res.status(400).json({ message: "The code is invalid or expired. Request a new code and try again." });
        return res.status(200).json({ message: "Code verified. You can now reset your password.", resetToken });
    } catch (error) { next(error); }
}

async function resetPassword(req, res, next) {
    try {
        const { email, resetToken, password, confirmPassword } = req.body || {};
        const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
        if (typeof resetToken !== "string" || !resetToken || !validPassword(password) || password !== confirmPassword) return res.status(400).json({ message: "Enter matching passwords with at least 8 characters, including uppercase, lowercase, and a number." });
        const tokenHash = hashResetValue(resetToken);
        const user = await Users.findOneAndUpdate(
            { email: normalizedEmail, "passwordReset.tokenHash": tokenHash, "passwordReset.tokenExpiresAt": { $gt: new Date() } },
            { $set: { "passwordReset.tokenHash": null, "passwordReset.tokenExpiresAt": null, "passwordReset.otpHash": null, "passwordReset.otpExpiresAt": null } },
            { new: true }
        ).select("+password");
        if (!user) return res.status(400).json({ message: "This reset session is invalid or expired. Request a new code." });
        user.password = password;
        user.set(RESET_FIELD, resetPasswordState());
        await user.save();
        return res.status(200).json({ message: "Password reset successful. Please sign in with your new password." });
    } catch (error) { next(error); }
}

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
    requestPasswordReset,
    verifyPasswordResetOtp,
    resetPassword,
};
