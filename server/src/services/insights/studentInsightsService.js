import mongoose from 'mongoose';

import { Activity } from '../../models/Activity.js';
import { Application } from '../../models/Application.js';
import { CodeReview } from '../../models/CodeReview.js';
import { CodingSubmission } from '../../models/CodingSubmission.js';
import { ContestParticipant } from '../../models/ContestParticipant.js';
import { CoverLetter } from '../../models/CoverLetter.js';
import { JobBookmark } from '../../models/JobBookmark.js';
import { Notification } from '../../models/Notification.js';
import { ProblemBookmark } from '../../models/ProblemBookmark.js';
import { Profile } from '../../models/Profile.js';
import { ResumeAnalysis } from '../../models/ResumeAnalysis.js';
import { ResumeMatch } from '../../models/ResumeMatch.js';
import { UserCodingProfile } from '../../models/UserCodingProfile.js';
import {
  buildDateFilter, calcRate, mergeMatch, parseDateRange, topCounts,
} from '../../utils/insightsDateRange.js';

const uid = (userId) => new mongoose.Types.ObjectId(userId);

const skillGrowthFromAnalyses = (analyses, matches) => {
  const timeline = {};
  [...analyses, ...matches].forEach((doc) => {
    const month = doc.createdAt.toISOString().slice(0, 7);
    if (!timeline[month]) timeline[month] = { gaps: {}, scores: [] };
    const skills = doc.missingSkills || [];
    skills.forEach((s) => {
      const key = (typeof s === 'string' ? s : s.skill || '').toLowerCase();
      if (key) timeline[month].gaps[key] = (timeline[month].gaps[key] || 0) + 1;
    });
    if (doc.atsScore != null) timeline[month].scores.push(doc.atsScore);
    if (doc.matchScore != null) timeline[month].scores.push(doc.matchScore);
  });

  return Object.entries(timeline)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month,
      avgScore: data.scores.length
        ? Math.round(data.scores.reduce((a, b) => a + b, 0) / data.scores.length)
        : 0,
      topGaps: topCounts(data.gaps, 5),
    }));
};

