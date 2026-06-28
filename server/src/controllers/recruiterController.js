import {
  getApplicationById,
  getApplicationWithResume,
  listJobApplications,
  rankApplication,
  updateApplication,
} from '../services/applicationService.js';
import { getOrCreateCompany, upsertCompany } from '../services/companyService.js';
import {
  applyToJob,
  createJob,
  deleteJob,
  getJobById,
  listOpenJobs,
  listRecruiterJobs,
  listStudentApplications,
  updateJob,
} from '../services/jobService.js';
import {
  getRecruiterAnalytics,
  getRecruiterDashboard,
} from '../services/recruiterDashboardService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const recruiterDashboardHandler = asyncHandler(async (req, res) => {
  const data = await getRecruiterDashboard(req.user._id);
  res.status(200).json({ success: true, data });
});

export const recruiterAnalyticsHandler = asyncHandler(async (req, res) => {
  const analytics = await getRecruiterAnalytics(req.user._id);
  res.status(200).json({ success: true, data: { analytics } });
});

export const getCompanyHandler = asyncHandler(async (req, res) => {
  const company = await getOrCreateCompany(req.user._id);
  res.status(200).json({ success: true, data: { company } });
});

export const updateCompanyHandler = asyncHandler(async (req, res) => {
  const company = await upsertCompany(req.user._id, req.body);
  res.status(200).json({ success: true, message: 'Company profile saved', data: { company } });
});

export const listJobsHandler = asyncHandler(async (req, res) => {
  const result = await listRecruiterJobs(req.user._id, req.query);
  res.status(200).json({ success: true, data: result });
});

export const createJobHandler = asyncHandler(async (req, res) => {
  const job = await createJob(req.user._id, req.body);
  res.status(201).json({ success: true, message: 'Job created', data: { job } });
});

export const getJobHandler = asyncHandler(async (req, res) => {
  const job = await getJobById(req.params.id, req.user._id);
  res.status(200).json({ success: true, data: { job } });
});

export const updateJobHandler = asyncHandler(async (req, res) => {
  const job = await updateJob(req.params.id, req.user._id, req.body);
  res.status(200).json({ success: true, message: 'Job updated', data: { job } });
});

export const deleteJobHandler = asyncHandler(async (req, res) => {
  await deleteJob(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Job deleted' });
});

export const listJobApplicationsHandler = asyncHandler(async (req, res) => {
  const result = await listJobApplications(req.params.jobId, req.user._id, req.query);
  res.status(200).json({ success: true, data: result });
});

export const getApplicationHandler = asyncHandler(async (req, res) => {
  const result = await getApplicationWithResume(req.params.id, req.user._id);
  res.status(200).json({ success: true, data: result });
});

export const updateApplicationHandler = asyncHandler(async (req, res) => {
  const application = await updateApplication(req.params.id, req.user._id, req.body);
  res.status(200).json({ success: true, message: 'Application updated', data: { application } });
});

export const rankApplicationHandler = asyncHandler(async (req, res) => {
  const application = await rankApplication(req.params.id, req.user._id);
  res.status(200).json({ success: true, message: 'Candidate ranked', data: { application } });
});

export const listOpenJobsHandler = asyncHandler(async (req, res) => {
  const result = await listOpenJobs(req.query);
  res.status(200).json({ success: true, data: result });
});

export const applyJobHandler = asyncHandler(async (req, res) => {
  const application = await applyToJob(req.params.id, req.user._id, req.body);
  try {
    await rankApplication(application.id, application.recruiterId);
  } catch {
    /* ranking optional */
  }
  const updated = await getApplicationById(application.id, application.recruiterId);
  res.status(201).json({ success: true, message: 'Application submitted', data: { application: updated } });
});

export const listMyApplicationsHandler = asyncHandler(async (req, res) => {
  const result = await listStudentApplications(req.user._id, req.query);
  res.status(200).json({ success: true, data: result });
});
