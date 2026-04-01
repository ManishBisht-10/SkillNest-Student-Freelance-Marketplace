import { Server } from "socket.io";
import jwt from "jsonwebtoken";

import ChatRoom from "../models/ChatRoom.model.js";
import Message from "../models/Message.model.js";
import Notification from "../models/Notification.model.js";
import { sanitizeChatText } from "./utils/sanitizeChat.js";

let ioInstance = null;

export function getIO() {
  return ioInstance;
}

/**
 * Emit a notification document shape to a user's personal room (for real-time UI).
 * Optionally persists to DB when `persist` is true.
 */
export async function emitNotificationToUser(userId, payload, { persist = false } = {}) {
  const io = getIO();
  if (!io) return;

  let doc = payload;
  if (persist && payload?.message && payload?.type) {
    doc = await Notification.create({
      userId,
      message: payload.message,
      type: payload.type,
      link: payload.link || "",
    });
  }

  io.to(`user:${userId}`).emit("notification", doc);
}

async function assertRoomParticipant(roomId, userId) {
  const room = await ChatRoom.findById(roomId);
  if (!room) return { error: "Room not found", room: null };
  const ok = room.participants.some((p) => String(p) === String(userId));
  if (!ok) return { error: "Forbidden", room: null };
  return { error: null, room };
}

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || "*",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.auth?.accessToken ||
        (typeof socket.handshake.headers?.authorization === "string" &&
        socket.handshake.headers.authorization.startsWith("Bearer ")
          ? socket.handshake.headers.authorization.slice(7)
          : null);

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const payload = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = payload.sub;
      socket.userRole = payload.role;
      return next();
    } catch {
      return next(new Error("Unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.userId;

    socket.join(`user:${userId}`);

    socket.on("join_room", async (payload, ack) => {
      try {
        const roomId = payload?.roomId;
        if (!roomId) {
          return ack?.({ error: "roomId required" });
        }

        const { error, room } = await assertRoomParticipant(roomId, userId);
        if (error) return ack?.({ error });

        socket.join(`room:${roomId}`);
        return ack?.({ ok: true, roomId });
      } catch (e) {
        return ack?.({ error: "join_failed" });
      }
    });

    socket.on("send_message", async (payload, ack) => {
      try {
        const roomId = payload?.roomId;
        const textRaw = payload?.text ?? "";
        const attachmentUrl = typeof payload?.attachmentUrl === "string" ? payload.attachmentUrl.trim().slice(0, 2000) : "";

        const { error, room } = await assertRoomParticipant(roomId, userId);
        if (error) return ack?.({ error });

        const text = sanitizeChatText(textRaw);
        if (!text && !attachmentUrl) {
          return ack?.({ error: "Empty message" });
        }

        const msg = await Message.create({
          chatRoomId: roomId,
          senderId: userId,
          text,
          attachmentUrl,
        });

        const populated = await Message.findById(msg._id).populate(
          "senderId",
          "name avatar role"
        );

        io.to(`room:${roomId}`).emit("receive_message", populated.toObject());

        const other = room.participants.find((p) => String(p) !== String(userId));
        if (other) {
          const notif = await Notification.create({
            userId: other,
            message: "You have a new chat message",
            type: "chat",
            link: `/chat/${roomId}`,
          });
          io.to(`user:${other}`).emit("notification", notif.toObject());
        }

        return ack?.({ ok: true, message: populated });
      } catch (e) {
        return ack?.({ error: "send_failed" });
      }
    });

    socket.on("typing", async (payload) => {
      const roomId = payload?.roomId;
      if (!roomId) return;
      const { error } = await assertRoomParticipant(roomId, userId);
      if (error) return;
      socket.to(`room:${roomId}`).emit("user_typing", { userId, roomId });
    });

    socket.on("stop_typing", async (payload) => {
      const roomId = payload?.roomId;
      if (!roomId) return;
      const { error } = await assertRoomParticipant(roomId, userId);
      if (error) return;
      socket.to(`room:${roomId}`).emit("user_stopped", { userId, roomId });
    });

    socket.on("mark_read", async (payload, ack) => {
      try {
        const roomId = payload?.roomId;
        const messageId = payload?.messageId;
        if (!roomId || !messageId) {
          return ack?.({ error: "roomId and messageId required" });
        }

        const { error } = await assertRoomParticipant(roomId, userId);
        if (error) return ack?.({ error });

        const msg = await Message.findById(messageId);
        if (!msg || String(msg.chatRoomId) !== String(roomId)) {
          return ack?.({ error: "Message not found" });
        }

        if (String(msg.senderId) === String(userId)) {
          return ack?.({ ok: true });
        }

        msg.isRead = true;
        await msg.save();

        io.to(`room:${roomId}`).emit("message_read", { messageId: msg._id });
        return ack?.({ ok: true });
      } catch {
        return ack?.({ error: "mark_read_failed" });
      }
    });
  });

  ioInstance = io;
  return io;
}
