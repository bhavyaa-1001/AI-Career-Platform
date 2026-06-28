import { CodingProblem } from '../models/CodingProblem.js';
import { DailyChallenge } from '../models/DailyChallenge.js';
import { ProblemBookmark } from '../models/ProblemBookmark.js';
import { ApiError } from '../utils/ApiError.js';

import { getOrCreateProfile } from './codingProfileService.js';

const todayKey = () => new Date().toISOString().slice(0, 10);

export const getOrCreateDailyChallenge = async () => {
  const today = todayKey();
  let challenge = await DailyChallenge.findOne({ date: today }).populate('problemId');

  if (!challenge) {
    const count = await CodingProblem.countDocuments({ status: 'published' });
    if (!count) throw new ApiError(404, 'No published problems available for daily challenge');

    const skip = Math.floor(Math.random() * count);
    const problem = await CodingProblem.findOne({ status: 'published' }).skip(skip);
    challenge = await DailyChallenge.create({ date: today, problemId: problem._id, bonusPoints: 20 });
    await challenge.populate('problemId');
  }

  const problem = challenge.problemId;
  return {
    ...challenge.toSafeObject(),
    problem: problem ? {
      id: problem._id.toString(),
      title: problem.title,
      slug: problem.slug,
      difficulty: problem.difficulty,
      points: problem.points,
      tags: problem.tags,
    } : null,
  };
};

export const getDailyCalendar = async (userId, { months = 3 } = {}) => {
  const profile = await getOrCreateProfile(userId);
  const activity = profile.dailyActivity instanceof Map
    ? Object.fromEntries(profile.dailyActivity)
    : profile.dailyActivity || {};

  const challenges = await DailyChallenge.find()
    .sort({ date: -1 })
    .limit(months * 31)
    .populate('problemId', 'title slug difficulty');

  const solvedDates = new Set();
  const solvedBookmarks = await ProblemBookmark.find({ userId, status: 'solved' }).select('solvedAt');
  solvedBookmarks.forEach((b) => {
    if (b.solvedAt) solvedDates.add(b.solvedAt.toISOString().slice(0, 10));
  });

  return {
    currentStreak: profile.currentStreak,
    longestStreak: profile.longestStreak,
    activity,
    challenges: challenges.map((c) => ({
      date: c.date,
      bonusPoints: c.bonusPoints,
      problem: c.problemId ? {
        id: c.problemId._id.toString(),
        title: c.problemId.title,
        slug: c.problemId.slug,
        difficulty: c.problemId.difficulty,
      } : null,
      completed: solvedDates.has(c.date),
    })),
  };
};
