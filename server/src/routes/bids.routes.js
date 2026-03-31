import express from "express";

import { verifyToken } from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/validateRequest.js";

import {
  createBid,
  getBidsForJob,
  getMyBids,
  acceptBid,
  rejectBid,
} from "../controllers/bids.controller.js";

import {
  createBidValidator,
  bidIdParamValidator,
  jobIdParamValidator,
} from "../validators/bids.validators.js";

const router = express.Router();

router.post("/", verifyToken, createBidValidator, validateRequest, createBid);
router.get("/my", verifyToken, getMyBids);
router.get(
  "/job/:jobId",
  verifyToken,
  jobIdParamValidator,
  validateRequest,
  getBidsForJob
);
router.put(
  "/:id/accept",
  verifyToken,
  bidIdParamValidator,
  validateRequest,
  acceptBid
);
router.put(
  "/:id/reject",
  verifyToken,
  bidIdParamValidator,
  validateRequest,
  rejectBid
);

export default router;

