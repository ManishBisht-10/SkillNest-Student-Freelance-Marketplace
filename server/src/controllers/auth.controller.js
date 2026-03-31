import bcrypt from "bcryptjs";
import crypto from "crypto";
import jwt from "jsonwebtoken";

import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createOtpCode, sha256 } from "../utils/otp.js";
import { sendOtpEmail } from "../services/email.service.js";
import { signAccessToken, signRefreshToken } from "../utils/jwt.js";

import User from "../models/User.model.js";
import OtpCode from "../models/OtpCode.model.js";
import RefreshToken from "../models/RefreshToken.model.js";

const OTP_EXPIRES_MS = 10 * 60 * 1000; // 10 minutes
const REFRESH_EXPIRES_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

async function issueTokensForUser(user) {
  const accessToken = signAccessToken(user);

  const tokenId = crypto.randomUUID();
  const refreshToken = signRefreshToken(user, tokenId);
  const tokenHash = sha256(refreshToken);

  await RefreshToken.create({
    userId: user._id,
    tokenId,
    tokenHash,
    expiresAt: new Date(Date.now() + REFRESH_EXPIRES_MS),
  });

  return { accessToken, refreshToken };
}

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(409, "Email already registered");
  if (role === "admin") {
    throw new ApiError(400, "Invalid role for signup");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({
    name,
    email,
    passwordHash,
    role,
    isVerified: false,
    isActive: true,
  });

  // Create OTP for email verification
  const { code, codeHash } = await createOtpCode();
  const otp = await OtpCode.create({
    userId: user._id,
    email: user.email,
    purpose: "verify_email",
    codeHash,
    expiresAt: new Date(Date.now() + OTP_EXPIRES_MS),
  });

  await sendOtpEmail({ to: user.email, code, purpose: otp.purpose });

  return res.status(201).json({
    message: "OTP sent. Verify your email to continue.",
  });
});

export const verifyOtp = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(404, "User not found");

  const otpDoc = await OtpCode.findOne({
    email,
    purpose: "verify_email",
    usedAt: null,
    expiresAt: { $gt: new Date() },
    userId: user._id,
  }).sort({ createdAt: -1 });

  if (!otpDoc) throw new ApiError(400, "OTP expired or invalid");

  const isValid = await bcrypt.compare(otp, otpDoc.codeHash);
  if (!isValid) throw new ApiError(400, "OTP expired or invalid");

  otpDoc.usedAt = new Date();
  await otpDoc.save();

  user.isVerified = true;
  await user.save();

  const tokens = await issueTokensForUser(user);
  return res.status(200).json({
    message: "Email verified successfully",
    ...tokens,
  });
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    // Don’t reveal whether email exists
    return res.status(200).json({ message: "If registered, OTP will be sent" });
  }

  if (user.isVerified) {
    return res.status(200).json({ message: "Email already verified" });
  }

  // Invalidate previous unused OTPs
  await OtpCode.updateMany(
    { email, purpose: "verify_email", usedAt: null },
    { usedAt: new Date() }
  );

  const { code, codeHash } = await createOtpCode();
  await OtpCode.create({
    userId: user._id,
    email: user.email,
    purpose: "verify_email",
    codeHash,
    expiresAt: new Date(Date.now() + OTP_EXPIRES_MS),
  });

  await sendOtpEmail({ to: user.email, code, purpose: "verify_email" });

  return res.status(200).json({ message: "OTP resent. Verify to continue." });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid email or password");
  }
  if (!user.isVerified) {
    throw new ApiError(401, "Email not verified");
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new ApiError(401, "Invalid email or password");

  const tokens = await issueTokensForUser(user);
  return res.status(200).json({ message: "Login successful", ...tokens });
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new ApiError(401, "Refresh token required");

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new ApiError(401, "Invalid refresh token");
  }

  const { sub: userId, tokenId } = payload || {};
  if (!userId || !tokenId) throw new ApiError(401, "Invalid refresh token");

  const user = await User.findById(userId);
  if (!user) throw new ApiError(401, "Invalid refresh token");

  const tokenHash = sha256(refreshToken);
  const stored = await RefreshToken.findOne({
    userId: user._id,
    tokenId,
    revokedAt: null,
  });

  if (!stored) throw new ApiError(401, "Invalid refresh token");
  if (stored.expiresAt <= new Date()) throw new ApiError(401, "Refresh token expired");
  if (stored.tokenHash !== tokenHash) throw new ApiError(401, "Invalid refresh token");

  // Rotation: revoke old refresh token and issue a new one
  stored.revokedAt = new Date();
  await stored.save();

  const tokens = await issueTokensForUser(user);
  return res.status(200).json({ message: "Token refreshed", ...tokens });
});

export const logout = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(200).json({ message: "Logged out" });

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch {
    // If invalid, there is nothing we can revoke; treat as logged out.
    return res.status(200).json({ message: "Logged out" });
  }

  const { sub: userId, tokenId } = payload || {};
  if (!userId || !tokenId) return res.status(200).json({ message: "Logged out" });

  const user = await User.findById(userId);
  if (!user) return res.status(200).json({ message: "Logged out" });

  const tokenHash = sha256(refreshToken);

  const stored = await RefreshToken.findOne({
    userId: user._id,
    tokenId,
    revokedAt: null,
    tokenHash,
  });

  if (stored) {
    stored.revokedAt = new Date();
    await stored.save();
  }

  return res.status(200).json({ message: "Logged out" });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  // Don’t reveal whether the user exists.
  if (!user) {
    return res.status(200).json({ message: "If account exists, OTP sent" });
  }

  const { code, codeHash } = await createOtpCode();

  await OtpCode.updateMany(
    { email, purpose: "forgot_password", usedAt: null },
    { usedAt: new Date() }
  );

  await OtpCode.create({
    userId: user._id,
    email: user.email,
    purpose: "forgot_password",
    codeHash,
    expiresAt: new Date(Date.now() + OTP_EXPIRES_MS),
  });

  await sendOtpEmail({ to: user.email, code, purpose: "forgot_password" });

  return res.status(200).json({ message: "If account exists, OTP sent" });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({ email });
  if (!user) throw new ApiError(400, "Invalid OTP or email");

  const otpDoc = await OtpCode.findOne({
    email,
    purpose: "forgot_password",
    usedAt: null,
    expiresAt: { $gt: new Date() },
    userId: user._id,
  }).sort({ createdAt: -1 });

  if (!otpDoc) throw new ApiError(400, "Invalid OTP or email");

  const isValid = await bcrypt.compare(otp, otpDoc.codeHash);
  if (!isValid) throw new ApiError(400, "Invalid OTP or email");

  otpDoc.usedAt = new Date();
  await otpDoc.save();

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  await user.save();

  // Security: revoke all active refresh tokens after password reset
  await RefreshToken.updateMany(
    { userId: user._id, revokedAt: null },
    { revokedAt: new Date() }
  );

  return res.status(200).json({ message: "Password reset successful" });
});

export default {};

