import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import validateRequest from "../middlewares/validateRequest.js";

import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../controllers/notifications.controller.js";

import { notificationIdParamValidator } from "../validators/notifications.validators.js";

const router = express.Router();

router.get("/", verifyToken, listNotifications);

// Must be before `/:id/read` so "read-all" is not captured as :id
router.put("/read-all", verifyToken, markAllNotificationsRead);

router.put(
  "/:id/read",
  verifyToken,
  notificationIdParamValidator,
  validateRequest,
  markNotificationRead
);

export default router;
