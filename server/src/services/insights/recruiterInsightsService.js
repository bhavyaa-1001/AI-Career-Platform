import mongoose from 'mongoose';

import { Application } from '../../models/Application.js';
import { Job } from '../../models/Job.js';
import { buildDateFilter, calcRate, mergeMatch, parseDateRange } from '../../utils/insightsDateRange.js';

export const getRecruiterInsights = async (recruiterId, query = {}) => {
  const { from, to } = parseDateRange(query);
  const dateFilter = buildDateFilter(from, to);
  const rid = new mongoose.Types.ObjectId(recruiterId);

  const baseJob = mergeMatch({ recruiterId: rid }, dateFilter);
  const baseApp = mergeMatch({ recruiterId: rid }, dateFilter);

  const [
    jobs,
    applications,
    jobsByStatus,
    appsByStatus,
    appsByTrack,
    topJobs,
    scoreDistribution,
    appsOverTime,
    rankingTrend,
    recentApps,
  ] = await Promise.all([
    Job.find(baseJob).sort({ createdAt: -1 }),
    Application.find(baseApp).sort({ createdAt: -1 }).limit(300),
    Job.aggregate([{ $match: baseJob }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Application.aggregate([{ $match: baseApp }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
    Application.aggregate([{ $match: baseApp }, { $group: { _id: '$trackStatus', count: { $sum: 1 } } }]),
    Job.find({ recruiterId: rid }).sort({ applicantCount: -1 }).limit(8)
      .select('title companyName applicantCount status createdAt'),
    Application.aggregate([
      { $match: { ...baseApp, rankingScore: { $ne: null } } },
      { $bucket: { groupBy: '$rankingScore', boundaries: [0, 50, 70, 85, 101], default: 'other', output: { count: { $sum: 1 } } } },
    ]),
    Application.aggregate([
      { $match: baseApp },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 60 },
    ]),
    Application.aggregate([
      { $match: { ...baseApp, rankingScore: { $ne: null } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, avgScore: { $avg: '$rankingScore' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Application.find(baseApp).sort({ createdAt: -1 }).limit(12)
      .populate('jobId', 'title companyName'),
  ]);

  const totalApps = applications.length;
  const shortlisted = applications.filter((a) => a.status === 'shortlisted').length;
  const accepted = applications.filter((a) => a.status === 'accepted').length;
  const ranked = applications.filter((a) => a.rankingScore != null);
  const avgRanking = ranked.length
    ? Math.round(ranked.reduce((s, a) => s + a.rankingScore, 0) / ranked.length)
    : 0;

  return {
    filters: { from: from?.toISOString() || null, to: to?.toISOString() || null },
    summary: {
      totalJobs: jobs.length,
      openJobs: jobs.filter((j) => j.status === 'open').length,
      totalApplications: totalApps,
      shortlisted,
      accepted,
      avgRankingScore: avgRanking,
      acceptanceRate: calcRate(accepted, totalApps),
      shortlistRate: calcRate(shortlisted, totalApps),
    },
    jobs: {
      byStatus: Object.fromEntries(jobsByStatus.map((j) => [j._id, j.count])),
      topPerformers: topJobs.map((j) => ({
        id: j._id.toString(),
        title: j.title,
        companyName: j.companyName,
        applicantCount: j.applicantCount,
        status: j.status,
      })),
    },
    applications: {
      byStatus: Object.fromEntries(appsByStatus.map((a) => [a._id, a.count])),
      byTrackStatus: Object.fromEntries(appsByTrack.map((a) => [a._id, a.count])),
      overTime: appsOverTime.map((r) => ({ date: r._id, count: r.count })),
      recent: recentApps.map((a) => ({
        id: a._id.toString(),
        status: a.status,
        trackStatus: a.trackStatus,
        rankingScore: a.rankingScore,
        jobTitle: a.jobId?.title,
        companyName: a.jobId?.companyName,
        createdAt: a.createdAt,
      })),
    },
    ranking: {
      distribution: scoreDistribution.map((b) => ({ range: String(b._id), count: b.count })),
      trend: rankingTrend.map((r) => ({
        month: r._id,
        avgScore: Math.round(r.avgScore || 0),
        count: r.count,
      })),
    },
  };
};
