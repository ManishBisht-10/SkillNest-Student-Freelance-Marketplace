import express from "express";
import { verifyToken } from "../middlewares/auth.middleware.js";
import { uploadChatAttachment } from "../middlewares/chatUpload.middleware.js";
import validateRequest from "../middlewares/validateRequest.js";

import {
  getRooms,
  getRoomMessages,
  sendRoomMessage,
  uploadRoomAttachment,
} from "../controllers/chat.controller.js";

import {
  roomIdParamValidator,
  listRoomMessagesQueryValidator,
  sendMessageValidator,
} from "../validators/chat.validators.js";

const router = express.Router();

router.get("/rooms", verifyToken, getRooms);

router.get(
  "/rooms/:id",
  verifyToken,
  roomIdParamValidator,
  listRoomMessagesQueryValidator,
  validateRequest,
  getRoomMessages
);

router.post(
  "/rooms/:id/messages",
  verifyToken,
  sendMessageValidator,
  validateRequest,
  sendRoomMessage
);

router.post(
  "/rooms/:id/upload",
  verifyToken,
  roomIdParamValidator,
  validateRequest,
  uploadChatAttachment.single("file"),
  uploadRoomAttachment
);

export default router;
