const express = require("express");

const {
  signup,
  login,
  verifyEmail,
  resendVerification,
} = require("../controllers/authController");

const router = express.Router();

// Signup
router.post("/signup", signup);

// Login
router.post("/login", login);

// Verify email
router.post("/verify-email", verifyEmail);

// Resend verification code
router.post("/resend-verification", resendVerification);

module.exports = router;
