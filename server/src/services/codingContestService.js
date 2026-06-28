import { slugify } from '../config/codingConstants.js';
import { CodingContest } from '../models/CodingContest.js';
import { CodingProblem } from '../models/CodingProblem.js';
import { CodingSubmission } from '../models/CodingSubmission.js';
import { ContestParticipant } from '../models/ContestParticipant.js';
import { ApiError } from '../utils/ApiError.js';

import { awardContestWinner } from './codingProfileService.js';

const refreshContestStatus = (contest) => {
  const now = Date.now();
  if (now < contest.startTime.getTime()) contest.status = 'scheduled';
  else if (now > contest.endTime.getTime()) contest.status = 'finished';
  else contest.status = 'running';
  return contest;
};

export const listContests = async ({ page = 1, limit = 20, status } = {}) => {
  const filter = {};
  if (status) filter.status = status;
  const skip = (page - 1) * limit;

  const contests = await CodingContest.find(filter).sort({ startTime: -1 }).skip(skip).limit(limit);
  contests.forEach(refreshContestStatus);

  const total = await CodingContest.countDocuments(filter);
  return {
    contests: contests.map((c) => c.toSafeObject()),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

export const getContest = async (id) => {
  const contest = await CodingContest.findById(id);
  if (!contest) throw new ApiError(404, 'Contest not found');
  refreshContestStatus(contest);

  const problems = await CodingProblem.find({ _id: { $in: contest.problemIds } })
    .select('title slug difficulty points tags');

  const participantCount = await ContestParticipant.countDocuments({ contestId: contest._id });

  return {
    ...contest.toSafeObject(),
    problems: problems.map((p) => p.toSafeObject()),
    participantCount,
  };
};

export const createContest = async (userId, data) => {
  const slug = data.slug || slugify(data.title);
  const existing = await CodingContest.findOne({ slug });
  if (existing) throw new ApiError(409, 'Contest slug already exists');

  const endTime = new Date(new Date(data.startTime).getTime() + data.durationMinutes * 60000);

  const doc = await CodingContest.create({
    ...data,
    slug,
    endTime,
    createdBy: userId,
  });

  return doc.toSafeObject();
};

export const updateContest = async (id, data) => {
  const contest = await CodingContest.findById(id);
  if (!contest) throw new ApiError(404, 'Contest not found');

  Object.assign(contest, data);
  if (data.startTime && data.durationMinutes) {
    contest.endTime = new Date(new Date(data.startTime).getTime() + data.durationMinutes * 60000);
  }
  await contest.save();
  return contest.toSafeObject();
};

export const deleteContest = async (id) => {
  const contest = await CodingContest.findById(id);
  if (!contest) throw new ApiError(404, 'Contest not found');
  await contest.deleteOne();
  await ContestParticipant.deleteMany({ contestId: id });
};

export const joinContest = async (userId, contestId) => {
  const contest = await CodingContest.findById(contestId);
  if (!contest) throw new ApiError(404, 'Contest not found');
  refreshContestStatus(contest);

  const count = await ContestParticipant.countDocuments({ contestId });
  if (count >= contest.maxParticipants) throw new ApiError(403, 'Contest is full');

  let participant = await ContestParticipant.findOne({ contestId, userId });
  if (!participant) {
    participant = await ContestParticipant.create({ contestId, userId });
  }
  return participant.toSafeObject();
};

export const getContestLeaderboard = async (contestId, { limit = 50 } = {}) => {
  const participants = await ContestParticipant.find({ contestId })
    .sort({ score: -1, solvedCount: -1, joinedAt: 1 })
    .limit(limit)
    .populate('userId', 'firstName lastName email');

  return participants.map((p, idx) => ({
    rank: idx + 1,
    userId: p.userId._id.toString(),
    name: `${p.userId.firstName || ''} ${p.userId.lastName || ''}`.trim() || p.userId.email,
    score: p.score,
    solvedCount: p.solvedCount,
  }));
};

export const updateContestScore = async (userId, contestId, points) => {
  const participant = await ContestParticipant.findOne({ contestId, userId });
  if (!participant) return;

  participant.score += points;
  participant.solvedCount += 1;
  await participant.save();

  const rankings = await ContestParticipant.find({ contestId })
    .sort({ score: -1, solvedCount: -1 });
  for (let i = 0; i < rankings.length; i += 1) {
    rankings[i].rank = i + 1;
    await rankings[i].save();
  }

  if (rankings[0]?.userId.toString() === userId) {
    const contest = await CodingContest.findById(contestId);
    if (contest?.status === 'finished') {
      await awardContestWinner(userId);
    }
  }
};

export const getContestAnalytics = async (contestId) => {
  const contest = await CodingContest.findById(contestId);
  if (!contest) throw new ApiError(404, 'Contest not found');

  const [participants, submissions, accepted] = await Promise.all([
    ContestParticipant.countDocuments({ contestId }),
    CodingSubmission.countDocuments({ contestId }),
    CodingSubmission.countDocuments({ contestId, status: 'accepted' }),
  ]);

  const topPerformers = await getContestLeaderboard(contestId, { limit: 10 });

  return {
    contest: contest.toSafeObject(),
    stats: {
      participants,
      totalSubmissions: submissions,
      acceptedSubmissions: accepted,
      acceptanceRate: submissions ? Math.round((accepted / submissions) * 100) : 0,
    },
    topPerformers,
  };
};

export const startVirtualContest = async (userId, contestId) => {
  const original = await CodingContest.findById(contestId);
  if (!original) throw new ApiError(404, 'Contest not found');

  const now = new Date();
  const virtual = await CodingContest.create({
    title: `${original.title} (Virtual)`,
    slug: `${original.slug}-virtual-${Date.now()}`,
    description: original.description,
    problemIds: original.problemIds,
    startTime: now,
    endTime: new Date(now.getTime() + original.durationMinutes * 60000),
    durationMinutes: original.durationMinutes,
    status: 'running',
    isVirtual: true,
    createdBy: userId,
  });

  await joinContest(userId, virtual._id);
  return virtual.toSafeObject();
};
