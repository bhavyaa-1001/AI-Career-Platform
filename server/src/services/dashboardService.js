import { User } from '../models/User.js';
import { calculateProfileCompletion } from '../utils/profileCompletion.js';

import { getRecentActivity } from './activityService.js';
import { getUnreadCount, getUserNotifications, seedWelcomeNotifications } from './notificationService.js';
import { getFullProfile } from './profileService.js';

export const getDashboardData = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  await seedWelcomeNotifications(userId);

  const { profile } = await getFullProfile(userId);
  const completion = calculateProfileCompletion(user.toSafeObject(), profile);
  const activities = await getRecentActivity(userId, 8);
  const notifications = await getUserNotifications(userId, 10);
  const unreadCount = await getUnreadCount(userId);

  const stats = {
    profileCompletion: completion.percentage,
    skillsCount: profile.skills?.length || 0,
    experienceCount: profile.experience?.length || 0,
    projectsCount: profile.projects?.length || 0,
    certificationsCount: profile.certifications?.length || 0,
    educationCount: profile.education?.length || 0,
    unreadNotifications: unreadCount,
    hasDraft: profile.hasDraft,
    isEmailVerified: user.isEmailVerified,
  };

  return {
    user: user.toSafeObject(),
    stats,
    completion,
    recentActivity: activities,
    notifications,
  };
};
