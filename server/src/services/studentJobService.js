import { Application } from '../models/Application.js';
import { Job } from '../models/Job.js';
import { JobBookmark } from '../models/JobBookmark.js';
import { ApiError } from '../utils/ApiError.js';

import { applyToJob } from './jobService.js';

const buildOpenJobsFilter = ({
  search = '',
  employmentType,
  location,
  skill,
  salaryMin,
  bookmarkedOnly,
  bookmarkedJobIds,
}) => {
  const filter = { status: 'open' };

  if (bookmarkedOnly) {
    if (!bookmarkedJobIds?.length) return null;
    filter._id = { $in: bookmarkedJobIds };
  }

  if (employmentType) filter.employmentType = employmentType;
  if (location?.trim()) filter.location = { $regex: location.trim(), $options: 'i' };
  if (skill?.trim()) filter.skills = { $regex: skill.trim(), $options: 'i' };
  if (salaryMin != null && salaryMin > 0) {
    filter.$or = [
      { salaryMax: { $gte: salaryMin } },
      { salaryMin: { $gte: salaryMin } },
    ];
  }

  if (search.trim()) {
    const searchOr = [
      { title: { $regex: search.trim(), $options: 'i' } },
      { companyName: { $regex: search.trim(), $options: 'i' } },
      { location: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
    ];
    filter.$and = filter.$and || [];
    filter.$and.push({ $or: searchOr });
  }

  return filter;
};

const getSortOption = (sort) => {
  switch (sort) {
    case 'salary': return { salaryMax: -1, createdAt: -1 };
    case 'applicants': return { applicantCount: -1, createdAt: -1 };
    default: return { createdAt: -1 };
  }
};

const enrichJobsForStudent = async (jobs, userId) => {
  if (!jobs.length) return [];

  const jobIds = jobs.map((j) => j._id);
  const [bookmarks, applications] = await Promise.all([
    JobBookmark.find({ userId, jobId: { $in: jobIds } }).select('jobId'),
    Application.find({ applicantId: userId, jobId: { $in: jobIds } }).select('jobId status'),
  ]);

  const bookmarkSet = new Set(bookmarks.map((b) => b.jobId.toString()));
  const applicationMap = Object.fromEntries(
    applications.map((a) => [a.jobId.toString(), a.status]),
  );

  return jobs.map((job) => ({
    ...job.toSafeObject(),
    isBookmarked: bookmarkSet.has(job._id.toString()),
    hasApplied: Boolean(applicationMap[job._id.toString()]),
    applicationStatus: applicationMap[job._id.toString()] || null,
  }));
};

export const browseOpenJobs = async (userId, query = {}) => {
  const {
    search = '',
    employmentType,
    location,
    skill,
    salaryMin,
    bookmarkedOnly = false,
    sort = 'recent',
    page = 1,
    limit = 12,
  } = query;

  const bookmarks = await JobBookmark.find({ userId }).select('jobId');
  const bookmarkedJobIds = bookmarks.map((b) => b.jobId);

  const filter = buildOpenJobsFilter({
    search,
    employmentType,
    location,
    skill,
    salaryMin,
    bookmarkedOnly: bookmarkedOnly === true || bookmarkedOnly === 'true',
    bookmarkedJobIds,
  });

  if (!filter) {
    return {
      jobs: [],
      pagination: { page, limit, total: 0, pages: 1 },
    };
  }

  const skip = (page - 1) * limit;
  const [jobs, total] = await Promise.all([
    Job.find(filter).sort(getSortOption(sort)).skip(skip).limit(limit),
    Job.countDocuments(filter),
  ]);

  const enriched = await enrichJobsForStudent(jobs, userId);

  return {
    jobs: enriched,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

export const getOpenJobForStudent = async (jobId, userId) => {
  const job = await Job.findOne({ _id: jobId, status: 'open' });
  if (!job) throw new ApiError(404, 'Job not found');

  const [bookmark, application] = await Promise.all([
    JobBookmark.findOne({ userId, jobId }),
    Application.findOne({ applicantId: userId, jobId }),
  ]);

  return {
    ...job.toSafeObject(),
    isBookmarked: Boolean(bookmark),
    hasApplied: Boolean(application),
    applicationStatus: application?.status || null,
    applicationId: application?._id?.toString() || null,
  };
};

export const listBookmarks = async (userId, { page = 1, limit = 12 } = {}) => {
  const skip = (page - 1) * limit;
  const [bookmarks, total] = await Promise.all([
    JobBookmark.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    JobBookmark.countDocuments({ userId }),
  ]);

  const jobIds = bookmarks.map((b) => b.jobId);
  const jobs = await Job.find({ _id: { $in: jobIds }, status: 'open' });
  const jobMap = Object.fromEntries(jobs.map((j) => [j._id.toString(), j]));
  const ordered = bookmarks
    .map((b) => jobMap[b.jobId.toString()])
    .filter(Boolean);

  const enriched = await enrichJobsForStudent(ordered, userId);

  return {
    bookmarks: enriched,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

export const addBookmark = async (userId, jobId) => {
  const job = await Job.findOne({ _id: jobId, status: 'open' });
  if (!job) throw new ApiError(404, 'Job not found');

  const existing = await JobBookmark.findOne({ userId, jobId });
  if (existing) return { bookmark: existing.toSafeObject(), job: job.toSafeObject() };

  const bookmark = await JobBookmark.create({ userId, jobId });
  return { bookmark: bookmark.toSafeObject(), job: job.toSafeObject() };
};

export const removeBookmark = async (userId, jobId) => {
  const bookmark = await JobBookmark.findOneAndDelete({ userId, jobId });
  if (!bookmark) throw new ApiError(404, 'Bookmark not found');
  return { removed: true };
};

export const getStudentApplication = async (applicationId, userId) => {
  const app = await Application.findOne({ _id: applicationId, applicantId: userId });
  if (!app) throw new ApiError(404, 'Application not found');

  const job = await Job.findById(app.jobId);
  return {
    application: app.toSafeObject(),
    job: job?.toSafeObject() || null,
  };
};

export const getStudentApplications = async (userId, query = {}) => {
  const { status = 'all', trackStatus, page = 1, limit = 12 } = query;
  const filter = { applicantId: userId };
  if (status !== 'all') filter.status = status;
  if (trackStatus && trackStatus !== 'all') filter.trackStatus = trackStatus;

  const skip = (page - 1) * limit;
  const [items, total] = await Promise.all([
    Application.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Application.countDocuments(filter),
  ]);

  return {
    applications: items.map((a) => a.toSafeObject()),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) || 1 },
  };
};

export const submitApplication = async (userId, jobId, data) => applyToJob(jobId, userId, data);
