const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { sendPasswordResetEmail, getSafeEmailError } = require("../services/emailService");

const isDevelopment = () => (!process.env.NODE_ENV || process.env.NODE_ENV === "development") && !process.env.VERCEL;
const traceReset = (message) => {
  if (isDevelopment()) console.info(`[password-reset] ${message}`);
};

const TTL_MS = 10 * 60 * 1000;
const COOLDOWN_MS = 60 * 1000;
const MAX_ATTEMPTS = 5;
const normalizeEmail = (email) => typeof email === "string" ? email.trim().toLowerCase() : "";
const validEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const hashToken = (token) => crypto.createHash("sha256").update(token).digest("hex");
const clearedState = {
  passwordResetOtpHash: null,
  passwordResetOtpExpiresAt: null,
  passwordResetSentAt: null,
  passwordResetAttempts: 0,
  passwordResetTokenHash: null,
  passwordResetTokenExpiresAt: null,
};
const invalidCode = (res) => res.status(400).json({ success: false, message: "Invalid or expired reset code. Request a new code if needed." });
const invalidToken = (res) => res.status(400).json({ success: false, message: "Invalid or expired reset authorization. Please request a new code." });

const requestPasswordReset = async (req, res) => {
  traceReset("request received");
  res.set("Cache-Control", "no-store");
  const email = normalizeEmail(req.body?.email);
  if (!validEmail(email)) {
    return res.status(400).json({ success: false, message: "Enter a valid email address." });
  }
  try {
    // Hash even for unknown addresses; never disclose account or delivery status.
    const otp = crypto.randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 10);
    const now = new Date();
    const user = await User.findOneAndUpdate({
      email,
      $or: [
        { passwordResetSentAt: null },
        { passwordResetSentAt: { $lte: new Date(now.getTime() - COOLDOWN_MS) } },
      ],
    }, { $set: {
      ...clearedState,
      passwordResetOtpHash: otpHash,
      passwordResetOtpExpiresAt: new Date(now.getTime() + TTL_MS),
      passwordResetSentAt: now,
    } }, { new: true });
    if (user) {
      traceReset("matching user found: true");
      traceReset("OTP generated; only bcrypt hash persisted with reset expiry");
      traceReset("reset state persisted");
      try {
        traceReset("attempting email delivery");
        const delivery = await sendPasswordResetEmail({ recipient: user.email, name: user.name, otp, expiresInMinutes: 10 });
        traceReset(delivery?.accepted ? "email delivery accepted by SMTP" : "email send completed; SMTP acceptance not confirmed");
      } catch (error) {
        console.error("[password-reset] email delivery failed", getSafeEmailError(error));
        // Conditional cleanup cannot erase a newer reset attempt.
        try {
          const cleanup = await User.updateOne({ _id: user._id, passwordResetOtpHash: otpHash }, { $set: clearedState });
          traceReset(cleanup.modifiedCount === 1 ? "failed reset state cleared" : "cleanup skipped: reset state already changed");
        } catch {
          console.error("[password-reset] failed reset state cleanup could not be saved");
        }
      }
    } else if (isDevelopment()) {
      // Diagnose cooldown versus absent account without changing the public response.
      const matchingUser = await User.findOne({ email }).select("_id");
      traceReset(`matching user found: ${Boolean(matchingUser)}`);
      if (matchingUser) traceReset("email not sent: resend cooldown or concurrent reset request");
    }
  } catch {
    console.error("[password-reset] request failed during database lookup or reset-state persistence");
  }
  return res.status(200).json({
    success: true,
    message: "If an account exists for this email, a password reset code has been sent.",
    expiresInSeconds: 600,
    resendCooldownSeconds: 60,
  });
};

const verifyPasswordResetOtp = async (req, res) => {
  res.set("Cache-Control", "no-store");
  const email = normalizeEmail(req.body?.email);
  const otp = typeof req.body?.otp === "string" ? req.body.otp.trim() : "";
  if (!validEmail(email) || !/^\d{6}$/.test(otp)) return invalidCode(res);
  try {
    // Reserve an attempt atomically so concurrent guesses cannot bypass the limit.
    const user = await User.findOneAndUpdate({
      email,
      passwordResetOtpHash: { $ne: null },
      passwordResetOtpExpiresAt: { $gt: new Date() },
      passwordResetAttempts: { $lt: MAX_ATTEMPTS },
    }, { $inc: { passwordResetAttempts: 1 } }, { new: true }).select("+passwordResetOtpHash");
    if (!user || !await bcrypt.compare(otp, user.passwordResetOtpHash)) return invalidCode(res);

    const resetToken = crypto.randomBytes(32).toString("hex");
    const result = await User.updateOne({
      _id: user._id,
      passwordResetOtpHash: user.passwordResetOtpHash,
      passwordResetOtpExpiresAt: { $gt: new Date() },
    }, { $set: {
      passwordResetOtpHash: null,
      passwordResetOtpExpiresAt: null,
      passwordResetTokenHash: hashToken(resetToken),
      passwordResetTokenExpiresAt: new Date(Date.now() + TTL_MS),
    } });
    if (result.modifiedCount !== 1) return invalidCode(res);
    return res.json({ success: true, resetToken, expiresInSeconds: 600 });
  } catch {
    return res.status(500).json({ success: false, message: "Could not verify the reset code. Please try again." });
  }
};

const resetPassword = async (req, res) => {
  res.set("Cache-Control", "no-store");
  const { resetToken, newPassword } = req.body || {};
  if (typeof resetToken !== "string" || !/^[a-f0-9]{64}$/.test(resetToken)) return invalidToken(res);
  if (typeof newPassword !== "string" || newPassword.length < 8) {
    return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });
  }
  try {
    const tokenHash = hashToken(resetToken);
    const user = await User.findOne({ passwordResetTokenHash: tokenHash, passwordResetTokenExpiresAt: { $gt: new Date() } });
    if (!user) return invalidToken(res);
    // Same controller-owned bcrypt strategy as signup; the model has no hashing hook.
    const password = await bcrypt.hash(newPassword, 10);
    // Password change and token consumption must be one atomic database write.
    const result = await User.updateOne({
      _id: user._id,
      passwordResetTokenHash: tokenHash,
      passwordResetTokenExpiresAt: { $gt: new Date() },
    }, { $set: { password, ...clearedState } }, { runValidators: true });
    if (result.modifiedCount !== 1) return invalidToken(res);
    return res.json({ success: true, message: "Password reset successfully." });
  } catch {
    return res.status(500).json({ success: false, message: "Could not reset your password. Please try again." });
  }
};

module.exports = { requestPasswordReset, verifyPasswordResetOtp, resetPassword };
