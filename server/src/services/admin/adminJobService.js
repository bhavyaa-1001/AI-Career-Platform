import { Job } from '../../models/Job.js';
import { AdminJobMeta } from '../../models/admin/AdminJobMeta.js';
import { Report } from '../../models/admin/Report.js';
import { ApiError } from '../../utils/ApiError.js';

import { logAdminAction } from './auditService.js';

const paginate = (page, limit, total) => ({
  page, limit, total, pages: Math.ceil(total / limit) || 1,
});

const getOrCreateMeta = async (jobId) => {
  let meta = await AdminJobMeta.findOne({ jobId });
  if (!meta) meta = await AdminJobMeta.create({ jobId });
  return meta;
};

export const listJobs = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.search) {
    const regex = new RegExp(query.search.trim(), 'i');
    filter.$or = [{ title: regex }, { companyName: regex }];
  }

  if (query.featured === 'true' || query.moderationStatus || query.adminStatus) {
    const metaFilter = {};
    if (query.featured === 'true') metaFilter.isFeatured = true;
    if (query.moderationStatus) metaFilter.moderationStatus = query.moderationStatus;
    if (query.adminStatus) metaFilter.adminStatus = query.adminStatus;
    if (query.adminStatus === 'expired') metaFilter.expiresAt = { $lt: new Date() };

    const metas = await AdminJobMeta.find(metaFilter).select('jobId');
    const jobIds = metas.map((m) => m.jobId);
    filter._id = { $in: jobIds.length ? jobIds : ['000000000000000000000000'] };
  }

  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Job.countDocuments(filter),
  ]);

  const ids = jobs.map((j) => j._id);
  const metas = await AdminJobMeta.find({ jobId: { $in: ids } });
  const metaMap = Object.fromEntries(metas.map((m) => [m.jobId.toString(), m.toSafeObject()]));

  return {
    jobs: jobs.map((j) => ({
      ...j.toSafeObject(),
      meta: metaMap[j._id.toString()] || { moderationStatus: 'approved', adminStatus: 'active', isFeatured: false },
    })),
    pagination: paginate(page, limit, total),
  };
};

export const approveJob = async (admin, jobId) => {
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, 'Job not found');

  const meta = await AdminJobMeta.findOneAndUpdate(
    { jobId },
    { moderationStatus: 'approved', adminStatus: 'active', moderatedBy: admin._id, moderatedAt: new Date() },
    { upsert: true, new: true },
  );

  await logAdminAction(admin, 'job_approve', `Approved job ${job.title}`, {
    resource: 'job', resourceId: jobId,
  });

  return { job: job.toSafeObject(), meta: meta.toSafeObject() };
};

export const rejectJob = async (admin, jobId, { reason = '' } = {}) => {
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, 'Job not found');

  job.status = 'closed';
  await job.save();

  const meta = await AdminJobMeta.findOneAndUpdate(
    { jobId },
    { moderationStatus: 'rejected', rejectionReason: reason, moderatedBy: admin._id, moderatedAt: new Date() },
    { upsert: true, new: true },
  );

  await logAdminAction(admin, 'job_reject', `Rejected job ${job.title}`, {
    resource: 'job', resourceId: jobId,
  });

  return { job: job.toSafeObject(), meta: meta.toSafeObject() };
};

export const featureJob = async (admin, jobId, { featuredUntil = null } = {}) => {
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, 'Job not found');

  const meta = await AdminJobMeta.findOneAndUpdate(
    { jobId },
    { isFeatured: true, adminStatus: 'featured', featuredUntil: featuredUntil ? new Date(featuredUntil) : null },
    { upsert: true, new: true },
  );

  return { job: job.toSafeObject(), meta: meta.toSafeObject() };
};

export const deleteJob = async (admin, jobId) => {
  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, 'Job not found');

  await Job.findByIdAndDelete(jobId);
  await AdminJobMeta.deleteOne({ jobId });

  await logAdminAction(admin, 'admin_action', `Deleted job ${job.title}`, {
    resource: 'job', resourceId: jobId,
  });

  return { deleted: true };
};

export const getJobReports = async (jobId) => {
  const reports = await Report.find({ targetType: 'job', targetId: jobId }).sort({ createdAt: -1 });
  return reports.map((r) => r.toSafeObject());
};

export const markJobExpired = async (admin, jobId, expiresAt) => {
  const meta = await getOrCreateMeta(jobId);
  meta.adminStatus = 'expired';
  meta.expiresAt = expiresAt ? new Date(expiresAt) : new Date();
  await meta.save();
  return meta.toSafeObject();
};
