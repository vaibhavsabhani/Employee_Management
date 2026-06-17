import * as notificationService from "../services/notification.service.js";

export const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const result = await notificationService.getNotificationsForUser({
      userId,
      page: req.query.page || 1,
    });
    return res.status(200).json({ success: true, ...result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const n = await notificationService.markNotificationRead({ id });
    return res.status(200).json({ success: true, data: n });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};
