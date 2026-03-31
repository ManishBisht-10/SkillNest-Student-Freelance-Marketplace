import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/validateRequest.js";

import {
  createJob,
  listJobs,
  getJobById,
  updateJob,
  cancelJob,
  getMyPostedJobs,
  getMyAssignedJobs,
} from "../controllers/jobs.controller.js";

import {
  createJobValidator,
  jobIdParamValidator,
  listJobsValidator,
  updateJobValidator,
} from "../validators/jobs.validators.js";

const router = express.Router();

router.post("/", verifyToken, createJobValidator, validateRequest, createJob);

router.get("/", verifyToken, listJobsValidator, validateRequest, listJobs);
router.get("/:id", verifyToken, jobIdParamValidator, validateRequest, getJobById);

router.put(
  "/:id",
  verifyToken,
  updateJobValidator,
  validateRequest,
  updateJob
);

router.delete(
  "/:id",
  verifyToken,
  jobIdParamValidator,
  validateRequest,
  cancelJob
);

router.get("/my/posted", verifyToken, getMyPostedJobs);
router.get("/my/assigned", verifyToken, getMyAssignedJobs);

export default router;

