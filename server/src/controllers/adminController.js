import { listAuditLogs, exportAuditLogsCsv, getAuditStats } from '../services/admin/adminAuditService.js';
import { listCmsContent, getCmsById, createCmsContent, updateCmsContent, deleteCmsContent } from '../services/admin/adminCmsService.js';
import { getCodingOverview, listAdminProblems, listAdminContests, listDailyChallenges, getLeaderboardAdmin, getAchievementsOverview, updateProblemCategory } from '../services/admin/adminCodingService.js';
import { getPlatformAnalytics, getAdminDashboard } from '../services/admin/adminDashboardService.js';
import { listInterviewRecords, deleteInterviewRecord, listTemplates, createTemplate, updateTemplate, deleteTemplate, listQuestions, createQuestion, updateQuestion, deleteQuestion } from '../services/admin/adminInterviewService.js';
import { listJobs, approveJob, rejectJob, featureJob, deleteJob, getJobReports, markJobExpired } from '../services/admin/adminJobService.js';
import { listBroadcasts, createBroadcast, sendBroadcastById, deleteBroadcast } from '../services/admin/adminNotificationService.js';
import { listRecruiters, approveRecruiter, rejectRecruiter, suspendRecruiter, verifyCompany, updateRecruiterKyc, updateRecruiterPremium, getRecruiterAnalytics } from '../services/admin/adminRecruiterService.js';
import { listReports, resolveReport, getReportStats } from '../services/admin/adminReportService.js';
import { listResumes, getResumeDetail, softDeleteResume, restoreResume } from '../services/admin/adminResumeService.js';
import { getAllSettings, getSettingsByCategory, updateSettings, getServiceStatus } from '../services/admin/adminSettingsService.js';
import { listUsers, getUserById, createUser, updateUser, deleteUser, suspendUser, activateUser, banUser, unbanUser, assignRole, resetUserPassword, bulkUserAction, exportUsersCsv } from '../services/admin/adminUserService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Dashboard
export const dashboardHandler = asyncHandler(async (req, res) => {
  const dashboard = await getAdminDashboard(req.query);
  res.json({ success: true, data: { dashboard } });
});

export const analyticsHandler = asyncHandler(async (req, res) => {
  const analytics = await getPlatformAnalytics(req.query);
  res.json({ success: true, data: { analytics } });
});

// Users
export const listUsersHandler = asyncHandler(async (req, res) => {
  const result = await listUsers(req.query);
  res.json({ success: true, data: result });
});

export const getUserHandler = asyncHandler(async (req, res) => {
  const result = await getUserById(req.params.id);
  res.json({ success: true, data: result });
});

export const createUserHandler = asyncHandler(async (req, res) => {
  const user = await createUser(req.user, req.body);
  res.status(201).json({ success: true, data: { user } });
});

export const updateUserHandler = asyncHandler(async (req, res) => {
  const user = await updateUser(req.user, req.params.id, req.body);
  res.json({ success: true, data: { user } });
});

export const deleteUserHandler = asyncHandler(async (req, res) => {
  const result = await deleteUser(req.user, req.params.id);
  res.json({ success: true, data: result });
});

export const suspendUserHandler = asyncHandler(async (req, res) => {
  const result = await suspendUser(req.user, req.params.id, req.body || {});
  res.json({ success: true, data: result });
});

export const activateUserHandler = asyncHandler(async (req, res) => {
  const result = await activateUser(req.user, req.params.id);
  res.json({ success: true, data: result });
});

export const banUserHandler = asyncHandler(async (req, res) => {
  const result = await banUser(req.user, req.params.id, req.body || {});
  res.json({ success: true, data: result });
});

export const unbanUserHandler = asyncHandler(async (req, res) => {
  const result = await unbanUser(req.user, req.params.id);
  res.json({ success: true, data: result });
});

export const assignRoleHandler = asyncHandler(async (req, res) => {
  const user = await assignRole(req.user, req.params.id, req.body.role);
  res.json({ success: true, data: { user } });
});

export const resetPasswordHandler = asyncHandler(async (req, res) => {
  const result = await resetUserPassword(req.user, req.params.id, req.body.newPassword);
  res.json({ success: true, data: result });
});

export const bulkActionHandler = asyncHandler(async (req, res) => {
  const result = await bulkUserAction(req.user, req.body);
  res.json({ success: true, data: result });
});

export const exportUsersHandler = asyncHandler(async (req, res) => {
  const csv = await exportUsersCsv(req.query);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
  res.send(csv);
});

// Recruiters
export const listRecruitersHandler = asyncHandler(async (req, res) => {
  const result = await listRecruiters(req.query);
  res.json({ success: true, data: result });
});

