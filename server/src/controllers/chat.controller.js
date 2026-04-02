import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import ChatRoom from "../models/ChatRoom.model.js";
import Message from "../models/Message.model.js";
import Notification from "../models/Notification.model.js";
import { getIO } from "../socket/index.js";
import { sanitizeChatText } from "../socket/utils/sanitizeChat.js";
import { uploadChatAttachmentToStorage } from "../services/cloudinary.service.js";

async function getRoomIfParticipant(roomId, userId) {
  const room = await ChatRoom.findById(roomId)
    .populate({
      path: "contractId",
      populate: { path: "jobId", select: "title status category" },
    })
    .populate("participants", "name avatar role");

  if (!room) throw new ApiError(404, "Chat room not found");

  const isParticipant = room.participants.some((p) => String(p._id) === String(userId));
  if (!isParticipant) throw new ApiError(403, "Forbidden");

  return room;
}

export const getRooms = asyncHandler(async (req, res) => {
  const rooms = await ChatRoom.find({ participants: req.user.id })
    .sort({ updatedAt: -1 })
    .populate({
      path: "contractId",
      select: "status paymentStatus",
      populate: { path: "jobId", select: "title status category" },
    })
    .populate("participants", "name avatar role");

  return res.status(200).json(rooms);
});

export const getRoomMessages = asyncHandler(async (req, res) => {
  const roomId = req.params.id;
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 30;

  const room = await getRoomIfParticipant(roomId, req.user.id);

  const [items, total] = await Promise.all([
    Message.find({ chatRoomId: roomId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("senderId", "name avatar role"),
    Message.countDocuments({ chatRoomId: roomId }),
  ]);

  return res.status(200).json({
    room,
    page,
    limit,
    total,
    items,
  });
});

export const sendRoomMessage = asyncHandler(async (req, res) => {
  const roomId = req.params.id;
  const room = await getRoomIfParticipant(roomId, req.user.id);

  const text = sanitizeChatText(req.body.text || "");
  const attachmentUrl =
    typeof req.body.attachmentUrl === "string"
      ? req.body.attachmentUrl.trim().slice(0, 2000)
      : "";

  if (!text && !attachmentUrl) {
    throw new ApiError(400, "Message must include text or attachmentUrl");
  }

  const created = await Message.create({
    chatRoomId: roomId,
    senderId: req.user.id,
    text,
    attachmentUrl,
  });

  const message = await Message.findById(created._id).populate(
    "senderId",
    "name avatar role"
  );

  const io = getIO();
  if (io) {
    io.to(`room:${roomId}`).emit("receive_message", message.toObject());
  }

  const other = room.participants.find((p) => String(p._id) !== String(req.user.id));
  if (other) {
    const notif = await Notification.create({
      userId: other._id,
      message: "You have a new chat message",
      type: "chat",
      link: `/chat/${roomId}`,
    });

    if (io) {
      io.to(`user:${other._id}`).emit("notification", notif.toObject());
    }
  }

  return res.status(201).json(message);
});

export const uploadRoomAttachment = asyncHandler(async (req, res) => {
  const roomId = req.params.id;
  await getRoomIfParticipant(roomId, req.user.id);

  if (!req.file) {
    throw new ApiError(400, "Attachment file is required");
  }

  const attachmentUrl = await uploadChatAttachmentToStorage({
    buffer: req.file.buffer,
    originalname: req.file.originalname,
    mimetype: req.file.mimetype,
  });

  return res.status(200).json({ attachmentUrl });
});
