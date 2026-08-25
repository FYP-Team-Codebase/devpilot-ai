const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const { sendVerificationEmail } = require("../services/emailService");

const VERIFICATION_CODE_EXPIRES_IN_MINUTES = 10;
const RESEND_COOLDOWN_SECONDS = Number(
  process.env.EMAIL_VERIFICATION_RESEND_COOLDOWN_SECONDS || 60
);
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USER_TYPES = ["designer", "technical", "non-technical"];

const normalizeEmail = (email) => email?.trim().toLowerCase();

const getPublicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role,
  userType: user.userType,
  isEmailVerified: user.isEmailVerified === true,
});

const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

const generateVerificationCode = () => {
  return crypto.randomInt(100000, 1000000).toString();
};

const getVerificationExpiry = () => {
  return new Date(
    Date.now() + VERIFICATION_CODE_EXPIRES_IN_MINUTES * 60 * 1000
  );
};

const getSecondsUntilResend = (sentAt) => {
  if (!sentAt || !RESEND_COOLDOWN_SECONDS) {
    return 0;
  }

  const elapsedSeconds = Math.floor((Date.now() - sentAt.getTime()) / 1000);
  return Math.max(RESEND_COOLDOWN_SECONDS - elapsedSeconds, 0);
};

const findUserForVerification = (email) => {
  return User.findOne({ email }).select(
    "+verificationCode +emailVerificationCode"
  );
};

const getStoredVerificationCode = (user) => {
  return user.verificationCode || user.emailVerificationCode;
};

const getStoredVerificationExpiry = (user) => {
  return user.verificationCodeExpires || user.emailVerificationExpires;
};

const setVerificationCode = async (user, verificationCode) => {
  user.verificationCode = await bcrypt.hash(verificationCode, 10);
  user.verificationCodeExpires = getVerificationExpiry();
  user.verificationCodeSentAt = new Date();
  user.emailVerificationCode = null;
  user.emailVerificationExpires = null;
};

const clearVerificationCode = (user) => {
  user.verificationCode = null;
  user.verificationCodeExpires = null;
  user.verificationCodeSentAt = null;
  user.emailVerificationCode = null;
  user.emailVerificationExpires = null;
};

const shouldAutoVerifyLegacyUser = (user, rawVerificationState) => {
  return (
    user.isEmailVerified !== true &&
    rawVerificationState &&
    rawVerificationState.isEmailVerified === undefined &&
    !rawVerificationState.verificationCode &&
    !rawVerificationState.verificationCodeExpires &&
    !rawVerificationState.emailVerificationCode &&
    !rawVerificationState.emailVerificationExpires
  );
};

const sendVerificationForUser = async (user, verificationCode) => {
  await sendVerificationEmail({
    recipient: user.email,
    name: user.name,
    verificationCode,
    expiresInMinutes: VERIFICATION_CODE_EXPIRES_IN_MINUTES,
  });
};

// ==========================
// SIGNUP
// ==========================
const signup = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!name?.trim() || !normalizedEmail || !password || !userType) {
      return res.status(400).json({
        success: false,
        message: "Name, email, password and user type are required.",
      });
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    if (!USER_TYPES.includes(userType)) {
      return res.status(400).json({
        success: false,
        message: "Select a valid user type.",
      });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationCode = generateVerificationCode();

    const user = new User({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      userType,
      isEmailVerified: false,
    });

    await setVerificationCode(user, verificationCode);
    await user.save();

    try {
      await sendVerificationForUser(user, verificationCode);
    } catch (emailError) {
      console.error("Verification email error:", emailError.message);

      return res.status(500).json({
        success: false,
        message:
          "Account was created, but the verification email could not be sent. Please try resending the code.",
        requiresVerification: true,
        requiresEmailVerification: true,
        email: user.email,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Account created successfully. Please verify your email.",
      requiresVerification: true,
      requiresEmailVerification: true,
      email: user.email,
      expiresInSeconds: VERIFICATION_CODE_EXPIRES_IN_MINUTES * 60,
      resendCooldownSeconds: RESEND_COOLDOWN_SECONDS,
    });
  } catch (error) {
    console.error("Signup error:", error);

    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error during signup.",
    });
  }
};

