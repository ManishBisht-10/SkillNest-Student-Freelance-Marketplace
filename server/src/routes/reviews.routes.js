import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/validateRequest.js";

import { createReview, getReviewsForUser } from "../controllers/reviews.controller.js";
import {
  createReviewValidator,
  userIdParamValidator,
} from "../validators/reviews.validators.js";

const router = express.Router();

router.post(
  "/",
  verifyToken,
  createReviewValidator,
  validateRequest,
  createReview
);

router.get(
  "/user/:userId",
  userIdParamValidator,
  validateRequest,
  getReviewsForUser
);

export default router;