export const approveRecruiterHandler = asyncHandler(async (req, res) => {
  const result = await approveRecruiter(req.user, req.params.id);
  res.json({ success: true, data: result });
});

export const rejectRecruiterHandler = asyncHandler(async (req, res) => {
  const result = await rejectRecruiter(req.user, req.params.id, req.body || {});
  res.json({ success: true, data: result });
});

export const suspendRecruiterHandler = asyncHandler(async (req, res) => {
  const result = await suspendRecruiter(req.user, req.params.id, req.body || {});
  res.json({ success: true, data: result });
});

export const verifyCompanyHandler = asyncHandler(async (req, res) => {
  const meta = await verifyCompany(req.user, req.params.id);
  res.json({ success: true, data: { meta } });
});

export const updateKycHandler = asyncHandler(async (req, res) => {
  const meta = await updateRecruiterKyc(req.user, req.params.id, req.body);
  res.json({ success: true, data: { meta } });
});

export const updatePremiumHandler = asyncHandler(async (req, res) => {
  const meta = await updateRecruiterPremium(req.user, req.params.id, req.body.premiumStatus);
  res.json({ success: true, data: { meta } });
});

export const recruiterAnalyticsHandler = asyncHandler(async (req, res) => {
  const analytics = await getRecruiterAnalytics(req.params.id);
  res.json({ success: true, data: { analytics } });
});

// Jobs
export const listJobsHandler = asyncHandler(async (req, res) => {
  const result = await listJobs(req.query);
  res.json({ success: true, data: result });
});

export const approveJobHandler = asyncHandler(async (req, res) => {
  const result = await approveJob(req.user, req.params.id);
  res.json({ success: true, data: result });
});

export const rejectJobHandler = asyncHandler(async (req, res) => {
  const result = await rejectJob(req.user, req.params.id, req.body || {});
  res.json({ success: true, data: result });
});

export const featureJobHandler = asyncHandler(async (req, res) => {
  const result = await featureJob(req.user, req.params.id, req.body || {});
  res.json({ success: true, data: result });
});

export const deleteJobHandler = asyncHandler(async (req, res) => {
  const result = await deleteJob(req.user, req.params.id);
  res.json({ success: true, data: result });
});

export const jobReportsHandler = asyncHandler(async (req, res) => {
  const reports = await getJobReports(req.params.id);
  res.json({ success: true, data: { reports } });
});

export const expireJobHandler = asyncHandler(async (req, res) => {
  const meta = await markJobExpired(req.user, req.params.id, req.body?.expiresAt);
  res.json({ success: true, data: { meta } });
});

// Resumes
export const listResumesHandler = asyncHandler(async (req, res) => {
  const result = await listResumes(req.query);
  res.json({ success: true, data: result });
});

export const getResumeHandler = asyncHandler(async (req, res) => {
  const result = await getResumeDetail(req.params.id);
  res.json({ success: true, data: result });
});

export const deleteResumeHandler = asyncHandler(async (req, res) => {
  const meta = await softDeleteResume(req.user, req.params.id);
  res.json({ success: true, data: { meta } });
});

export const restoreResumeHandler = asyncHandler(async (req, res) => {
  const meta = await restoreResume(req.user, req.params.id);
  res.json({ success: true, data: { meta } });
});

// Coding
export const codingOverviewHandler = asyncHandler(async (req, res) => {
  const overview = await getCodingOverview();
  res.json({ success: true, data: { overview } });
});

export const adminProblemsHandler = asyncHandler(async (req, res) => {
  const result = await listAdminProblems(req.query);
  res.json({ success: true, data: result });
});

export const adminContestsHandler = asyncHandler(async (req, res) => {
  const result = await listAdminContests(req.query);
  res.json({ success: true, data: result });
});

export const adminDailyHandler = asyncHandler(async (req, res) => {
  const result = await listDailyChallenges(req.query);
  res.json({ success: true, data: result });
});

export const adminLeaderboardHandler = asyncHandler(async (req, res) => {
  const leaderboard = await getLeaderboardAdmin(Number(req.query.limit) || 50);
  res.json({ success: true, data: { leaderboard } });
});

export const adminAchievementsHandler = asyncHandler(async (req, res) => {
  const achievements = await getAchievementsOverview();
  res.json({ success: true, data: { achievements } });
});

export const updateProblemCategoryHandler = asyncHandler(async (req, res) => {
  const problem = await updateProblemCategory(req.user, req.params.id, req.body);
  res.json({ success: true, data: { problem } });
});

// Interviews
export const listInterviewsHandler = asyncHandler(async (req, res) => {
  const result = await listInterviewRecords(req.query);
  res.json({ success: true, data: result });
});

