import { Application } from '../models/Application.js';
import { Company } from '../models/Company.js';
import { Job } from '../models/Job.js';
import { ApiError } from '../utils/ApiError.js';

import { logActivity } from './activityService.js';
import { initializeApplicationTracking } from './applicationTrackingService.js';
import { getOrCreateCompany } from './companyService.js';
import { getResumeById } from './resumeService.js';

const assertRecruiterJob = async (jobId, recruiterId) => {
  const job = await Job.findOne({ _id: jobId, recruiterId });
  if (!job) throw new ApiError(404, 'Job not found');
  return job;
};

export const createJob = async (recruiterId, data) => {
  await getOrCreateCompany(recruiterId);
  const companyRecord = await Company.findOne({ recruiterId });
  if (!companyRecord) throw new ApiError(422, 'Set up your company profile before posting jobs');

  const job = await Job.create({
    recruiterId,
    companyId: companyRecord._id,
    companyName: companyRecord.name,
    ...data,
    skills: data.skills || [],
    status: data.status || 'draft',
  });

  await logActivity(recruiterId, 'job_posted', `Posted job: ${job.title}`, {
    jobId: job._id.toString(),
    status: job.status,
  });

  return job.toSafeObject();
};

export const listRecruiterJobs = async (recruiterId, { status = 'all', page = 1, limit = 20 } = {}) => {
  const filter = { recruiterId };
  if (status !== 'all') filter.status = status;
  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Job.countDocuments(filter),
  ]);

  return {
    jobs: jobs.map((j) => j.toSafeObject()),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

export const getJobById = async (jobId, recruiterId) => {
  const job = await assertRecruiterJob(jobId, recruiterId);
  return job.toSafeObject();
};

export const getRecruiterJobDoc = async (jobId, recruiterId) => assertRecruiterJob(jobId, recruiterId);

export const updateJob = async (jobId, recruiterId, data) => {
  const job = await assertRecruiterJob(jobId, recruiterId);
  Object.assign(job, data);
  if (data.skills) job.skills = data.skills;
  await job.save();

  await logActivity(recruiterId, 'job_updated', `Updated job: ${job.title}`, {
    jobId: job._id.toString(),
    status: job.status,
  });

  return job.toSafeObject();
};

export const deleteJob = async (jobId, recruiterId) => {
  const job = await assertRecruiterJob(jobId, recruiterId);
  await Application.deleteMany({ jobId: job._id });
  await job.deleteOne();
};

export const listOpenJobs = async ({ search = '', page = 1, limit = 20 } = {}) => {
  const filter = { status: 'open' };
  if (search.trim()) {
    filter.$or = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { companyName: { $regex: search.trim(), $options: 'i' } },
      { location: { $regex: search.trim(), $options: 'i' } },
    ];
  }
  const skip = (page - 1) * limit;

  const [jobs, total] = await Promise.all([
    Job.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Job.countDocuments(filter),
  ]);

  return {
    jobs: jobs.map((j) => j.toSafeObject()),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

export const applyToJob = async (jobId, applicantId, { resumeId, coverLetter = '' }) => {
  const job = await Job.findOne({ _id: jobId, status: 'open' });
  if (!job) throw new ApiError(404, 'Job not found or not accepting applications');

  const existing = await Application.findOne({ jobId, applicantId });
  if (existing) throw new ApiError(409, 'You have already applied to this job');

  const resume = await getResumeById(resumeId, applicantId);
  const applicantName = resume.content?.personalInfo?.fullName || '';
  const applicantEmail = resume.content?.personalInfo?.email || '';

  const application = new Application({
    jobId: job._id,
    recruiterId: job.recruiterId,
    applicantId,
    resumeId: resume.id,
    applicantName,
    applicantEmail,
    jobTitle: job.title,
    companyName: job.companyName,
    coverLetter: coverLetter || '',
    status: 'pending',
  });
  initializeApplicationTracking(application);
  await application.save();

  await Job.updateOne({ _id: job._id }, { $inc: { applicantCount: 1 } });

  await logActivity(applicantId, 'application_received', `Applied to ${job.title} at ${job.companyName}`, {
    applicationId: application._id.toString(),
    jobId: job._id.toString(),
  });

  await logActivity(job.recruiterId, 'application_received', `New application for ${job.title}: ${applicantName || 'Candidate'}`, {
    applicationId: application._id.toString(),
    jobId: job._id.toString(),
  });

  return application.toSafeObject();
};

export const listStudentApplications = async (applicantId, { page = 1, limit = 20 } = {}) => {
  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Application.find({ applicantId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Application.countDocuments({ applicantId }),
  ]);
  return {
    applications: items.map((a) => a.toSafeObject()),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};
