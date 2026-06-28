import { Notification } from '../models/Notification.js';

export const createNotification = async (userId, { type, title, message, link = '' }) => {
  return Notification.create({ userId, type, title, message, link });
};

export const getUserNotifications = async (userId, limit = 20) => {
  const notifications = await Notification.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit);
  return notifications.map((n) => n.toSafeObject());
};

export const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ userId, isRead: false });
};

export const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOne({ _id: notificationId, userId });
  if (!notification) return null;
  notification.isRead = true;
  await notification.save();
  return notification.toSafeObject();
};

export const markAllAsRead = async (userId) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
};

export const seedWelcomeNotifications = async (userId) => {
  const count = await Notification.countDocuments({ userId });
  if (count > 0) return;

  await Notification.insertMany([
    {
      userId,
      type: 'system',
      title: 'Welcome to AI Career Platform',
      message: 'Complete your profile to get personalized career recommendations.',
      link: '/profile',
    },
    {
      userId,
      type: 'reminder',
      title: 'Verify your email',
      message: 'Verify your email address to unlock all platform features.',
      link: '/profile',
    },
  ]);
};
