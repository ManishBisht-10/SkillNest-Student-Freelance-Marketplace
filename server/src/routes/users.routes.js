import express from "express";
import { checkRole, verifyToken } from "../middlewares/auth.middleware.js";
import { uploadAvatar } from "../middlewares/avatarUpload.middleware.js";

import validateRequest from "../middlewares/validateRequest.js";
import {
  getMe,
  updateMe,
  uploadMeAvatar,
  getPlatformStats,
  getStudentPublicProfile,
  getConsumerPublicProfile,
} from "../controllers/users.controller.js";

import {
  paramUserIdValidator,
  updateMeValidator,
} from "../validators/users.validators.js";

const router = express.Router();

router.get("/me", verifyToken, getMe);
router.put("/me", verifyToken, updateMeValidator, validateRequest, updateMe);
router.post(
  "/me/avatar",
  verifyToken,
  uploadAvatar.single("avatar"),
  uploadMeAvatar
);

router.get("/platform-stats", getPlatformStats);

router.get(
  "/student/:id",
  ...paramUserIdValidator,
  getStudentPublicProfile
);

router.get(
  "/consumer/:id",
  ...paramUserIdValidator,
  getConsumerPublicProfile
);

export default router;

