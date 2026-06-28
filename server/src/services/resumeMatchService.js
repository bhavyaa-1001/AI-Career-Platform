import mongoose from 'mongoose';

import { ResumeMatch } from '../models/ResumeMatch.js';
import { ApiError } from '../utils/ApiError.js';
import { resumeToPlainText } from '../utils/resumePlainText.js';

import { logActivity } from './activityService.js';
import { compareResumeToJob } from './geminiMatchService.js';
import { getResumeById } from './resumeService.js';

export const generateResumeMatch = async (userId, { resumeId, jobTitle, companyName, jobDescription }) => {
  const resume = await getResumeById(resumeId, userId);
  const resumeText = resumeToPlainText(resume);

  if (resumeText.length < 50) {
    throw new ApiError(422, 'Resume has too little content. Add more sections first.');
  }
  if (!jobDescription || jobDescription.trim().length < 30) {
    throw new ApiError(422, 'Job description must be at least 30 characters.');
  }

  const result = await compareResumeToJob({
    resumeText,
    jobDescription: jobDescription.trim(),
    jobTitle: jobTitle?.trim() || '',
    companyName: companyName?.trim() || '',
  });

  const doc = await ResumeMatch.create({
    userId,
    resumeId: resume.id,
    resumeTitle: resume.title,
    jobTitle: jobTitle?.trim() || '',
    companyName: companyName?.trim() || '',
    jobDescription: jobDescription.trim(),
    matchScore: result.matchScore,
    summary: result.summary,
    missingSkills: result.missingSkills,
    matchedSkills: result.matchedSkills,
    strengths: result.strengths,
    weaknesses: result.weaknesses,
    learningSuggestions: result.learningSuggestions,
    model: result.model,
    durationMs: result.durationMs,
  });

  await logActivity(userId, 'resume_analysis', `Resume match: ${result.matchScore}% for ${jobTitle || resume.title}`, {
    matchId: doc._id.toString(),
    resumeId: resume.id,
    matchScore: result.matchScore,
  });

  return doc.toSafeObject();
};

export const listResumeMatches = async (userId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    ResumeMatch.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    ResumeMatch.countDocuments({ userId }),
  ]);

  return {
    matches: items.map((m) => m.toSafeObject()),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

export const getResumeMatchById = async (id, userId) => {
  const match = await ResumeMatch.findOne({ _id: id, userId });
  if (!match) throw new ApiError(404, 'Match comparison not found');
  return match.toSafeObject();
};

export const deleteResumeMatch = async (id, userId) => {
  const match = await ResumeMatch.findOne({ _id: id, userId });
  if (!match) throw new ApiError(404, 'Match comparison not found');
  await match.deleteOne();
};

export const getMatchDashboard = async (userId) => {
  const uid = new mongoose.Types.ObjectId(userId);
  const matches = await ResumeMatch.find({ userId }).sort({ createdAt: -1 });

  const total = matches.length;
  const avgMatch = total
    ? Math.round(matches.reduce((s, m) => s + m.matchScore, 0) / total)
    : 0;
  const bestMatch = total ? Math.max(...matches.map((m) => m.matchScore)) : 0;
  const latestMatch = matches[0]?.toSafeObject() || null;

  const skillGapCounts = {};
  matches.forEach((m) => {
    (m.missingSkills || []).forEach((s) => {
      const key = (s.skill || '').toLowerCase();
      if (key) skillGapCounts[key] = (skillGapCounts[key] || 0) + 1;
    });
  });

  const topMissingSkills = Object.entries(skillGapCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([skill, count]) => ({ skill, count }));

  const scoreHistory = matches.slice(0, 12).reverse().map((m) => ({
    id: m._id.toString(),
    label: m.jobTitle || m.resumeTitle || 'Comparison',
    score: m.matchScore,
    date: m.createdAt,
  }));

  const scoreBuckets = await ResumeMatch.aggregate([
    { $match: { userId: uid } },
    {
      $bucket: {
        groupBy: '$matchScore',
        boundaries: [0, 50, 70, 85, 101],
        default: 'other',
        output: { count: { $sum: 1 } },
      },
    },
  ]);

  const monthly = await ResumeMatch.aggregate([
    { $match: { userId: uid } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
        count: { $sum: 1 },
        avgScore: { $avg: '$matchScore' },
      },
    },
    { $sort: { _id: 1 } },
    { $limit: 12 },
  ]);

  return {
    stats: {
      totalComparisons: total,
      avgMatchScore: avgMatch,
      bestMatchScore: bestMatch,
      latestScore: latestMatch?.matchScore ?? null,
    },
    latestMatch,
    scoreHistory,
    scoreDistribution: scoreBuckets.map((b) => ({
      range: b._id === 'other' ? 'other' : `${b._id}`,
      count: b.count,
    })),
    topMissingSkills,
    comparisonsOverTime: monthly.map((m) => ({
      month: m._id,
      count: m.count,
      avgScore: Math.round(m.avgScore || 0),
    })),
    recentMatches: matches.slice(0, 6).map((m) => m.toSafeObject()),
  };
};
