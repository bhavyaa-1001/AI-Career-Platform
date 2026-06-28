import { Resume } from '../../models/Resume.js';
import { ResumeAnalysis } from '../../models/ResumeAnalysis.js';
import { ResumeVersion } from '../../models/ResumeVersion.js';
import { AdminResumeMeta } from '../../models/admin/AdminResumeMeta.js';
import { ApiError } from '../../utils/ApiError.js';

import { logAdminAction } from './auditService.js';

const paginate = (page, limit, total) => ({
  page, limit, total, pages: Math.ceil(total / limit) || 1,
});

export const listResumes = async (query = {}) => {
  const page = Number(query.page) || 1;
  const limit = Math.min(Number(query.limit) || 20, 100);
  const skip = (page - 1) * limit;

  const filter = {};
  if (query.userId) filter.userId = query.userId;
  if (query.search) filter.title = new RegExp(query.search.trim(), 'i');

  if (query.adminStatus) {
    const metas = await AdminResumeMeta.find({ adminStatus: query.adminStatus }).select('resumeId');
    const ids = metas.map((m) => m.resumeId);
    filter._id = { $in: ids.length ? ids : ['000000000000000000000000'] };
  } else {
    const deletedMetas = await AdminResumeMeta.find({ adminStatus: 'deleted' }).select('resumeId');
    const deletedIds = deletedMetas.map((m) => m.resumeId);
    if (deletedIds.length) filter._id = { $nin: deletedIds };
  }

  const [resumes, total] = await Promise.all([
    Resume.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(limit),
    Resume.countDocuments(filter),
  ]);

  const ids = resumes.map((r) => r._id);
  const [metas, analyses] = await Promise.all([
    AdminResumeMeta.find({ resumeId: { $in: ids } }),
    ResumeAnalysis.find({ resumeId: { $in: ids }, status: 'completed' }).sort({ createdAt: -1 }),
  ]);

  const metaMap = Object.fromEntries(metas.map((m) => [m.resumeId.toString(), m.toSafeObject()]));
  const atsMap = {};
  analyses.forEach((a) => {
    if (!atsMap[a.resumeId.toString()]) atsMap[a.resumeId.toString()] = a.atsScore;
  });

  return {
    resumes: resumes.map((r) => ({
      id: r._id.toString(),
      userId: r.userId.toString(),
      title: r.title,
      template: r.template,
      isDefault: r.isDefault,
      updatedAt: r.updatedAt,
      atsScore: atsMap[r._id.toString()] ?? metaMap[r._id.toString()]?.lastAtsScore ?? null,
      meta: metaMap[r._id.toString()] || { adminStatus: 'active' },
    })),
    pagination: paginate(page, limit, total),
  };
};

export const getResumeDetail = async (resumeId) => {
  const resume = await Resume.findById(resumeId);
  if (!resume) throw new ApiError(404, 'Resume not found');

  const [meta, analyses, versions] = await Promise.all([
    AdminResumeMeta.findOne({ resumeId }),
    ResumeAnalysis.find({ resumeId, status: 'completed' }).sort({ createdAt: -1 }).limit(10),
    ResumeVersion.find({ resumeId }).sort({ versionNumber: -1 }).limit(20),
  ]);

  return {
    resume: {
      id: resume._id.toString(),
      userId: resume.userId.toString(),
      title: resume.title,
      template: resume.template,
      isDefault: resume.isDefault,
      sectionOrder: resume.sectionOrder,
      updatedAt: resume.updatedAt,
    },
    meta: meta?.toSafeObject() || null,
    analyses: analyses.map((a) => ({
      id: a._id.toString(),
      atsScore: a.atsScore,
      grammarScore: a.grammarScore,
      createdAt: a.createdAt,
    })),
    versions: versions.map((v) => ({
      id: v._id.toString(),
      versionNumber: v.versionNumber,
      label: v.label,
      createdAt: v.createdAt,
    })),
  };
};

export const softDeleteResume = async (admin, resumeId) => {
  const resume = await Resume.findById(resumeId);
  if (!resume) throw new ApiError(404, 'Resume not found');

  const meta = await AdminResumeMeta.findOneAndUpdate(
    { resumeId },
    { adminStatus: 'deleted', deletedAt: new Date(), deletedBy: admin._id, userId: resume.userId },
    { upsert: true, new: true },
  );

  await logAdminAction(admin, 'admin_action', `Deleted resume ${resume.title}`, {
    resource: 'resume', resourceId: resumeId,
  });

  return meta.toSafeObject();
};

export const restoreResume = async (admin, resumeId) => {
  const meta = await AdminResumeMeta.findOneAndUpdate(
    { resumeId },
    { adminStatus: 'active', deletedAt: null, deletedBy: null },
    { new: true },
  );
  if (!meta) throw new ApiError(404, 'Resume meta not found');

  await logAdminAction(admin, 'admin_action', `Restored resume ${resumeId}`, {
    resource: 'resume', resourceId: resumeId,
  });

  return meta.toSafeObject();
};
