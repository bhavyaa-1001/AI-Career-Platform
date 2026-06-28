import crypto from 'crypto';

import { MAX_VERSIONS, RESUME_SECTIONS, Resume } from '../models/Resume.js';
import { ResumeVersion } from '../models/ResumeVersion.js';
import { ApiError } from '../utils/ApiError.js';

import { logActivity } from './activityService.js';
import { getFullProfile } from './profileService.js';

const hashSnapshot = (data) =>
  crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');

const ensureOwnership = async (resumeId, userId) => {
  const resume = await Resume.findOne({ _id: resumeId, userId });
  if (!resume) throw new ApiError(404, 'Resume not found');
  return resume;
};

const createVersion = async (resume, label = 'Auto-save') => {
  const snapshot = resume.toSafeObject();
  const lastVersion = await ResumeVersion.findOne({ resumeId: resume._id })
    .sort({ versionNumber: -1 })
    .select('snapshot versionNumber');

  const snapshotHash = hashSnapshot(snapshot);
  const lastHash = lastVersion ? hashSnapshot(lastVersion.snapshot) : null;

  if (snapshotHash === lastHash) return null;

  const versionNumber = (lastVersion?.versionNumber || 0) + 1;

  const version = await ResumeVersion.create({
    resumeId: resume._id,
    userId: resume.userId,
    versionNumber,
    snapshot,
    label,
  });

  const count = await ResumeVersion.countDocuments({ resumeId: resume._id });
  if (count > MAX_VERSIONS) {
    const oldest = await ResumeVersion.find({ resumeId: resume._id })
      .sort({ versionNumber: 1 })
      .limit(count - MAX_VERSIONS)
      .select('_id');
    await ResumeVersion.deleteMany({ _id: { $in: oldest.map((v) => v._id) } });
  }

  return version.toSafeObject();
};

const applyUpdate = (resume, data) => {
  if (data.title !== undefined) resume.title = data.title;
  if (data.template !== undefined) resume.template = data.template;
  if (data.settings !== undefined) resume.settings = { ...resume.settings.toObject?.() || resume.settings, ...data.settings };
  if (data.sectionOrder !== undefined) resume.sectionOrder = data.sectionOrder;
  if (data.sectionVisibility !== undefined) {
    resume.sectionVisibility = { ...resume.sectionVisibility, ...data.sectionVisibility };
  }
  if (data.content !== undefined) {
    const c = data.content;
    if (c.personalInfo) resume.content.personalInfo = { ...resume.content.personalInfo.toObject?.() || resume.content.personalInfo, ...c.personalInfo };
    if (c.summary) resume.content.summary = { ...resume.content.summary.toObject?.() || resume.content.summary, ...c.summary };
    if (c.socialLinks) resume.content.socialLinks = { ...resume.content.socialLinks.toObject?.() || resume.content.socialLinks, ...c.socialLinks };
    if (c.education) resume.content.education = c.education;
    if (c.experience) resume.content.experience = c.experience;
    if (c.projects) resume.content.projects = c.projects;
    if (c.skills) resume.content.skills = c.skills;
    if (c.certificates) resume.content.certificates = c.certificates;
    if (c.achievements) resume.content.achievements = c.achievements;
    if (c.languages) resume.content.languages = c.languages;
    if (c.interests) resume.content.interests = c.interests;
  }
  if (data.isDefault !== undefined) resume.isDefault = data.isDefault;
};

export const getUserResumes = async (userId) => {
  const resumes = await Resume.find({ userId }).sort({ updatedAt: -1 });
  return resumes.map((r) => ({
    id: r._id.toString(),
    title: r.title,
    template: r.template,
    isDefault: r.isDefault,
    imported: Boolean(r.importMeta?.importedAt),
    lastAutoSavedAt: r.lastAutoSavedAt,
    updatedAt: r.updatedAt,
    createdAt: r.createdAt,
  }));
};

export const getResumeById = async (resumeId, userId) => {
  const resume = await ensureOwnership(resumeId, userId);
  return resume.toSafeObject();
};

