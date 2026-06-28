import { createBrowserRouter } from 'react-router-dom';

import { GuestRoute, ProtectedRoute } from '@/components/auth';
import { RoleDashboardRedirect } from '@/components/auth/RoleDashboardRedirect';
import { DashboardLayout, MainLayout, AdminLayout } from '@/components/layout';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { ApplicationDetailPage } from '@/pages/ApplicationDetailPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { JobDetailPage } from '@/pages/JobDetailPage';
import { JobsBrowsePage } from '@/pages/JobsBrowsePage';
import { MyApplicationsPage } from '@/pages/MyApplicationsPage';
import { SavedJobsPage } from '@/pages/SavedJobsPage';
import { ApplicantDetailPage } from '@/pages/recruiter/ApplicantDetailPage';
import { CompanyProfilePage } from '@/pages/recruiter/CompanyProfilePage';
import { JobApplicantsPage } from '@/pages/recruiter/JobApplicantsPage';
import { JobFormPage } from '@/pages/recruiter/JobFormPage';
import { ManageJobsPage } from '@/pages/recruiter/ManageJobsPage';
import { RecruiterAnalyticsPage } from '@/pages/recruiter/RecruiterAnalyticsPage';
import { RecruiterDashboardPage } from '@/pages/recruiter/RecruiterDashboardPage';
import { AdminCodingProblemsPage } from '@/pages/coding/AdminCodingProblemsPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ProfilePreviewPage } from '@/pages/ProfilePreviewPage';
import { ResumeBuilderPage } from '@/pages/ResumeBuilderPage';
import { ResumeDashboardPage } from '@/pages/ResumeDashboardPage';
import { ResumeImportPage } from '@/pages/ResumeImportPage';
import { CoverLetterPage } from '@/pages/CoverLetterPage';
import { AnalyticsDashboardPage } from '@/pages/AnalyticsDashboardPage';
import { AnalysisDetailPage } from '@/pages/AnalysisDetailPage';
import { ResumeMatchDetailPage } from '@/pages/ResumeMatchDetailPage';
import { ResumeMatchPage } from '@/pages/ResumeMatchPage';
import { ResumeAnalysisPage } from '@/pages/ResumeAnalysisPage';
import { InsightsRedirectPage } from '@/pages/insights/InsightsRedirectPage';
import { StudentInsightsPage } from '@/pages/insights/StudentInsightsPage';
import { RecruiterInsightsPage } from '@/pages/insights/RecruiterInsightsPage';
import { AdminInsightsPage } from '@/pages/insights/AdminInsightsPage';
import { CodingDashboardPage } from '@/pages/coding/CodingDashboardPage';
import { ProblemsBrowsePage } from '@/pages/coding/ProblemsBrowsePage';
import { ProblemWorkspacePage } from '@/pages/coding/ProblemWorkspacePage';
import { CodingSubmissionsPage } from '@/pages/coding/CodingSubmissionsPage';
import { LeaderboardPage } from '@/pages/coding/LeaderboardPage';
import { DailyChallengePage } from '@/pages/coding/DailyChallengePage';
import { ContestsPage } from '@/pages/coding/ContestsPage';
import { ContestDetailPage } from '@/pages/coding/ContestDetailPage';
import { CodingProgressPage } from '@/pages/coding/CodingProgressPage';
import { AdminAnalyticsPage } from '@/pages/admin/AdminAnalyticsPage';
import { AdminAuditPage } from '@/pages/admin/AdminAuditPage';
import { AdminCmsPage } from '@/pages/admin/AdminCmsPage';
import { AdminCodingPage } from '@/pages/admin/AdminCodingPage';
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage';
import { AdminInterviewsPage } from '@/pages/admin/AdminInterviewsPage';
import { AdminJobsPage } from '@/pages/admin/AdminJobsPage';
import { AdminNotificationsPage } from '@/pages/admin/AdminNotificationsPage';
import { AdminRecruitersPage } from '@/pages/admin/AdminRecruitersPage';
import { AdminReportsPage } from '@/pages/admin/AdminReportsPage';
import { AdminResumesPage } from '@/pages/admin/AdminResumesPage';
import { AdminSettingsPage } from '@/pages/admin/AdminSettingsPage';
import { AdminUserDetailPage } from '@/pages/admin/AdminUserDetailPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { HomePage } from '@/pages/HomePage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'dashboard', element: <><RoleDashboardRedirect /><DashboardPage /></> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'profile/preview', element: <ProfilePreviewPage /> },
      { path: 'resumes', element: <ResumeDashboardPage /> },
      { path: 'resumes/import', element: <ResumeImportPage /> },
      { path: 'resumes/:id', element: <ResumeBuilderPage /> },
      { path: 'cover-letters', element: <CoverLetterPage /> },
      { path: 'cover-letters/:id', element: <CoverLetterPage /> },
      { path: 'match', element: <ResumeMatchPage /> },
      { path: 'match/:id', element: <ResumeMatchDetailPage /> },
      { path: 'analysis', element: <ResumeAnalysisPage /> },
      { path: 'analytics', element: <AnalyticsDashboardPage /> },
      { path: 'analytics/:id', element: <AnalysisDetailPage /> },
      { path: 'insights', element: <InsightsRedirectPage /> },
      { path: 'insights/student', element: <ProtectedRoute roles={['student']}><StudentInsightsPage /></ProtectedRoute> },
      { path: 'insights/recruiter', element: <ProtectedRoute roles={['recruiter']}><RecruiterInsightsPage /></ProtectedRoute> },
      { path: 'insights/admin', element: <ProtectedRoute roles={['admin']}><AdminInsightsPage /></ProtectedRoute> },
      { path: 'coding', element: <ProtectedRoute roles={['student']}><CodingDashboardPage /></ProtectedRoute> },
      { path: 'coding/problems', element: <ProtectedRoute roles={['student']}><ProblemsBrowsePage /></ProtectedRoute> },
      { path: 'coding/problems/:slug', element: <ProtectedRoute roles={['student']}><ProblemWorkspacePage /></ProtectedRoute> },
      { path: 'coding/submissions', element: <ProtectedRoute roles={['student']}><CodingSubmissionsPage /></ProtectedRoute> },
      { path: 'coding/leaderboard', element: <ProtectedRoute roles={['student']}><LeaderboardPage /></ProtectedRoute> },
      { path: 'coding/daily', element: <ProtectedRoute roles={['student']}><DailyChallengePage /></ProtectedRoute> },
      { path: 'coding/contests', element: <ProtectedRoute roles={['student']}><ContestsPage /></ProtectedRoute> },
      { path: 'coding/contests/:id', element: <ProtectedRoute roles={['student']}><ContestDetailPage /></ProtectedRoute> },
      { path: 'coding/progress', element: <ProtectedRoute roles={['student']}><CodingProgressPage /></ProtectedRoute> },
      { path: 'jobs', element: <ProtectedRoute roles={['student']}><JobsBrowsePage /></ProtectedRoute> },
      { path: 'jobs/saved', element: <ProtectedRoute roles={['student']}><SavedJobsPage /></ProtectedRoute> },
      { path: 'jobs/:id', element: <ProtectedRoute roles={['student']}><JobDetailPage /></ProtectedRoute> },
      { path: 'applications', element: <ProtectedRoute roles={['student']}><MyApplicationsPage /></ProtectedRoute> },
      { path: 'applications/:id', element: <ProtectedRoute roles={['student']}><ApplicationDetailPage /></ProtectedRoute> },
      { path: 'recruiter', element: <ProtectedRoute roles={['recruiter']}><RecruiterDashboardPage /></ProtectedRoute> },
      { path: 'recruiter/company', element: <ProtectedRoute roles={['recruiter']}><CompanyProfilePage /></ProtectedRoute> },
      { path: 'recruiter/jobs', element: <ProtectedRoute roles={['recruiter']}><ManageJobsPage /></ProtectedRoute> },
      { path: 'recruiter/jobs/new', element: <ProtectedRoute roles={['recruiter']}><JobFormPage /></ProtectedRoute> },
      { path: 'recruiter/jobs/:id/edit', element: <ProtectedRoute roles={['recruiter']}><JobFormPage /></ProtectedRoute> },
      { path: 'recruiter/jobs/:jobId/applicants', element: <ProtectedRoute roles={['recruiter']}><JobApplicantsPage /></ProtectedRoute> },
      { path: 'recruiter/applicants/:id', element: <ProtectedRoute roles={['recruiter']}><ApplicantDetailPage /></ProtectedRoute> },
      { path: 'recruiter/analytics', element: <ProtectedRoute roles={['recruiter']}><RecruiterAnalyticsPage /></ProtectedRoute> },
    ],
  },
  {
    element: (
      <ProtectedRoute roles={['admin', 'sub_admin']}>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: 'admin', element: <AdminDashboardPage /> },
      { path: 'admin/analytics', element: <AdminAnalyticsPage /> },
      { path: 'admin/users', element: <AdminUsersPage /> },
      { path: 'admin/users/:id', element: <AdminUserDetailPage /> },
      { path: 'admin/recruiters', element: <AdminRecruitersPage /> },
      { path: 'admin/jobs', element: <AdminJobsPage /> },
      { path: 'admin/resumes', element: <AdminResumesPage /> },
      { path: 'admin/coding', element: <AdminCodingPage /> },
      { path: 'admin/coding/problems', element: <AdminCodingProblemsPage /> },
      { path: 'admin/interviews', element: <AdminInterviewsPage /> },
      { path: 'admin/cms', element: <AdminCmsPage /> },
      { path: 'admin/notifications', element: <AdminNotificationsPage /> },
      { path: 'admin/reports', element: <AdminReportsPage /> },
      { path: 'admin/audit', element: <AdminAuditPage /> },
      { path: 'admin/settings', element: <AdminSettingsPage /> },
    ],
  },
  {
    path: '/login',
    element: <GuestRoute><LoginPage /></GuestRoute>,
  },
  {
    path: '/register',
    element: <GuestRoute><RegisterPage /></GuestRoute>,
  },
  {
    path: '/forgot-password',
    element: <GuestRoute><ForgotPasswordPage /></GuestRoute>,
  },
  {
    path: '/reset-password',
    element: <GuestRoute><ResetPasswordPage /></GuestRoute>,
  },
  {
    path: '/verify-email',
    element: <VerifyEmailPage />,
  },
]);
