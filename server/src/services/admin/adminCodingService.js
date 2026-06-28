import { CodingContest } from '../../models/CodingContest.js';
import { CodingProblem } from '../../models/CodingProblem.js';
import { DailyChallenge } from '../../models/DailyChallenge.js';
import { UserCodingProfile } from '../../models/UserCodingProfile.js';
import { ApiError } from '../../utils/ApiError.js';

import { logAdminAction } from './auditService.js';

const paginate = (page, limit, total) => ({
  page, limit, total, pages: Math.ceil(total / limit) || 1,
});

export const getCodingOverview = async () => {
  const [problems, contests, challenges, profiles] = await Promise.all([
    CodingProblem.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    CodingContest.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
    DailyChallenge.countDocuments({}),
    UserCodingProfile.countDocuments({}),
  ]);

  const categories = await CodingProblem.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const tags = await CodingProblem.aggregate([
    { $unwind: '$tags' },
    { $group: { _id: '$tags', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 20 },
  ]);

  return {
    problemsByStatus: Object.fromEntries(problems.map((p) => [p._id, p.count])),
    contestsByStatus: Object.fromEntries(contests.map((c) => [c._id, c.count])),
    totalDailyChallenges: challenges,
    totalProfiles: profiles,
    categories: categories.map((c) => ({ name: c._id, count: c.count })),
    topTags: tags.map((t) => ({ name: t._id, count: t.count })),
  };
};

export const listAdminProblems = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.difficulty) filter.difficulty = query.difficulty;
  if (query.category) filter.category = query.category;
  if (query.search) filter.title = new RegExp(query.search.trim(), 'i');

  const [problems, total] = await Promise.all([
    CodingProblem.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    CodingProblem.countDocuments(filter),
  ]);

  return {
    problems: problems.map((p) => p.toSafeObject()),
    pagination: paginate(page, limit, total),
  };
};

export const listAdminContests = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.status) filter.status = query.status;

  const [contests, total] = await Promise.all([
    CodingContest.find(filter).sort({ startTime: -1 }).skip(skip).limit(limit),
    CodingContest.countDocuments(filter),
  ]);

  return {
    contests: contests.map((c) => c.toSafeObject()),
    pagination: paginate(page, limit, total),
  };
};

export const listDailyChallenges = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const [challenges, total] = await Promise.all([
    DailyChallenge.find({}).sort({ date: -1 }).skip(skip).limit(limit).populate('problemId', 'title slug difficulty'),
    DailyChallenge.countDocuments({}),
  ]);

  return {
    challenges: challenges.map((c) => ({
      id: c._id.toString(),
      date: c.date,
      problem: c.problemId?.title || 'Unknown',
      slug: c.problemId?.slug,
    })),
    pagination: paginate(page, limit, total),
  };
};

export const getLeaderboardAdmin = async (limit = 50) => {
  const profiles = await UserCodingProfile.find({})
    .sort({ totalPoints: -1 })
    .limit(limit)
    .populate('userId', 'firstName lastName email');

  return profiles.map((p, i) => ({
    rank: i + 1,
    userId: p.userId?._id?.toString(),
    name: p.userId ? `${p.userId.firstName} ${p.userId.lastName}` : 'Unknown',
    email: p.userId?.email,
    totalPoints: p.totalPoints,
    problemsSolved: p.totalSolved,
    streak: p.currentStreak,
    badges: p.badges?.length || 0,
  }));
};

export const getAchievementsOverview = async () => {
  const profiles = await UserCodingProfile.find({ 'badges.0': { $exists: true } }).limit(100);
  const badgeCounts = {};
  profiles.forEach((p) => {
    (p.badges || []).forEach((b) => {
      badgeCounts[b] = (badgeCounts[b] || 0) + 1;
    });
  });
  return Object.entries(badgeCounts)
    .map(([badge, count]) => ({ badge, count }))
    .sort((a, b) => b.count - a.count);
};

export const updateProblemCategory = async (admin, problemId, { category, tags }) => {
  const problem = await CodingProblem.findById(problemId);
  if (!problem) throw new ApiError(404, 'Problem not found');
  if (category) problem.category = category;
  if (tags) problem.tags = tags;
  await problem.save();

  await logAdminAction(admin, 'admin_action', `Updated problem ${problem.title}`, {
    resource: 'coding_problem', resourceId: problemId,
  });

  return problem.toSafeObject();
};
