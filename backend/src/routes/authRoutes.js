const express = require("express");

const {
  signup,
  login,
  verifyEmail,
  resendVerification,
} = require("../controllers/authController");

const router = express.Router();
const { requestPasswordReset, verifyPasswordResetOtp, resetPassword } = require("../controllers/passwordResetController");

router.post("/forgot-password", requestPasswordReset);
router.post("/verify-password-reset-otp", verifyPasswordResetOtp);
router.post("/reset-password", resetPassword);

// Signup
router.post("/signup", signup);

// Login
router.post("/login", login);

// Verify email
router.post("/verify-email", verifyEmail);

// Resend verification code
router.post("/resend-verification", resendVerification);

module.exports = router;
