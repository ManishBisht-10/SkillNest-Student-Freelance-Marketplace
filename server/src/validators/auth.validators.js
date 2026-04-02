import { body } from "express-validator";

export const registerValidator = [
  body("name").isString().trim().isLength({ min: 2, max: 100 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 8, max: 200 }),
  body("role").isIn(["student", "consumer"]),
];

export const verifyOtpValidator = [
  body("email").isEmail().normalizeEmail(),
  body("otp").isString().trim().isLength({ min: 6, max: 6 }).matches(/^\d{6}$/),
];

export const resendOtpValidator = [
  body("email").isEmail().normalizeEmail(),
];

export const loginValidator = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().isLength({ min: 1, max: 200 }),
];

export const refreshTokenValidator = [
  body("refreshToken").isString().trim().notEmpty(),
];

export const logoutValidator = [
  body("refreshToken").optional().isString().trim().notEmpty(),
];

export const forgotPasswordValidator = [
  body("email").isEmail().normalizeEmail(),
];

export const resetPasswordValidator = [
  body("email").isEmail().normalizeEmail(),
  body("otp").isString().trim().isLength({ min: 6, max: 6 }).matches(/^\d{6}$/),
  body("newPassword").isString().isLength({ min: 8, max: 200 }),
];

