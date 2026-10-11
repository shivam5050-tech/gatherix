
const Users = require("../modules/userSchema.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Signup
async function signup(req, res, next) {
    try {
        const { password } = req.body;
        const email = req.body.email?.trim().toLowerCase();

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required",
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must be at least 6 characters",
            });
        }

        const existingUser = await Users.findOne({ email });

        if (existingUser) {
            return res.status(409).json({
                message: "Email already registered",
            });
        }

        const user = await Users.create({ email, password });

        return res.status(201).json({
            message: "Signup successful",
            user: {
                id: user._id,
                email: user.email,
            },
        });
    } catch (error) {
        next(error);
    }
}

// Login
async function login(req, res, next) {
    try {
        const { password } = req.body;
        const email = req.body.email?.trim().toLowerCase();

        if (!email || !password) {
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
