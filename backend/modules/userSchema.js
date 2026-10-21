
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            default: "",
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },

        password: {
            type: String,
            required: true,
            minlength: 6,
        },

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },
        status: {
            type: String,
            enum: ["active", "suspended"],
            default: "active",
        },
        passwordReset: {
            otpHash: { type: String, default: null },
            otpExpiresAt: { type: Date, default: null },
            otpAttempts: { type: Number, default: 0 },
            otpRequestedAt: { type: Date, default: null },
            otpWindowStartedAt: { type: Date, default: null },
            otpRequestCount: { type: Number, default: 0 },
            tokenHash: { type: String, default: null },
            tokenExpiresAt: { type: Date, default: null },
        },
    },
    {
        timestamps: true,
    }
);

// Hash the password before saving a new user or a changed password.
userSchema.pre("save", async function () {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 12);
});

const Users = mongoose.model("User", userSchema);

module.exports = Users;
