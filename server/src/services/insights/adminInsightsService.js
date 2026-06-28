import { Activity } from '../../models/Activity.js';
import { Application } from '../../models/Application.js';
import { CodingProblem } from '../../models/CodingProblem.js';
import { CodingSubmission } from '../../models/CodingSubmission.js';
import { Job } from '../../models/Job.js';
import { JobBookmark } from '../../models/JobBookmark.js';
import { Notification } from '../../models/Notification.js';
import { ResumeAnalysis } from '../../models/ResumeAnalysis.js';
import { ResumeMatch } from '../../models/ResumeMatch.js';
import { User } from '../../models/User.js';
import { buildDateFilter, mergeMatch, parseDateRange } from '../../utils/insightsDateRange.js';

export const getAdminInsights = async (query = {}) => {
  const { from, to } = parseDateRange(query);
  const dateFilter = buildDateFilter(from, to);

  const [
    usersByRole,
    totalJobs,
    openJobs,
    totalApplications,
    totalAnalyses,
    totalMatches,
    totalSubmissions,
    totalProblems,
    publishedProblems,
    totalBookmarks,
    totalNotifications,
    userGrowth,
    activityOverTime,
    submissionsOverTime,
    analysesOverTime,
    recentActivity,
  ] = await Promise.all([
    User.aggregate([{ $group: { _id: '$role', count: { $sum: 1 } } }]),
    Job.countDocuments(mergeMatch({}, dateFilter)),
    Job.countDocuments(mergeMatch({ status: 'open' }, dateFilter)),
    Application.countDocuments(mergeMatch({}, dateFilter)),
    ResumeAnalysis.countDocuments(mergeMatch({ status: 'completed' }, dateFilter)),
    ResumeMatch.countDocuments(mergeMatch({}, dateFilter)),
    CodingSubmission.countDocuments(mergeMatch({ isRun: false }, dateFilter)),
    CodingProblem.countDocuments({}),
    CodingProblem.countDocuments({ status: 'published' }),
    JobBookmark.countDocuments(mergeMatch({}, dateFilter)),
    Notification.countDocuments(mergeMatch({}, dateFilter)),
    User.aggregate([
      { $match: mergeMatch({}, dateFilter) },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Activity.aggregate([
      { $match: mergeMatch({}, dateFilter) },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 60 },
    ]),
    CodingSubmission.aggregate([
      { $match: mergeMatch({ isRun: false }, dateFilter) },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 60 },
    ]),
    ResumeAnalysis.aggregate([
      { $match: mergeMatch({ status: 'completed' }, dateFilter) },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 60 },
    ]),
    Activity.find(mergeMatch({}, dateFilter)).sort({ createdAt: -1 }).limit(20),
  ]);

  const appsByStatus = await Application.aggregate([
    { $match: mergeMatch({}, dateFilter) },
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  const codingAccepted = await CodingSubmission.countDocuments(
    mergeMatch({ isRun: false, status: 'accepted' }, dateFilter),
  );

  return {
    filters: { from: from?.toISOString() || null, to: to?.toISOString() || null },
    summary: {
      totalUsers: usersByRole.reduce((s, r) => s + r.count, 0),
      totalJobs,
      openJobs,
      totalApplications,
      totalAnalyses,
      totalMatches,
      totalSubmissions,
      codingAcceptanceRate: totalSubmissions
        ? Math.round((codingAccepted / totalSubmissions) * 100)
        : 0,
      totalProblems,
      publishedProblems,
      totalBookmarks,
      totalNotifications,
    },
    users: {
      byRole: Object.fromEntries(usersByRole.map((r) => [r._id, r.count])),
      growth: userGrowth.map((r) => ({ month: r._id, count: r.count })),
    },
    platform: {
      applicationsByStatus: Object.fromEntries(appsByStatus.map((a) => [a._id, a.count])),
      activityOverTime: activityOverTime.map((r) => ({ date: r._id, count: r.count })),
      submissionsOverTime: submissionsOverTime.map((r) => ({ date: r._id, count: r.count })),
      analysesOverTime: analysesOverTime.map((r) => ({ date: r._id, count: r.count })),
    },
    recentActivities: recentActivity.map((a) => a.toSafeObject()),
  };
};
