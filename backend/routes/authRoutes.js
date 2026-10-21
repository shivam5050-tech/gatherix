const express = require("express");

const {
    signup,
    login,
    requestPasswordReset,
    verifyPasswordResetOtp,
    resetPassword,
} = require("../controllers/authController");

const router = express.Router();

router.post("/signup", signup);

router.post("/login", login);
router.post("/password-reset/request", requestPasswordReset);
router.post("/password-reset/verify", verifyPasswordResetOtp);
router.post("/password-reset/reset", resetPassword);

module.exports = router;
