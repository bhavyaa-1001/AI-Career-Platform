import {
  getUnreadCount,
  getUserNotifications,
  markAllAsRead,
  markAsRead,
} from '../services/notificationService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await getUserNotifications(req.user._id);
  const unreadCount = await getUnreadCount(req.user._id);
  res.status(200).json({ success: true, data: { notifications, unreadCount } });
});

export const readNotification = asyncHandler(async (req, res) => {
  const notification = await markAsRead(req.user._id, req.params.id);
  res.status(200).json({ success: true, data: { notification } });
});

export const readAllNotifications = asyncHandler(async (req, res) => {
  await markAllAsRead(req.user._id);
  res.status(200).json({ success: true, message: 'All notifications marked as read' });
});
