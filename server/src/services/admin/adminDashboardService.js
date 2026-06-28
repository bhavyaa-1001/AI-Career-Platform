import { Application } from '../../models/Application.js';
import { CodingContest } from '../../models/CodingContest.js';
import { CodingProblem } from '../../models/CodingProblem.js';
import { Company } from '../../models/Company.js';
import { Job } from '../../models/Job.js';
import { User } from '../../models/User.js';
import { AiUsageLog } from '../../models/admin/AiUsageLog.js';
import { DailyVisitor } from '../../models/admin/DailyVisitor.js';
import { Subscription } from '../../models/admin/Subscription.js';
import { buildDateFilter, mergeMatch, parseDateRange } from '../../utils/insightsDateRange.js';

const today = () => new Date().toISOString().slice(0, 10);

export const getAdminDashboard = async (query = {}) => {
  const { from, to } = parseDateRange(query);
  const dateFilter = buildDateFilter(from, to);
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    activeUsers,
    recruiters,
    companies,
    totalJobs,
    totalApplications,
    totalProblems,
    totalContests,
    aiRequests,
    activeSubscriptions,
    revenueAgg,
    userGrowth,
    aiOverTime,
    applicationsOverTime,
    recentUsers,
    visitorToday,
    visitorsWeek,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ isActive: true, lastLogin: { $gte: thirtyDaysAgo } }),
    User.countDocuments({ role: 'recruiter' }),
    Company.countDocuments({}),
    Job.countDocuments(mergeMatch({}, dateFilter)),
    Application.countDocuments(mergeMatch({}, dateFilter)),
    CodingProblem.countDocuments({}),
    CodingContest.countDocuments({}),
    AiUsageLog.countDocuments(mergeMatch({}, dateFilter)),
    Subscription.countDocuments({ status: 'active' }),
    Subscription.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    User.aggregate([
      { $match: mergeMatch({}, dateFilter) },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 60 },
    ]),
    AiUsageLog.aggregate([
      { $match: mergeMatch({}, dateFilter) },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 60 },
    ]),
    Application.aggregate([
      { $match: mergeMatch({}, dateFilter) },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
      { $limit: 60 },
    ]),
    User.find({}).sort({ createdAt: -1 }).limit(8).select('firstName lastName email role isActive createdAt'),
    DailyVisitor.findOne({ date: today() }),
    DailyVisitor.find({}).sort({ date: -1 }).limit(7),
  ]);

  const usersByRole = await User.aggregate([
    { $group: { _id: '$role', count: { $sum: 1 } } },
  ]);

  const revenue = revenueAgg[0]?.total || 0;

  return {
    stats: {
      totalUsers,
      activeUsers,
      recruiters,
      companies,
      totalJobs,
      totalApplications,
      totalProblems,
      totalContests,
      aiRequests,
      revenue,
      activeSubscriptions,
      dailyVisitors: visitorToday?.visitors || 0,
    },
    charts: {
      userGrowth: userGrowth.map((r) => ({ date: r._id, count: r.count })),
      aiOverTime: aiOverTime.map((r) => ({ date: r._id, count: r.count })),
      applicationsOverTime: applicationsOverTime.map((r) => ({ date: r._id, count: r.count })),
      usersByRole: Object.fromEntries(usersByRole.map((r) => [r._id, r.count])),
      dailyVisitors: visitorsWeek.reverse().map((v) => ({
        date: v.date,
        visitors: v.visitors,
        uniqueVisitors: v.uniqueVisitors,
      })),
    },
    recentUsers: recentUsers.map((u) => u.toSafeObject()),
  };
};

export const trackVisitor = async () => {
  const date = today();
  await DailyVisitor.findOneAndUpdate(
    { date },
    { $inc: { visitors: 1, pageViews: 1 } },
    { upsert: true, new: true },
  );
};

export const getPlatformAnalytics = async (query = {}) => {
  const { from, to } = parseDateRange(query);
  const dateFilter = buildDateFilter(from, to);

  const [
    totalUsers, newUsers, activeUsers, aiRequests, activeSubscriptions, revenueAgg,
    retentionData, dauData,
  ] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments(mergeMatch({}, dateFilter)),
    User.countDocuments({ isActive: true }),
    AiUsageLog.countDocuments(mergeMatch({}, dateFilter)),
    Subscription.countDocuments({ status: 'active' }),
    Subscription.aggregate([
      { $match: { status: 'active', ...mergeMatch({}, dateFilter) } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]),
    User.aggregate([
      { $match: mergeMatch({}, dateFilter) },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    DailyVisitor.find({}).sort({ date: -1 }).limit(30),
  ]);

  const aiByFeature = await AiUsageLog.aggregate([
    { $match: mergeMatch({}, dateFilter) },
    { $group: { _id: '$feature', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  const subsByStatus = await Subscription.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  return {
    summary: {
      totalUsers,
      newUsers,
      activeUsers,
      aiRequests,
      activeSubscriptions,
      revenue: revenueAgg[0]?.total || 0,
    },
    growth: retentionData.map((r) => ({ month: r._id, users: r.count })),
    dailyActiveUsers: dauData.reverse().map((d) => ({
      date: d.date,
      visitors: d.visitors,
      authenticated: d.authenticatedVisits,
    })),
    aiByFeature: aiByFeature.map((r) => ({ feature: r._id, count: r.count })),
    subscriptionsByStatus: Object.fromEntries(subsByStatus.map((s) => [s._id, s.count])),
  };
};
