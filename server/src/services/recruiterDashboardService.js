import mongoose from 'mongoose';

import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';

import { getRecentActivity } from './activityService.js';
import { listRecentApplications } from './applicationService.js';
import { getCompanyCompletion, getOrCreateCompany } from './companyService.js';

export const getRecruiterDashboard = async (recruiterId) => {
  const company = await getOrCreateCompany(recruiterId);

  const [
    totalJobs,
    openJobs,
    closedJobs,
    totalApplications,
    pendingApplications,
    shortlistedApplications,
    recentApplications,
    recentActivity,
  ] = await Promise.all([
    Job.countDocuments({ recruiterId }),
    Job.countDocuments({ recruiterId, status: 'open' }),
    Job.countDocuments({ recruiterId, status: 'closed' }),
    Application.countDocuments({ recruiterId }),
    Application.countDocuments({ recruiterId, status: 'pending' }),
    Application.countDocuments({ recruiterId, status: 'shortlisted' }),
    listRecentApplications(recruiterId, 6),
    getRecentActivity(recruiterId, 8),
  ]);

  const rankedApps = await Application.find({
    recruiterId,
    rankingScore: { $ne: null },
  }).select('rankingScore');
  const avgRankingScore = rankedApps.length
    ? Math.round(rankedApps.reduce((s, a) => s + a.rankingScore, 0) / rankedApps.length)
    : null;

  return {
    stats: {
      totalJobs,
      openJobs,
      closedJobs,
      totalApplications,
      pendingApplications,
      shortlistedApplications,
      avgRankingScore,
      companyCompletion: getCompanyCompletion(company),
    },
    company,
    recentApplications,
    recentActivity,
  };
};

export const getRecruiterAnalytics = async (recruiterId) => {
  const rid = new mongoose.Types.ObjectId(recruiterId);

  const [
    jobsByStatus,
    applicationsByStatus,
    topJobs,
    scoreDistribution,
    applicationsOverTime,
  ] = await Promise.all([
    Job.aggregate([
      { $match: { recruiterId: rid } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Application.aggregate([
      { $match: { recruiterId: rid } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Job.find({ recruiterId: rid }).sort({ applicantCount: -1 }).limit(5).select('title companyName applicantCount status'),
    Application.aggregate([
      { $match: { recruiterId: rid, rankingScore: { $ne: null } } },
      {
        $bucket: {
          groupBy: '$rankingScore',
          boundaries: [0, 50, 70, 85, 101],
          default: 'other',
          output: { count: { $sum: 1 } },
        },
      },
    ]),
    Application.aggregate([
      { $match: { recruiterId: rid } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 30 },
    ]),
  ]);

  const rankedApps = await Application.find({
    recruiterId,
    rankingScore: { $ne: null },
  }).select('rankingScore applicantName jobTitle createdAt').sort({ createdAt: -1 }).limit(10);

  return {
    jobsByStatus: Object.fromEntries(jobsByStatus.map((j) => [j._id, j.count])),
    applicationsByStatus: Object.fromEntries(applicationsByStatus.map((a) => [a._id, a.count])),
    topJobs: topJobs.map((j) => ({
      id: j._id.toString(),
      title: j.title,
      companyName: j.companyName,
      applicantCount: j.applicantCount,
      status: j.status,
    })),
    scoreDistribution: scoreDistribution.map((b) => ({
      range: b._id === 'other' ? 'other' : `${b._id}`,
      count: b.count,
    })),
    applicationsOverTime: applicationsOverTime.map((d) => ({ date: d._id, count: d.count })),
    recentRankings: rankedApps.map((a) => ({
      id: a._id.toString(),
      applicantName: a.applicantName,
      jobTitle: a.jobTitle,
      score: a.rankingScore,
      createdAt: a.createdAt,
    })),
  };
};
