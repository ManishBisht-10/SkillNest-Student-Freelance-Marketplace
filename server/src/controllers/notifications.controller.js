import ApiError from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import Notification from "../models/Notification.model.js";

export const listNotifications = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const items = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(200);

  return res.status(200).json(items);
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;

  const doc = await Notification.findOneAndUpdate(
    { _id: id, userId },
    { $set: { isRead: true } },
    { new: true }
  );

  if (!doc) throw new ApiError(404, "Notification not found");

  return res.status(200).json(doc);
});

export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const result = await Notification.updateMany(
    { userId, isRead: false },
    { $set: { isRead: true } }
  );

  return res.status(200).json({
    message: "All notifications marked as read",
    modifiedCount: result.modifiedCount,
  });
});
