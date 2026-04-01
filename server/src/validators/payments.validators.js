import { body, param } from "express-validator";

export const initiatePaymentValidator = [
  body("contractId").isMongoId().withMessage("Invalid contract id"),
];

export const verifyPaymentValidator = [
  body("razorpay_order_id").isString().trim().notEmpty(),
  body("razorpay_payment_id").isString().trim().notEmpty(),
  body("razorpay_signature").isString().trim().notEmpty(),
];

export const releaseParamValidator = [
  param("contractId").isMongoId().withMessage("Invalid contract id"),
];
