const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
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

    userType: {
      type: String,
      enum: ["designer", "technical", "non-technical"],
      required: true,
    },

    avatar: {
      type: String,
      default: "",
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    verificationCode: {
      type: String,
      default: null,
      select: false,
    },

    verificationCodeExpires: {
      type: Date,
      default: null,
    },

    verificationCodeSentAt: {
      type: Date,
      default: null,
    },

    emailVerificationCode: {
      type: String,
      default: null,
      select: false,
    },

    emailVerificationExpires: {
      type: Date,
      default: null,
    },
    passwordResetOtpHash: { type: String, select: false, default: null },
    passwordResetOtpExpiresAt: { type: Date, select: false, default: null },
    passwordResetSentAt: { type: Date, select: false, default: null },
    passwordResetAttempts: { type: Number, select: false, default: 0 },
    passwordResetTokenHash: { type: String, select: false, default: null },
    passwordResetTokenExpiresAt: { type: Date, select: false, default: null },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
