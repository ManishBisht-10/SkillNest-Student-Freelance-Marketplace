import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/validateRequest.js";

import {
  getMyContracts,
  getContractById,
  completeMilestone,
  completeContract,
  approveContract,
  disputeContract,
} from "../controllers/contracts.controller.js";

import {
  contractIdParamValidator,
  milestoneCompleteValidator,
  disputeValidator,
} from "../validators/contracts.validators.js";

const router = express.Router();

router.get("/my", verifyToken, getMyContracts);

router.get(
  "/:id",
  verifyToken,
  contractIdParamValidator,
  validateRequest,
  getContractById
);

router.put(
  "/:id/milestone/:mId/complete",
  verifyToken,
  milestoneCompleteValidator,
  validateRequest,
  completeMilestone
);

router.put(
  "/:id/complete",
  verifyToken,
  contractIdParamValidator,
  validateRequest,
  completeContract
);

router.put(
  "/:id/approve",
  verifyToken,
  contractIdParamValidator,
  validateRequest,
  approveContract
);

router.put(
  "/:id/dispute",
  verifyToken,
  contractIdParamValidator,
  disputeValidator,
  validateRequest,
  disputeContract
);

export default router;
