import Notification from "../models/notification.model.js";
import mongoose from "mongoose";

export const createNotification = async ({ userId, title, message }) => {
  return Notification.create({ userId, title, message });
};

export const getNotificationsForUser = async ({
  userId,
  page = 1,
  limit = 50,
}) => {
  const skip = (Number(page) - 1) * Number(limit);
  const filter = { $or: [{ userId }, { userId: null }] };
  const data = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));
  const total = await Notification.countDocuments(filter);
  return {
    data,
    page: Number(page),
    limit: Number(limit),
    total,
    totalPages: Math.ceil(total / Number(limit)),
  };
};

export const markNotificationRead = async ({ id }) => {
  if (!mongoose.Types.ObjectId.isValid(id)) throw new Error("Invalid id");
  return Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
};