// ==========================
// VERIFY EMAIL
// ==========================
const verifyEmail = async (req, res) => {
  try {
    const { email, code } = req.body;
    const normalizedEmail = normalizeEmail(email);
    const verificationCode = code?.trim();

    if (!normalizedEmail || !verificationCode) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required.",
      });
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    if (!/^\d{6}$/.test(verificationCode)) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code.",
      });
    }

    const user = await findUserForVerification(normalizedEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isEmailVerified) {
      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: "Email is already verified.",
        token,
        user: getPublicUser(user),
      });
    }

    const storedCode = getStoredVerificationCode(user);
    const expiresAt = getStoredVerificationExpiry(user);

    if (!storedCode || !expiresAt || expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: "Verification code has expired. Please request a new code.",
      });
    }

    const isCodeCorrect = await bcrypt.compare(verificationCode, storedCode);

    if (!isCodeCorrect) {
      return res.status(400).json({
        success: false,
        message: "Invalid verification code.",
      });
    }

    user.isEmailVerified = true;
    clearVerificationCode(user);

    await user.save();

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully.",
      token,
      user: getPublicUser(user),
    });
  } catch (error) {
    console.error("Verify email error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during email verification.",
    });
  }
};

// ==========================
// RESEND VERIFICATION
// ==========================
const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    const user = await findUserForVerification(normalizedEmail);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    if (user.isEmailVerified) {
      return res.status(200).json({
        success: true,
        message: "Email is already verified.",
      });
    }

    const retryAfterSeconds = getSecondsUntilResend(user.verificationCodeSentAt);

    if (retryAfterSeconds > 0) {
      return res.status(429).json({
        success: false,
        message: `Too many requests. Please wait ${retryAfterSeconds} seconds before requesting another code.`,
        retryAfterSeconds,
      });
    }

    const previousVerificationCode = user.verificationCode;
    const previousVerificationExpires = user.verificationCodeExpires;
    const previousVerificationSentAt = user.verificationCodeSentAt;
    const previousLegacyCode = user.emailVerificationCode;
    const previousLegacyExpires = user.emailVerificationExpires;
    const verificationCode = generateVerificationCode();

    await setVerificationCode(user, verificationCode);
    await user.save();

    try {
      await sendVerificationForUser(user, verificationCode);
    } catch (emailError) {
      user.verificationCode = previousVerificationCode;
      user.verificationCodeExpires = previousVerificationExpires;
      user.verificationCodeSentAt = previousVerificationSentAt;
      user.emailVerificationCode = previousLegacyCode;
      user.emailVerificationExpires = previousLegacyExpires;
      await user.save();

      console.error("Resend verification email error:", emailError.message);

      return res.status(500).json({
        success: false,
        message: "Verification email could not be sent. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "A new verification code has been sent.",
      expiresInSeconds: VERIFICATION_CODE_EXPIRES_IN_MINUTES * 60,
      resendCooldownSeconds: RESEND_COOLDOWN_SECONDS,
    });
  } catch (error) {
    console.error("Resend verification error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while resending verification code.",
    });
  }
};

// ==========================
// LOGIN
// ==========================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid email address.",
      });
    }

    const user = await findUserForVerification(normalizedEmail);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const rawVerificationState = await User.collection.findOne(
      { email: normalizedEmail },
      {
        projection: {
          isEmailVerified: 1,
          verificationCode: 1,
          verificationCodeExpires: 1,
          emailVerificationCode: 1,
          emailVerificationExpires: 1,
        },
      }
    );

    if (shouldAutoVerifyLegacyUser(user, rawVerificationState)) {
      user.isEmailVerified = true;
      clearVerificationCode(user);
      await user.save();
    }

    if (user.isEmailVerified !== true) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email before logging in.",
        requiresVerification: true,
        requiresEmailVerification: true,
        email: user.email,
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: getPublicUser(user),
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
};

module.exports = {
  signup,
  login,
  verifyEmail,
  resendVerification,
};
