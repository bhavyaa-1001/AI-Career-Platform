import { Activity } from '../models/Activity.js';

export const logActivity = async (userId, action, description, metadata = {}) => {
  const activity = await Activity.create({ userId, action, description, metadata });
  return activity.toSafeObject();
};

export const getRecentActivity = async (userId, limit = 10) => {
  const activities = await Activity.find({ userId }).sort({ createdAt: -1 }).limit(limit);
  return activities.map((a) => a.toSafeObject());
};