export const createResume = async (userId, data = {}) => {
  if (data.isDefault) {
    await Resume.updateMany({ userId }, { isDefault: false });
  }

  const count = await Resume.countDocuments({ userId });
  const resume = await Resume.create({
    userId,
    title: data.title || `Resume ${count + 1}`,
    template: data.template || 'modern',
    isDefault: data.isDefault ?? count === 0,
    ...data,
  });

  await createVersion(resume, 'Initial version');
  await logActivity(userId, 'profile_update', `Created resume: ${resume.title}`, { resumeId: resume._id });

  return resume.toSafeObject();
};

export const updateResume = async (resumeId, userId, data, { autosave = false, versionLabel } = {}) => {
  const resume = await ensureOwnership(resumeId, userId);

  if (data.isDefault) {
    await Resume.updateMany({ userId, _id: { $ne: resumeId } }, { isDefault: false });
  }

  applyUpdate(resume, data);
  resume.lastAutoSavedAt = new Date();
  resume.markModified('content');
  await resume.save();

  await createVersion(resume, versionLabel || (autosave ? 'Auto-save' : 'Manual save'));
  if (!autosave) {
    await logActivity(userId, 'profile_update', `Updated resume: ${resume.title}`, { resumeId: resume._id });
  }

  return resume.toSafeObject();
};

export const deleteResume = async (resumeId, userId) => {
  const resume = await ensureOwnership(resumeId, userId);
  await ResumeVersion.deleteMany({ resumeId: resume._id });
  await resume.deleteOne();
  await logActivity(userId, 'profile_update', `Deleted resume: ${resume.title}`);
};

export const duplicateResume = async (resumeId, userId) => {
  const resume = await ensureOwnership(resumeId, userId);
  const copy = await Resume.create({
    userId,
    title: `${resume.title} (Copy)`,
    template: resume.template,
    settings: resume.settings,
    sectionOrder: resume.sectionOrder,
    sectionVisibility: resume.sectionVisibility,
    content: resume.content,
    isDefault: false,
  });
  await createVersion(copy, 'Duplicated');
  return copy.toSafeObject();
};

export const importFromProfile = async (userId, title) => {
  const { user, profile } = await getFullProfile(userId);

  const content = {
    personalInfo: {
      fullName: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      phone: profile.phone || '',
      location: profile.location || '',
      headline: profile.headline || '',
      website: profile.portfolio || profile.resumeUrl || '',
    },
    summary: { text: profile.bio || '' },
    education: profile.education || [],
    experience: profile.experience || [],
    projects: profile.projects || [],
    skills: profile.skills || [],
    certificates: profile.certifications || [],
    achievements: [],
    languages: profile.languages || [],
    interests: [],
    socialLinks: {
      github: profile.github || '',
      linkedin: profile.linkedin || '',
      portfolio: profile.portfolio || '',
      twitter: profile.socialLinks?.twitter || '',
    },
  };

  return createResume(userId, { title: title || 'Imported from Profile', content });
};

export const getResumeVersions = async (resumeId, userId) => {
  await ensureOwnership(resumeId, userId);
  const versions = await ResumeVersion.find({ resumeId })
    .sort({ versionNumber: -1 })
    .select('versionNumber label createdAt id');
  return versions.map((v) => ({
    id: v._id.toString(),
    versionNumber: v.versionNumber,
    label: v.label,
    createdAt: v.createdAt,
  }));
};

export const getResumeVersion = async (resumeId, versionId, userId) => {
  await ensureOwnership(resumeId, userId);
  const version = await ResumeVersion.findOne({ _id: versionId, resumeId, userId });
  if (!version) throw new ApiError(404, 'Version not found');
  return version.toSafeObject();
};

export const restoreResumeVersion = async (resumeId, versionId, userId) => {
  const resume = await ensureOwnership(resumeId, userId);
  const version = await ResumeVersion.findOne({ _id: versionId, resumeId, userId });
  if (!version) throw new ApiError(404, 'Version not found');

  const snap = version.snapshot;
  applyUpdate(resume, {
    title: snap.title,
    template: snap.template,
    settings: snap.settings,
    sectionOrder: snap.sectionOrder,
    sectionVisibility: snap.sectionVisibility,
    content: snap.content,
  });
  resume.lastAutoSavedAt = new Date();
  resume.markModified('content');
  await resume.save();

  await createVersion(resume, `Restored v${version.versionNumber}`);
  await logActivity(userId, 'profile_update', `Restored resume to version ${version.versionNumber}`);

  return resume.toSafeObject();
};

export { RESUME_SECTIONS };
