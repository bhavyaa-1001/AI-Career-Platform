import { Report } from '../../models/admin/Report.js';
import { ApiError } from '../../utils/ApiError.js';

import { logAdminAction } from './auditService.js';

const paginate = (page, limit, total) => ({
  page, limit, total, pages: Math.ceil(total / limit) || 1,
});

export const listReports = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;
  const filter = {};
  if (query.type) filter.type = query.type;
  if (query.status) filter.status = query.status;

  const [reports, total] = await Promise.all([
    Report.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Report.countDocuments(filter),
  ]);

  return {
    reports: reports.map((r) => r.toSafeObject()),
    pagination: paginate(page, limit, total),
  };
};

export const createReport = async (data) => {
  const report = await Report.create(data);
  return report.toSafeObject();
};

export const resolveReport = async (admin, reportId, { resolution = '', status = 'resolved' } = {}) => {
  const report = await Report.findById(reportId);
  if (!report) throw new ApiError(404, 'Report not found');

  report.status = status;
  report.resolution = resolution;
  report.resolvedBy = admin._id;
  report.resolvedAt = new Date();
  await report.save();

  await logAdminAction(admin, 'report_resolve', `Resolved report ${reportId}`, {
    resource: 'report', resourceId: reportId,
  });

  return report.toSafeObject();
};

export const getReportStats = async () => {
  const stats = await Report.aggregate([
    { $group: { _id: { type: '$type', status: '$status' }, count: { $sum: 1 } } },
  ]);

  const grouped = {};
  stats.forEach((s) => {
    if (!grouped[s._id.type]) grouped[s._id.type] = {};
    grouped[s._id.type][s._id.status] = s.count;
  });

  return grouped;
};
