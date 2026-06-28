import { Application } from '../../models/Application.js';
import { Company } from '../../models/Company.js';
import { Job } from '../../models/Job.js';
import { User } from '../../models/User.js';
import { AdminRecruiterMeta } from '../../models/admin/AdminRecruiterMeta.js';
import { ApiError } from '../../utils/ApiError.js';

import { logAdminAction } from './auditService.js';

const paginate = (page, limit, total) => ({
  page, limit, total, pages: Math.ceil(total / limit) || 1,
});

export const listRecruiters = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const userFilter = { role: 'recruiter' };
  if (query.search) {
    const regex = new RegExp(query.search.trim(), 'i');
    userFilter.$or = [{ firstName: regex }, { lastName: regex }, { email: regex }];
  }

  let metaUserIds = null;
  if (query.status || query.kycStatus || query.premiumStatus) {
    const metaFilter = {};
    if (query.status) metaFilter.status = query.status;
    if (query.kycStatus) metaFilter.kycStatus = query.kycStatus;
    if (query.premiumStatus) metaFilter.premiumStatus = query.premiumStatus;
    const metas = await AdminRecruiterMeta.find(metaFilter).select('recruiterId');
    metaUserIds = metas.map((m) => m.recruiterId);
    userFilter._id = { $in: metaUserIds.length ? metaUserIds : ['000000000000000000000000'] };
  }

  const [recruiters, total] = await Promise.all([
    User.find(userFilter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(userFilter),
  ]);

  const ids = recruiters.map((r) => r._id);
  const [metas, companies] = await Promise.all([
    AdminRecruiterMeta.find({ recruiterId: { $in: ids } }),
    Company.find({ recruiterId: { $in: ids } }),
  ]);

  const metaMap = Object.fromEntries(metas.map((m) => [m.recruiterId.toString(), m.toSafeObject()]));
  const companyMap = Object.fromEntries(companies.map((c) => [c.recruiterId.toString(), c.toSafeObject()]));

  return {
    recruiters: recruiters.map((r) => ({
      ...r.toSafeObject(),
      meta: metaMap[r._id.toString()] || { status: 'approved', kycStatus: 'not_started', premiumStatus: 'none' },
      company: companyMap[r._id.toString()] || null,
    })),
    pagination: paginate(page, limit, total),
  };
};

const upsertRecruiterMeta = async (recruiterId, updates, adminId) => {
  const company = await Company.findOne({ recruiterId });
  return AdminRecruiterMeta.findOneAndUpdate(
    { recruiterId },
    { ...updates, companyId: company?._id, reviewedBy: adminId, reviewedAt: new Date() },
    { upsert: true, new: true },
  );
};

export const approveRecruiter = async (admin, recruiterId) => {
  const user = await User.findOne({ _id: recruiterId, role: 'recruiter' });
  if (!user) throw new ApiError(404, 'Recruiter not found');

  user.isActive = true;
  await user.save();
  const meta = await upsertRecruiterMeta(recruiterId, { status: 'approved', rejectionReason: '' }, admin._id);

  await logAdminAction(admin, 'recruiter_approve', `Approved recruiter ${user.email}`, {
    resource: 'recruiter', resourceId: recruiterId,
  });

  return { user: user.toSafeObject(), meta: meta.toSafeObject() };
};

export const rejectRecruiter = async (admin, recruiterId, { reason = '' } = {}) => {
  const user = await User.findOne({ _id: recruiterId, role: 'recruiter' });
  if (!user) throw new ApiError(404, 'Recruiter not found');

  user.isActive = false;
  await user.save();
  const meta = await upsertRecruiterMeta(recruiterId, { status: 'rejected', rejectionReason: reason }, admin._id);

  await logAdminAction(admin, 'recruiter_reject', `Rejected recruiter ${user.email}`, {
    resource: 'recruiter', resourceId: recruiterId,
  });

  return { user: user.toSafeObject(), meta: meta.toSafeObject() };
};

export const suspendRecruiter = async (admin, recruiterId, { reason = '' } = {}) => {
  const user = await User.findOne({ _id: recruiterId, role: 'recruiter' });
  if (!user) throw new ApiError(404, 'Recruiter not found');

  user.isActive = false;
  await user.save();
  const meta = await upsertRecruiterMeta(recruiterId, { status: 'suspended', adminNotes: reason }, admin._id);

  await logAdminAction(admin, 'user_suspend', `Suspended recruiter ${user.email}`, {
    resource: 'recruiter', resourceId: recruiterId,
  });

  return { user: user.toSafeObject(), meta: meta.toSafeObject() };
};

export const verifyCompany = async (admin, recruiterId) => {
  const meta = await upsertRecruiterMeta(recruiterId, {
    isVerified: true,
    verifiedAt: new Date(),
    kycStatus: 'verified',
  }, admin._id);

  await logAdminAction(admin, 'recruiter_approve', `Verified company for recruiter ${recruiterId}`, {
    resource: 'recruiter', resourceId: recruiterId,
  });

  return meta.toSafeObject();
};

export const updateRecruiterKyc = async (admin, recruiterId, { kycStatus, kycDocuments = [] }) => {
  const meta = await upsertRecruiterMeta(recruiterId, { kycStatus, kycDocuments }, admin._id);
  return meta.toSafeObject();
};

export const updateRecruiterPremium = async (admin, recruiterId, premiumStatus) => {
  const meta = await upsertRecruiterMeta(recruiterId, { premiumStatus }, admin._id);
  return meta.toSafeObject();
};

export const getRecruiterAnalytics = async (recruiterId) => {
  const user = await User.findOne({ _id: recruiterId, role: 'recruiter' });
  if (!user) throw new ApiError(404, 'Recruiter not found');

  const [company, jobs, applications, meta] = await Promise.all([
    Company.findOne({ recruiterId }),
    Job.find({ recruiterId }).sort({ createdAt: -1 }).limit(10),
    Application.aggregate([
      { $lookup: { from: 'jobs', localField: 'jobId', foreignField: '_id', as: 'job' } },
      { $unwind: '$job' },
      { $match: { 'job.recruiterId': user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    AdminRecruiterMeta.findOne({ recruiterId }),
  ]);

  return {
    recruiter: user.toSafeObject(),
    company: company?.toSafeObject() || null,
    meta: meta?.toSafeObject() || null,
    stats: {
      totalJobs: await Job.countDocuments({ recruiterId }),
      openJobs: await Job.countDocuments({ recruiterId, status: 'open' }),
      applicationsByStatus: Object.fromEntries(applications.map((a) => [a._id, a.count])),
    },
    recentJobs: jobs.map((j) => j.toSafeObject()),
  };
};