export const getStudentInsights = async (userId, query = {}) => {
  const { from, to } = parseDateRange(query);
  const dateFilter = buildDateFilter(from, to);
  const userOid = uid(userId);

  const baseApp = mergeMatch({ applicantId: userOid }, dateFilter);
  const baseAnalysis = mergeMatch({ userId: userOid, status: 'completed' }, dateFilter);
  const baseMatch = mergeMatch({ userId: userOid }, dateFilter);
  const baseSubmission = mergeMatch({ userId: userOid, isRun: false }, dateFilter);
  const baseNotif = mergeMatch({ userId: userOid }, dateFilter);
  const baseActivity = mergeMatch({ userId: userOid }, dateFilter);
  const baseCover = mergeMatch({ userId: userOid }, dateFilter);
  const baseReview = mergeMatch({ userId: userOid }, dateFilter);

  const [
    applications,
    bookmarks,
    analyses,
    matches,
    submissions,
    codingProfile,
    problemBookmarks,
    notifications,
    activities,
    coverLetters,
    codeReviews,
    contestParts,
    profile,
    appByStatus,
    appOverTime,
    resumeScoreHistory,
    matchHistory,
    submissionOverTime,
    notifByType,
    interviewApps,
  ] = await Promise.all([
    Application.find(baseApp).sort({ createdAt: -1 }).limit(200),
    JobBookmark.countDocuments(mergeMatch({ userId: userOid }, dateFilter)),
    ResumeAnalysis.find(baseAnalysis).sort({ createdAt: -1 }).limit(100),
    ResumeMatch.find(baseMatch).sort({ createdAt: -1 }).limit(100),
    CodingSubmission.find(baseSubmission).sort({ createdAt: -1 }).limit(200),
    UserCodingProfile.findOne({ userId: userOid }),
    ProblemBookmark.find(mergeMatch({ userId: userOid }, dateFilter)),
    Notification.find(baseNotif).sort({ createdAt: -1 }).limit(30),
    Activity.find(baseActivity).sort({ createdAt: -1 }).limit(25),
    CoverLetter.find(baseCover).sort({ createdAt: -1 }).limit(50),
    CodeReview.find(baseReview).sort({ createdAt: -1 }).limit(30),
    ContestParticipant.find(mergeMatch({ userId: userOid }, dateFilter)).sort({ score: -1 }).limit(20),
    Profile.findOne({ userId: userOid }),
    Application.aggregate([
      { $match: baseApp },
      { $group: { _id: '$trackStatus', count: { $sum: 1 } } },
    ]),
    Application.aggregate([
      { $match: baseApp },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    ResumeAnalysis.aggregate([
      { $match: baseAnalysis },
      { $project: { atsScore: 1, grammarScore: '$grammar.score', createdAt: 1, label: { $ifNull: ['$resumeTitle', '$sourceFileName'] } } },
      { $sort: { createdAt: 1 } },
      { $limit: 24 },
    ]),
    ResumeMatch.aggregate([
      { $match: baseMatch },
      { $project: { matchScore: 1, jobTitle: 1, companyName: 1, createdAt: 1 } },
      { $sort: { createdAt: -1 } },
      { $limit: 20 },
    ]),
    CodingSubmission.aggregate([
      { $match: baseSubmission },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } } } },
      { $sort: { _id: 1 } },
      { $limit: 90 },
    ]),
    Notification.aggregate([
      { $match: baseNotif },
      { $group: { _id: '$type', count: { $sum: 1 }, unread: { $sum: { $cond: ['$isRead', 0, 1] } } } },
    ]),
    Application.find({ ...baseApp, trackStatus: { $in: ['interview', 'offer', 'assessment'] } }),
  ]);

  const totalApps = applications.length;
  const offers = applications.filter((a) => a.trackStatus === 'offer').length;
  const interviews = applications.filter((a) => a.trackStatus === 'interview').length;
  const rejected = applications.filter((a) => a.trackStatus === 'rejected').length;
  const totalSubmissions = submissions.length;
  const acceptedSubs = submissions.filter((s) => s.status === 'accepted').length;
  const avgAts = analyses.length
    ? Math.round(analyses.reduce((s, a) => s + a.atsScore, 0) / analyses.length)
    : 0;
  const avgMatch = matches.length
    ? Math.round(matches.reduce((s, m) => s + m.matchScore, 0) / matches.length)
    : 0;

  const heatmap = {};
  submissions.forEach((s) => {
    const day = s.createdAt.toISOString().slice(0, 10);
    heatmap[day] = (heatmap[day] || 0) + 1;
  });
  analyses.forEach((a) => {
    const day = a.createdAt.toISOString().slice(0, 10);
    heatmap[day] = (heatmap[day] || 0) + 1;
  });

  const learningTopics = {};
  matches.forEach((m) => {
    (m.learningSuggestions || []).forEach((l) => {
      const topic = (l.topic || '').toLowerCase();
      if (topic) learningTopics[topic] = (learningTopics[topic] || 0) + 1;
    });
  });

  const skillGrowth = skillGrowthFromAnalyses(analyses, matches);
  const profileSkills = profile?.skills?.length || 0;

  return {
    filters: { from: from?.toISOString() || null, to: to?.toISOString() || null },
    summary: {
      applications: totalApps,
      jobBookmarks: bookmarks,
      problemBookmarks: problemBookmarks.filter((b) => b.isBookmarked).length,
      resumeAnalyses: analyses.length,
      jobMatches: matches.length,
      codingSubmissions: totalSubmissions,
      coverLetters: coverLetters.length,
      codeReviews: codeReviews.length,
      avgAtsScore: avgAts,
      avgMatchScore: avgMatch,
      codingAcceptanceRate: calcRate(acceptedSubs, totalSubmissions),
      applicationOfferRate: calcRate(offers, totalApps),
      profileSkills,
      totalPoints: codingProfile?.totalPoints || 0,
      totalSolved: codingProfile?.totalSolved || 0,
      currentStreak: codingProfile?.currentStreak || 0,
    },
    applications: {
      byStatus: Object.fromEntries(appByStatus.map((s) => [s._id, s.count])),
      overTime: appOverTime.map((r) => ({ month: r._id, count: r.count })),
      recent: applications.slice(0, 10).map((a) => ({
        id: a._id.toString(),
        trackStatus: a.trackStatus,
        status: a.status,
        createdAt: a.createdAt,
      })),
    },
    resumeScores: {
      avgAts,
      avgGrammar: analyses.length
        ? Math.round(analyses.reduce((s, a) => s + (a.grammar?.score || 0), 0) / analyses.length)
        : 0,
      history: resumeScoreHistory.map((r) => ({
        label: r.label || 'Analysis',
        atsScore: r.atsScore,
        grammarScore: r.grammarScore,
        date: r.createdAt,
      })),
    },
    aiResumeHistory: analyses.slice(0, 15).map((a) => ({
      id: a._id.toString(),
      title: a.resumeTitle || a.sourceFileName || 'Resume',
      atsScore: a.atsScore,
      grammarScore: a.grammar?.score || 0,
      createdAt: a.createdAt,
    })),
    codingProgress: {
      totalSolved: codingProfile?.totalSolved || 0,
      totalAttempted: codingProfile?.totalAttempted || 0,
      acceptanceRate: calcRate(acceptedSubs, totalSubmissions),
      difficultySolved: codingProfile?.difficultySolved || { easy: 0, medium: 0, hard: 0 },
      languageUsage: codingProfile?.languageUsage instanceof Map
        ? Object.fromEntries(codingProfile.languageUsage)
        : codingProfile?.languageUsage || {},
      submissionTrend: submissionOverTime.map((r) => ({
        date: r._id, total: r.count, accepted: r.accepted,
      })),
    },
    interviewPerformance: {
      interviews,
      offers,
      assessments: applications.filter((a) => a.trackStatus === 'assessment').length,
      conversionRate: calcRate(offers, interviews + offers),
      pipeline: interviewApps.slice(0, 10).map((a) => ({
        id: a._id.toString(),
        trackStatus: a.trackStatus,
        updatedAt: a.updatedAt,
      })),
    },
    learningProgress: {
      topicsSuggested: topCounts(learningTopics, 10),
      coverLettersGenerated: coverLetters.length,
      aiReviews: codeReviews.length,
      recentTopics: matches.flatMap((m) => (m.learningSuggestions || []).slice(0, 2).map((l) => ({
        topic: l.topic,
        priority: l.priority,
        matchId: m._id.toString(),
      }))).slice(0, 12),
    },
    skillGrowth,
    jobMatchHistory: matchHistory.map((m) => ({
      jobTitle: m.jobTitle || 'Role',
      companyName: m.companyName || '',
      matchScore: m.matchScore,
      date: m.createdAt,
    })),
    acceptanceRate: {
      coding: calcRate(acceptedSubs, totalSubmissions),
      applications: calcRate(offers + interviews, totalApps),
      rejectRate: calcRate(rejected, totalApps),
    },
    contestPerformance: contestParts.map((p) => ({
      contestId: p.contestId.toString(),
      score: p.score,
      solvedCount: p.solvedCount,
      rank: p.rank,
    })),
    heatmap: Object.entries(heatmap)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count })),
    recentActivities: activities.map((a) => a.toSafeObject()),
    notifications: {
      byType: notifByType.map((n) => ({ type: n._id, count: n.count, unread: n.unread })),
      recent: notifications.map((n) => n.toSafeObject()),
    },
    bookmarks: {
      jobs: bookmarks,
      problems: {
        bookmarked: problemBookmarks.filter((b) => b.isBookmarked).length,
        favorites: problemBookmarks.filter((b) => b.isFavorite).length,
        solved: problemBookmarks.filter((b) => b.status === 'solved').length,
      },
    },
  };
};
