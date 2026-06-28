import { Router } from 'express';

import {
  dashboardHandler, analyticsHandler,
  listUsersHandler, getUserHandler, createUserHandler, updateUserHandler, deleteUserHandler,
  suspendUserHandler, activateUserHandler, banUserHandler, unbanUserHandler,
  assignRoleHandler, resetPasswordHandler, bulkActionHandler, exportUsersHandler,
  listRecruitersHandler, approveRecruiterHandler, rejectRecruiterHandler, suspendRecruiterHandler,
  verifyCompanyHandler, updateKycHandler, updatePremiumHandler, recruiterAnalyticsHandler,
  listJobsHandler, approveJobHandler, rejectJobHandler, featureJobHandler, deleteJobHandler,
  jobReportsHandler, expireJobHandler,
  listResumesHandler, getResumeHandler, deleteResumeHandler, restoreResumeHandler,
  codingOverviewHandler, adminProblemsHandler, adminContestsHandler, adminDailyHandler,
  adminLeaderboardHandler, adminAchievementsHandler, updateProblemCategoryHandler,
  listInterviewsHandler, deleteInterviewHandler,
  listTemplatesHandler, createTemplateHandler, updateTemplateHandler, deleteTemplateHandler,
  listQuestionsHandler, createQuestionHandler, updateQuestionHandler, deleteQuestionHandler,
  listCmsHandler, getCmsHandler, createCmsHandler, updateCmsHandler, deleteCmsHandler,
  listBroadcastsHandler, createBroadcastHandler, sendBroadcastHandler, deleteBroadcastHandler,
  listReportsHandler, reportStatsHandler, resolveReportHandler,
  listAuditHandler, auditStatsHandler, exportAuditHandler,
  getSettingsHandler, getSettingsCategoryHandler, updateSettingsHandler,
} from '../../controllers/adminController.js';
import { adminAuditMiddleware } from '../../middleware/adminAudit.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import {
  listUsersSchema, createUserSchema, updateUserSchema, idParamSchema,
  suspendUserSchema, banUserSchema, assignRoleSchema, resetPasswordSchema, bulkActionSchema,
  listRecruitersSchema, recruiterActionSchema,
  listJobsSchema, listResumesSchema,
  listCmsSchema, createCmsSchema, updateCmsSchema,
  createBroadcastSchema, listReportsSchema, resolveReportSchema,
  listAuditSchema, updateSettingsSchema,
  createQuestionSchema, createTemplateSchema, dateRangeSchema, listPaginationSchema,
} from '../../validators/adminValidator.js';

const router = Router();

router.use(authenticate, authorize('admin', 'sub_admin'), adminAuditMiddleware);

// Dashboard & Analytics
router.get('/dashboard', validate(dateRangeSchema), dashboardHandler);
router.get('/analytics', validate(dateRangeSchema), analyticsHandler);

// Users
router.get('/users', validate(listUsersSchema), listUsersHandler);
router.get('/users/export', validate(listUsersSchema), exportUsersHandler);
router.get('/users/:id', validate(idParamSchema), getUserHandler);
router.post('/users', validate(createUserSchema), createUserHandler);
router.patch('/users/:id', validate(updateUserSchema), updateUserHandler);
router.delete('/users/:id', validate(idParamSchema), deleteUserHandler);
router.post('/users/:id/suspend', validate(suspendUserSchema), suspendUserHandler);
router.post('/users/:id/activate', validate(idParamSchema), activateUserHandler);
router.post('/users/:id/ban', validate(banUserSchema), banUserHandler);
router.post('/users/:id/unban', validate(idParamSchema), unbanUserHandler);
router.patch('/users/:id/role', validate(assignRoleSchema), assignRoleHandler);
router.post('/users/:id/reset-password', validate(resetPasswordSchema), resetPasswordHandler);
router.post('/users/bulk', validate(bulkActionSchema), bulkActionHandler);