export const deleteInterviewHandler = asyncHandler(async (req, res) => {
  const result = await deleteInterviewRecord(req.user, req.params.id);
  res.json({ success: true, data: result });
});

export const listTemplatesHandler = asyncHandler(async (req, res) => {
  const result = await listTemplates(req.query);
  res.json({ success: true, data: result });
});

export const createTemplateHandler = asyncHandler(async (req, res) => {
  const template = await createTemplate(req.user, req.body);
  res.status(201).json({ success: true, data: { template } });
});

export const updateTemplateHandler = asyncHandler(async (req, res) => {
  const template = await updateTemplate(req.user, req.params.id, req.body);
  res.json({ success: true, data: { template } });
});

export const deleteTemplateHandler = asyncHandler(async (req, res) => {
  const result = await deleteTemplate(req.user, req.params.id);
  res.json({ success: true, data: result });
});

export const listQuestionsHandler = asyncHandler(async (req, res) => {
  const result = await listQuestions(req.query);
  res.json({ success: true, data: result });
});

export const createQuestionHandler = asyncHandler(async (req, res) => {
  const question = await createQuestion(req.user, req.body);
  res.status(201).json({ success: true, data: { question } });
});

export const updateQuestionHandler = asyncHandler(async (req, res) => {
  const question = await updateQuestion(req.user, req.params.id, req.body);
  res.json({ success: true, data: { question } });
});

export const deleteQuestionHandler = asyncHandler(async (req, res) => {
  const result = await deleteQuestion(req.user, req.params.id);
  res.json({ success: true, data: result });
});

// CMS
export const listCmsHandler = asyncHandler(async (req, res) => {
  const result = await listCmsContent(req.query);
  res.json({ success: true, data: result });
});

export const getCmsHandler = asyncHandler(async (req, res) => {
  const item = await getCmsById(req.params.id);
  res.json({ success: true, data: { item } });
});

export const createCmsHandler = asyncHandler(async (req, res) => {
  const item = await createCmsContent(req.user, req.body);
  res.status(201).json({ success: true, data: { item } });
});

export const updateCmsHandler = asyncHandler(async (req, res) => {
  const item = await updateCmsContent(req.user, req.params.id, req.body);
  res.json({ success: true, data: { item } });
});

export const deleteCmsHandler = asyncHandler(async (req, res) => {
  const result = await deleteCmsContent(req.user, req.params.id);
  res.json({ success: true, data: result });
});

// Notifications
export const listBroadcastsHandler = asyncHandler(async (req, res) => {
  const result = await listBroadcasts(req.query);
  res.json({ success: true, data: result });
});

export const createBroadcastHandler = asyncHandler(async (req, res) => {
  const broadcast = await createBroadcast(req.user, req.body);
  res.status(201).json({ success: true, data: { broadcast } });
});

export const sendBroadcastHandler = asyncHandler(async (req, res) => {
  const broadcast = await sendBroadcastById(req.user, req.params.id);
  res.json({ success: true, data: { broadcast } });
});

export const deleteBroadcastHandler = asyncHandler(async (req, res) => {
  const result = await deleteBroadcast(req.user, req.params.id);
  res.json({ success: true, data: result });
});

// Reports
export const listReportsHandler = asyncHandler(async (req, res) => {
  const result = await listReports(req.query);
  res.json({ success: true, data: result });
});

export const reportStatsHandler = asyncHandler(async (req, res) => {
  const stats = await getReportStats();
  res.json({ success: true, data: { stats } });
});

export const resolveReportHandler = asyncHandler(async (req, res) => {
  const report = await resolveReport(req.user, req.params.id, req.body);
  res.json({ success: true, data: { report } });
});

// Audit
export const listAuditHandler = asyncHandler(async (req, res) => {
  const result = await listAuditLogs(req.query);
  res.json({ success: true, data: result });
});

export const auditStatsHandler = asyncHandler(async (req, res) => {
  const stats = await getAuditStats();
  res.json({ success: true, data: { stats } });
});

export const exportAuditHandler = asyncHandler(async (req, res) => {
  const csv = await exportAuditLogsCsv(req.query);
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="audit-logs.csv"');
  res.send(csv);
});

// Settings
export const getSettingsHandler = asyncHandler(async (req, res) => {
  const settings = await getAllSettings();
  const services = getServiceStatus();
  res.json({ success: true, data: { settings, services } });
});

export const getSettingsCategoryHandler = asyncHandler(async (req, res) => {
  const settings = await getSettingsByCategory(req.params.category);
  res.json({ success: true, data: { settings } });
});

export const updateSettingsHandler = asyncHandler(async (req, res) => {
  const settings = await updateSettings(req.user, req.params.category, req.body);
  res.json({ success: true, data: { settings } });
});
