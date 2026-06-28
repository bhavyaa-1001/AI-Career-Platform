import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { Resume } from '../models/Resume.js';
import { ApiError } from '../utils/ApiError.js';
import { resumeToPlainText } from '../utils/resumePlainText.js';

import { logActivity } from './activityService.js';
import { syncTrackFromRecruiterStatus } from './applicationTrackingService.js';
import { rankCandidate } from './candidateRankingService.js';

const assertRecruiterApplication = async (id, recruiterId) => {
  const app = await Application.findOne({ _id: id, recruiterId });
  if (!app) throw new ApiError(404, 'Application not found');
  return app;
};

export const listJobApplications = async (
  jobId,
  recruiterId,
  { status = 'all', sort = 'ranking', page = 1, limit = 30 } = {},
) => {
  const job = await Job.findOne({ _id: jobId, recruiterId });
  if (!job) throw new ApiError(404, 'Job not found');

  const filter = { jobId };
  if (status !== 'all') filter.status = status;

  const sortOption = sort === 'recent' ? { createdAt: -1 } : { rankingScore: -1, createdAt: -1 };
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Application.find(filter).sort(sortOption).skip(skip).limit(limit),
    Application.countDocuments(filter),
  ]);

  return {
    job: job.toSafeObject(),
    applications: items.map((a) => a.toSafeObject()),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

export const getApplicationById = async (id, recruiterId) => {
  const app = await assertRecruiterApplication(id, recruiterId);
  return app.toSafeObject();
};

const getApplicantResume = async (resumeId, applicantId) => {
  const resume = await Resume.findOne({ _id: resumeId, userId: applicantId });
  if (!resume) throw new ApiError(404, 'Resume not found');
  return resume.toSafeObject();
};

export const getApplicationWithResume = async (id, recruiterId) => {
  const app = await assertRecruiterApplication(id, recruiterId);
  const resume = await getApplicantResume(app.resumeId, app.applicantId);
  return {
    application: app.toSafeObject(),
    resume,
  };
};

export const updateApplication = async (id, recruiterId, { status, notes }) => {
  const app = await assertRecruiterApplication(id, recruiterId);
  if (status) {
    app.status = status;
    syncTrackFromRecruiterStatus(app, status);
  }
  if (notes !== undefined) app.notes = notes;
  await app.save();

  await logActivity(recruiterId, 'application_reviewed', `Reviewed application: ${app.applicantName || 'Candidate'} — ${app.status}`, {
    applicationId: app._id.toString(),
    jobId: app.jobId.toString(),
    status: app.status,
  });

  return app.toSafeObject();
};

export const rankApplication = async (id, recruiterId) => {
  const app = await assertRecruiterApplication(id, recruiterId);
  const job = await Job.findById(app.jobId);
  if (!job) throw new ApiError(404, 'Job not found');

  const resume = await getApplicantResume(app.resumeId, app.applicantId);
  const resumeText = resumeToPlainText(resume);

  const ranking = await rankCandidate({
    resumeText,
    jobTitle: job.title,
    jobDescription: job.description,
    requirements: job.requirements,
    coverLetter: app.coverLetter,
  });

  app.rankingScore = ranking.score;
  app.rankingSummary = ranking.summary;
  app.rankingStrengths = ranking.strengths;
  app.rankingGaps = ranking.gaps;
  app.rankedAt = new Date();
  await app.save();

  return app.toSafeObject();
};

export const listRecentApplications = async (recruiterId, limit = 8) => {
  const items = await Application.find({ recruiterId })
    .sort({ createdAt: -1 })
    .limit(limit);
  return items.map((a) => a.toSafeObject());
};
