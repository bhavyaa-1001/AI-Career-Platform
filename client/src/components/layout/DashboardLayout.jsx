import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';
import { useRecruiterDashboard } from '@/hooks/useRecruiter';
import { DashboardNavbar } from './DashboardNavbar';
import { Sidebar } from './Sidebar';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/profile': 'Profile',
  '/profile/preview': 'Profile Preview',
  '/resumes': 'Resume Builder',
  '/resumes/import': 'Import Resume',
  '/jobs': 'Browse Jobs',
  '/jobs/saved': 'Saved Jobs',
  '/applications': 'Application Tracking',
  '/cover-letters': 'Cover Letter',
  '/analytics': 'Analytics',
  '/insights': 'Insights',
  '/insights/student': 'Student Insights',
  '/insights/recruiter': 'Recruiter Insights',
  '/insights/admin': 'Admin Insights',
  '/match': 'Resume Job Match',
  '/coding': 'Coding Platform',
  '/coding/problems': 'Coding Problems',
  '/coding/submissions': 'Submissions',
  '/coding/leaderboard': 'Leaderboard',
  '/coding/daily': 'Daily Challenge',
  '/coding/contests': 'Contests',
  '/coding/progress': 'Coding Progress',
  '/admin/coding/problems': 'Manage Problems',
  '/analysis': 'Resume Analysis',
  '/admin': 'Admin Panel',
  '/recruiter': 'Recruiter Dashboard',
  '/recruiter/company': 'Company Profile',
  '/recruiter/jobs': 'Manage Jobs',
  '/recruiter/jobs/new': 'Post Job',
  '/recruiter/analytics': 'Recruiter Analytics',
};

const resolveTitle = (pathname) => {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/resumes/')) return 'Edit Resume';
  if (pathname.match(/\/recruiter\/jobs\/[^/]+\/edit/)) return 'Edit Job';
  if (pathname.match(/\/recruiter\/jobs\/[^/]+\/applicants/)) return 'Applicants';
  if (pathname.startsWith('/recruiter/applicants/')) return 'Applicant Review';
  if (pathname.startsWith('/jobs/') && pathname !== '/jobs/saved') return 'Job Details';
  if (pathname.startsWith('/coding/problems/')) return 'Code Workspace';
  if (pathname.startsWith('/coding/contests/')) return 'Contest';
  if (pathname.startsWith('/match/')) return 'Match Report';
  if (pathname.startsWith('/applications/')) return 'Application Status';
  if (pathname.startsWith('/recruiter/')) return 'Recruiter';
  return 'Dashboard';
};

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { isRecruiter } = useAuth();
  const { data: studentData } = useDashboard({ enabled: !isRecruiter });
  const { data: recruiterData } = useRecruiterDashboard({ enabled: isRecruiter });

  const completion = isRecruiter
    ? recruiterData?.data?.stats?.companyCompletion || 0
    : studentData?.data?.stats?.profileCompletion || 0;

  const title = resolveTitle(pathname);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        completion={completion}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        showCompletion={!isRecruiter}
      />
      <div className="flex flex-1 flex-col lg:pl-0">
        <DashboardNavbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
