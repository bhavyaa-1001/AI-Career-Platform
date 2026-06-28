import mongoose from 'mongoose';

import { CodingProblem } from '../models/CodingProblem.js';
import { CodingSubmission } from '../models/CodingSubmission.js';
import { ProblemBookmark } from '../models/ProblemBookmark.js';

import { getBookmarkStats } from './codingBookmarkService.js';
import { listSubmissions } from './codingExecutionService.js';
import { getOrCreateProfile, getLeaderboardEntries, getUserRank } from './codingProfileService.js';

export const getProgress = async (userId) => {
  const profile = await getOrCreateProfile(userId);

  const [attempted, solved, submissions] = await Promise.all([
    ProblemBookmark.countDocuments({ userId, status: 'attempted' }),
    ProblemBookmark.countDocuments({ userId, status: 'solved' }),
    CodingSubmission.countDocuments({ userId, isRun: false }),
  ]);

  const accepted = await CodingSubmission.countDocuments({ userId, status: 'accepted', isRun: false });
  const acceptanceRate = submissions ? Math.round((accepted / submissions) * 100) : 0;

  const difficultyDistribution = await ProblemBookmark.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId), status: 'solved' } },
    {
      $lookup: {
        from: 'codingproblems',
        localField: 'problemId',
        foreignField: '_id',
        as: 'problem',
      },
    },
    { $unwind: '$problem' },
    { $group: { _id: '$problem.difficulty', count: { $sum: 1 } } },
  ]);

  const diffMap = { easy: 0, medium: 0, hard: 0 };
  difficultyDistribution.forEach((d) => { diffMap[d._id] = d.count; });

  return {
    profile: profile.toSafeObject(),
    stats: {
      attempted,
      solved,
      totalSubmissions: submissions,
      acceptanceRate,
      difficultyDistribution: diffMap,
    },
  };
};

export const getAchievements = async (userId) => {
  const profile = await getOrCreateProfile(userId);
  return { badges: profile.badges, profile: profile.toSafeObject() };
};

export const getCodingDashboard = async (userId) => {
  const [progress, bookmarkStats, rank, recentSubs, recommendations] = await Promise.all([
    getProgress(userId),
    getBookmarkStats(userId),
    getUserRank(userId),
    listSubmissions(userId, { limit: 5 }),
    getRecommendations(userId),
  ]);

  const leaderboard = await getLeaderboardEntries({ period: 'global', limit: 5 });

  return {
    ...progress,
    bookmarkStats,
    rank: rank.rank,
    points: rank.points,
    recentSubmissions: recentSubs.submissions,
    leaderboardPreview: leaderboard,
    recommendations,
  };
};

const getRecommendations = async (userId) => {
  const solved = await ProblemBookmark.find({ userId, status: 'solved' }).select('problemId');
  const solvedIds = solved.map((s) => s.problemId);

  const profile = await getOrCreateProfile(userId);
  const weakDifficulty = Object.entries(profile.difficultySolved || {})
    .sort((a, b) => a[1] - b[1])[0]?.[0] || 'easy';

  const problems = await CodingProblem.find({
    status: 'published',
    _id: { $nin: solvedIds },
    difficulty: weakDifficulty,
  }).limit(5);

  return problems.map((p) => {
    const safe = p.toSafeObject();
    delete safe.hiddenTestCases;
    return safe;
  });
};

export const getActivityHeatmap = async (userId) => {
  const profile = await getOrCreateProfile(userId);
  const activity = profile.dailyActivity instanceof Map
    ? Object.fromEntries(profile.dailyActivity)
    : profile.dailyActivity || {};

  return Object.entries(activity)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));
};
