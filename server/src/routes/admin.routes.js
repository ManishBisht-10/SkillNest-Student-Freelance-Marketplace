import express from "express";
import { verifyToken, checkRole } from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/validateRequest.js";

import {
  getDashboard,
  listUsers,
  banUser,
  activateUser,
  listAllJobs,
  deleteJob,
  listAllContracts,
  listDisputes,
  resolveDispute,
  listTransactions,
  listAllReviews,
  deleteReview,
} from "../controllers/admin.controller.js";

import {
  userIdParamValidator,
  jobIdParamValidator,
  contractIdParamValidator,
  reviewIdParamValidator,
  banUserValidator,
  activateUserValidator,
  listUsersQueryValidator,
  listTransactionsQueryValidator,
  resolveDisputeValidator,
} from "../validators/admin.validators.js";

const router = express.Router();

router.use(verifyToken, checkRole("admin"));

router.get("/dashboard", getDashboard);

router.get("/users", listUsersQueryValidator, validateRequest, listUsers);
router.put(
  "/users/:id/ban",
  userIdParamValidator,
  banUserValidator,
  validateRequest,
  banUser
);
router.put(
  "/users/:id/activate",
  userIdParamValidator,
  activateUserValidator,
  validateRequest,
  activateUser
);

router.get("/jobs", listAllJobs);
router.delete("/jobs/:id", jobIdParamValidator, validateRequest, deleteJob);

router.get("/contracts", listAllContracts);
router.get("/disputes", listDisputes);
router.put(
  "/disputes/:id/resolve",
  contractIdParamValidator,
  resolveDisputeValidator,
  validateRequest,
  resolveDispute
);

router.get(
  "/transactions",
  listTransactionsQueryValidator,
  validateRequest,
  listTransactions
);

router.get("/reviews", listAllReviews);
router.delete("/reviews/:id", reviewIdParamValidator, validateRequest, deleteReview);

export default router;
