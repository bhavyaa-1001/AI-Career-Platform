import {
  getApplicationById,
  rankApplication,
} from '../services/applicationService.js';
import {
  addBookmark,
  browseOpenJobs,
  getOpenJobForStudent,
  getStudentApplication,
  getStudentApplications,
  listBookmarks,
  removeBookmark,
  submitApplication,
} from '../services/studentJobService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const browseJobsHandler = asyncHandler(async (req, res) => {
  const result = await browseOpenJobs(req.user._id, req.query);
  res.status(200).json({ success: true, data: result });
});

export const getOpenJobHandler = asyncHandler(async (req, res) => {
  const job = await getOpenJobForStudent(req.params.id, req.user._id);
  res.status(200).json({ success: true, data: { job } });
});

export const listBookmarksHandler = asyncHandler(async (req, res) => {
  const result = await listBookmarks(req.user._id, req.query);
  res.status(200).json({ success: true, data: result });
});

export const addBookmarkHandler = asyncHandler(async (req, res) => {
  const result = await addBookmark(req.user._id, req.params.id);
  res.status(201).json({ success: true, message: 'Job saved', data: result });
});

export const removeBookmarkHandler = asyncHandler(async (req, res) => {
  await removeBookmark(req.user._id, req.params.id);
  res.status(200).json({ success: true, message: 'Bookmark removed' });
});

export const listMyApplicationsHandler = asyncHandler(async (req, res) => {
  const result = await getStudentApplications(req.user._id, req.query);
  res.status(200).json({ success: true, data: result });
});

export const getMyApplicationHandler = asyncHandler(async (req, res) => {
  const result = await getStudentApplication(req.params.id, req.user._id);
  res.status(200).json({ success: true, data: result });
});

export const applyToJobHandler = asyncHandler(async (req, res) => {
  const application = await submitApplication(req.user._id, req.params.id, req.body);
  try {
    await rankApplication(application.id, application.recruiterId);
  } catch {
    /* optional */
  }
  const updated = await getApplicationById(application.id, application.recruiterId);
  res.status(201).json({ success: true, message: 'Application submitted', data: { application: updated } });
});