// Recruiters
router.get('/recruiters', validate(listRecruitersSchema), listRecruitersHandler);
router.get('/recruiters/:id/analytics', validate(idParamSchema), recruiterAnalyticsHandler);
router.post('/recruiters/:id/approve', validate(recruiterActionSchema), approveRecruiterHandler);
router.post('/recruiters/:id/reject', validate(recruiterActionSchema), rejectRecruiterHandler);
router.post('/recruiters/:id/suspend', validate(recruiterActionSchema), suspendRecruiterHandler);
router.post('/recruiters/:id/verify', validate(idParamSchema), verifyCompanyHandler);
router.patch('/recruiters/:id/kyc', validate(idParamSchema), updateKycHandler);
router.patch('/recruiters/:id/premium', validate(idParamSchema), updatePremiumHandler);

// Jobs
router.get('/jobs', validate(listJobsSchema), listJobsHandler);
router.post('/jobs/:id/approve', validate(idParamSchema), approveJobHandler);
router.post('/jobs/:id/reject', validate(idParamSchema), rejectJobHandler);
router.post('/jobs/:id/feature', validate(idParamSchema), featureJobHandler);
router.post('/jobs/:id/expire', validate(idParamSchema), expireJobHandler);
router.delete('/jobs/:id', validate(idParamSchema), deleteJobHandler);
router.get('/jobs/:id/reports', validate(idParamSchema), jobReportsHandler);

// Resumes
router.get('/resumes', validate(listResumesSchema), listResumesHandler);
router.get('/resumes/:id', validate(idParamSchema), getResumeHandler);
router.delete('/resumes/:id', validate(idParamSchema), deleteResumeHandler);
router.post('/resumes/:id/restore', validate(idParamSchema), restoreResumeHandler);

// Coding
router.get('/coding/overview', codingOverviewHandler);
router.get('/coding/problems', validate(listPaginationSchema), adminProblemsHandler);
router.get('/coding/contests', validate(listPaginationSchema), adminContestsHandler);
router.get('/coding/daily', validate(listPaginationSchema), adminDailyHandler);
router.get('/coding/leaderboard', adminLeaderboardHandler);
router.get('/coding/achievements', adminAchievementsHandler);
router.patch('/coding/problems/:id', validate(idParamSchema), updateProblemCategoryHandler);

// Interviews
router.get('/interviews', validate(listPaginationSchema), listInterviewsHandler);
router.delete('/interviews/:id', validate(idParamSchema), deleteInterviewHandler);
router.get('/interviews/templates', validate(listPaginationSchema), listTemplatesHandler);
router.post('/interviews/templates', validate(createTemplateSchema), createTemplateHandler);
router.patch('/interviews/templates/:id', validate(idParamSchema), updateTemplateHandler);
router.delete('/interviews/templates/:id', validate(idParamSchema), deleteTemplateHandler);
router.get('/interviews/questions', validate(listPaginationSchema), listQuestionsHandler);
router.post('/interviews/questions', validate(createQuestionSchema), createQuestionHandler);
router.patch('/interviews/questions/:id', validate(idParamSchema), updateQuestionHandler);
router.delete('/interviews/questions/:id', validate(idParamSchema), deleteQuestionHandler);

// CMS
router.get('/cms', validate(listCmsSchema), listCmsHandler);
router.get('/cms/:id', validate(idParamSchema), getCmsHandler);
router.post('/cms', validate(createCmsSchema), createCmsHandler);
router.patch('/cms/:id', validate(updateCmsSchema), updateCmsHandler);
router.delete('/cms/:id', validate(idParamSchema), deleteCmsHandler);

// Notifications / Broadcasts
router.get('/broadcasts', validate(listPaginationSchema), listBroadcastsHandler);
router.post('/broadcasts', validate(createBroadcastSchema), createBroadcastHandler);
router.post('/broadcasts/:id/send', validate(idParamSchema), sendBroadcastHandler);
router.delete('/broadcasts/:id', validate(idParamSchema), deleteBroadcastHandler);

// Reports
router.get('/reports', validate(listReportsSchema), listReportsHandler);
router.get('/reports/stats', reportStatsHandler);
router.post('/reports/:id/resolve', validate(resolveReportSchema), resolveReportHandler);

// Audit Logs
router.get('/audit', validate(listAuditSchema), listAuditHandler);
router.get('/audit/stats', auditStatsHandler);
router.get('/audit/export', validate(listAuditSchema), exportAuditHandler);

// Settings
router.get('/settings', getSettingsHandler);
router.get('/settings/:category', getSettingsCategoryHandler);
router.patch('/settings/:category', validate(updateSettingsSchema), updateSettingsHandler);

export default router;
