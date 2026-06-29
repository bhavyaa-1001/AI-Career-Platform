import { ACHIEVEMENT_BADGES } from '../config/codingConstants.js';
import { User } from '../models/User.js';
import { UserCodingProfile } from '../models/UserCodingProfile.js';

const todayKey = () => new Date().toISOString().slice(0, 10);

export const getOrCreateProfile = async (userId) => {
  try {
    return await UserCodingProfile.findOneAndUpdate(
      { userId },
      { $setOnInsert: { userId } },
      { upsert: true, new: true },
    );
  } catch (err) {
    if (err.code === 11000) {
      return UserCodingProfile.findOne({ userId });
    }
    throw err;
  }
};

const updateStreak = (profile) => {
  const today = todayKey();
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  if (profile.lastActiveDate === today) return;

  if (profile.lastActiveDate === yesterday) {
    profile.currentStreak += 1;
  } else if (profile.lastActiveDate !== today) {
    profile.currentStreak = 1;
  }

  profile.lastActiveDate = today;
  profile.longestStreak = Math.max(profile.longestStreak, profile.currentStreak);

  const activity = profile.dailyActivity.get(today) || 0;
  profile.dailyActivity.set(today, activity + 1);
};

const awardBadge = (profile, badgeId) => {
  if (profile.badges.some((b) => b.id === badgeId)) return;
  const def = ACHIEVEMENT_BADGES[badgeId];
  if (!def) return;
  profile.badges.push({ id: def.id, name: def.name, earnedAt: new Date() });
};

export const checkAchievements = (profile) => {
  if (profile.totalSolved >= 1) awardBadge(profile, 'first_solve');
  if (profile.totalSolved >= 100) awardBadge(profile, 'hundred_problems');
  if (profile.currentStreak >= 7) awardBadge(profile, 'streak_7');
  if (profile.currentStreak >= 30) awardBadge(profile, 'streak_30');
};

export const recordSubmissionStats = async (userId, {
  language, difficulty, isAccepted, points = 0, isFirstSolve = false,
}) => {
  const profile = await getOrCreateProfile(userId);
  profile.totalAttempted += 1;

  const langCount = profile.languageUsage.get(language) || 0;
  profile.languageUsage.set(language, langCount + 1);

  updateStreak(profile);

  if (isAccepted && isFirstSolve) {
    profile.totalSolved += 1;
    profile.totalPoints += points;
    profile.weeklyPoints += points;
    profile.monthlyPoints += points;
    if (difficulty && profile.difficultySolved[difficulty] !== undefined) {
      profile.difficultySolved[difficulty] += 1;
    }
  }

  checkAchievements(profile);
  await profile.save();
  return profile.toSafeObject();
};

export const awardContestWinner = async (userId) => {
  const profile = await getOrCreateProfile(userId);
  awardBadge(profile, 'contest_winner');
  await profile.save();
};

export const resetWeeklyPoints = async () => {
  await UserCodingProfile.updateMany({}, { weeklyPoints: 0 });
};

export const resetMonthlyPoints = async () => {
  await UserCodingProfile.updateMany({}, { monthlyPoints: 0 });
};

export const getLeaderboardEntries = async ({ period = 'global', limit = 50 } = {}) => {
  const sortField = period === 'weekly' ? 'weeklyPoints' : period === 'monthly' ? 'monthlyPoints' : 'totalPoints';

  const profiles = await UserCodingProfile.find({ [sortField]: { $gt: 0 } })
    .sort({ [sortField]: -1, totalSolved: -1 })
    .limit(limit)
    .populate('userId', 'firstName lastName email');

  return profiles.map((p, idx) => ({
    rank: idx + 1,
    userId: p.userId._id.toString(),
    name: `${p.userId.firstName || ''} ${p.userId.lastName || ''}`.trim() || p.userId.email,
    points: p[sortField],
    totalSolved: p.totalSolved,
    currentStreak: p.currentStreak,
    badges: p.badges,
  }));
};

export const getUserRank = async (userId, period = 'global') => {
  const profile = await getOrCreateProfile(userId);
  const sortField = period === 'weekly' ? 'weeklyPoints' : period === 'monthly' ? 'monthlyPoints' : 'totalPoints';
  const userScore = profile[sortField];

  const higher = await UserCodingProfile.countDocuments({
    [sortField]: { $gt: userScore },
  });

  return { rank: higher + 1, points: userScore, profile: profile.toSafeObject() };
};

export const enrichLeaderboardWithUsers = async (entries) => {
  const userIds = entries.map((e) => e.userId);
  const users = await User.find({ _id: { $in: userIds } }).select('firstName lastName email');
  const userMap = Object.fromEntries(users.map((u) => [u._id.toString(), u]));

  return entries.map((e) => {
    const u = userMap[e.userId];
    return {
      ...e,
      name: u ? `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.email : 'Unknown',
    };
  });
};
