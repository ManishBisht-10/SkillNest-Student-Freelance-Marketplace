import express from "express";
import rateLimit from "express-rate-limit";

import {
  register,
  verifyOtp,
  resendOtp,
  login,
  refreshToken,
  logout,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";

import validateRequest from "../middlewares/validateRequest.js";
import {
  registerValidator,
  verifyOtpValidator,
  resendOtpValidator,
  loginValidator,
  refreshTokenValidator,
  logoutValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} from "../validators/auth.validators.js";

const router = express.Router();

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 80,
});

router.use(authLimiter);

router.post("/register", registerValidator, validateRequest, register);
router.post("/verify-otp", verifyOtpValidator, validateRequest, verifyOtp);
router.post("/resend-otp", resendOtpValidator, validateRequest, resendOtp);

router.post("/login", loginValidator, validateRequest, login);
router.post("/refresh-token", refreshTokenValidator, validateRequest, refreshToken);
router.post("/logout", logoutValidator, validateRequest, logout);

router.post(
  "/forgot-password",
  forgotPasswordValidator,
  validateRequest,
  forgotPassword
);
router.post(
  "/reset-password",
  resetPasswordValidator,
  validateRequest,
  resetPassword
);

export default router;

