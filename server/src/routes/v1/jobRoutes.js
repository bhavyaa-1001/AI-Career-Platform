import { Router } from 'express';

import {
  addAttachmentFileHandler,
  addAttachmentUrlHandler,
  addNoteHandler,
  deleteAttachmentHandler,
  deleteNoteHandler,
  kanbanHandler,
  trackingAnalyticsHandler,
  trackingDetailHandler,
  updateNoteHandler,
  updateTrackStatusHandler,
} from '../../controllers/applicationTrackingController.js';
import {
  createJobHandler,
  deleteJobHandler,
  getApplicationHandler,
  getCompanyHandler,
  getJobHandler,
  listJobApplicationsHandler,
  listJobsHandler,
  rankApplicationHandler,
  recruiterAnalyticsHandler,
  recruiterDashboardHandler,
  updateApplicationHandler,
  updateCompanyHandler,
  updateJobHandler,
} from '../../controllers/recruiterController.js';
import {
  addBookmarkHandler,
  applyToJobHandler,
  browseJobsHandler,
  getMyApplicationHandler,
  getOpenJobHandler,
  listBookmarksHandler,
  listMyApplicationsHandler,
  removeBookmarkHandler,
} from '../../controllers/studentJobController.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { uploadAttachment, handleMulterError } from '../../middleware/upload.js';
import { validate } from '../../middleware/validate.js';
import {
  addAttachmentUrlSchema,
  addNoteSchema,
  deleteAttachmentSchema,
  deleteNoteSchema,
  noteIdSchema,
  trackingApplicationIdSchema,
  updateTrackStatusSchema,
} from '../../validators/applicationTrackingValidator.js';
import {
  applicationIdSchema,
  jobApplicationsSchema,
  updateApplicationSchema,
} from '../../validators/applicationValidator.js';
import { updateCompanySchema } from '../../validators/companyValidator.js';
import {
  applyJobSchema,
  createJobSchema,
  jobIdSchema,
  listJobsSchema,
  updateJobSchema,
} from '../../validators/jobValidator.js';
import {
  bookmarkJobSchema,
  browseJobsSchema,
  listBookmarksSchema,
  listStudentApplicationsSchema,
  studentApplicationIdSchema,
} from '../../validators/studentJobValidator.js';

const router = Router();
const studentOnly = authorize('student');

router.use(authenticate);

const recruiter = Router();
recruiter.use(authorize('recruiter'));

recruiter.get('/dashboard', recruiterDashboardHandler);
recruiter.get('/analytics', recruiterAnalyticsHandler);
recruiter.get('/company', getCompanyHandler);
recruiter.patch('/company', validate(updateCompanySchema), updateCompanyHandler);
recruiter.get('/jobs', validate(listJobsSchema), listJobsHandler);
recruiter.post('/jobs', validate(createJobSchema), createJobHandler);
recruiter.get('/jobs/:id', validate(jobIdSchema), getJobHandler);
recruiter.patch('/jobs/:id', validate(updateJobSchema), updateJobHandler);
recruiter.delete('/jobs/:id', validate(jobIdSchema), deleteJobHandler);
recruiter.get('/jobs/:jobId/applications', validate(jobApplicationsSchema), listJobApplicationsHandler);
recruiter.get('/applications/:id', validate(applicationIdSchema), getApplicationHandler);
recruiter.patch('/applications/:id', validate(updateApplicationSchema), updateApplicationHandler);
recruiter.post('/applications/:id/rank', validate(applicationIdSchema), rankApplicationHandler);

router.use('/recruiter', recruiter);

router.get('/open', studentOnly, validate(browseJobsSchema), browseJobsHandler);
router.get('/tracking/kanban', studentOnly, kanbanHandler);
router.get('/tracking/analytics', studentOnly, trackingAnalyticsHandler);
router.get('/bookmarks', studentOnly, validate(listBookmarksSchema), listBookmarksHandler);
router.get('/applications', studentOnly, validate(listStudentApplicationsSchema), listMyApplicationsHandler);
router.get('/applications/:id', studentOnly, validate(studentApplicationIdSchema), getMyApplicationHandler);
router.get('/tracking/applications/:id', studentOnly, validate(trackingApplicationIdSchema), trackingDetailHandler);
router.patch('/tracking/applications/:id/status', studentOnly, validate(updateTrackStatusSchema), updateTrackStatusHandler);
router.post('/tracking/applications/:id/notes', studentOnly, validate(addNoteSchema), addNoteHandler);
router.patch('/tracking/applications/:id/notes/:noteId', studentOnly, validate(noteIdSchema), updateNoteHandler);
router.delete('/tracking/applications/:id/notes/:noteId', studentOnly, validate(deleteNoteSchema), deleteNoteHandler);
router.post('/tracking/applications/:id/attachments', studentOnly, validate(addAttachmentUrlSchema), addAttachmentUrlHandler);
router.post(
  '/tracking/applications/:id/attachments/upload',
  studentOnly,
  uploadAttachment.single('file'),
  handleMulterError,
  validate(trackingApplicationIdSchema),
  addAttachmentFileHandler,
);
router.delete(
  '/tracking/applications/:id/attachments/:attachmentId',
  studentOnly,
  validate(deleteAttachmentSchema),
  deleteAttachmentHandler,
);
router.get('/my-applications', studentOnly, validate(listStudentApplicationsSchema), listMyApplicationsHandler);
router.post('/:id/bookmark', studentOnly, validate(bookmarkJobSchema), addBookmarkHandler);
router.delete('/:id/bookmark', studentOnly, validate(bookmarkJobSchema), removeBookmarkHandler);
router.post('/:id/apply', studentOnly, validate(applyJobSchema), applyToJobHandler);
router.get('/:id', studentOnly, validate(jobIdSchema), getOpenJobHandler);

export default router;
