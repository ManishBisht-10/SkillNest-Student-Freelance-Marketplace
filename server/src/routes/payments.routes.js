import express from "express";
import { verifyToken, checkRole } from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/validateRequest.js";

import {
  initiatePayment,
  verifyPayment,
  paymentWebhook,
  releasePaymentAdmin,
} from "../controllers/payments.controller.js";

import {
  initiatePaymentValidator,
  verifyPaymentValidator,
  releaseParamValidator,
} from "../validators/payments.validators.js";

const router = express.Router();

router.post(
  "/initiate",
  verifyToken,
  initiatePaymentValidator,
  validateRequest,
  initiatePayment
);

router.post(
  "/verify",
  verifyToken,
  verifyPaymentValidator,
  validateRequest,
  verifyPayment
);

router.post("/webhook", paymentWebhook);

router.post(
  "/release/:contractId",
  verifyToken,
  checkRole("admin"),
  releaseParamValidator,
  validateRequest,
  releasePaymentAdmin
);

export default router;
