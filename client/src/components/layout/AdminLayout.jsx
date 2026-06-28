import { Outlet, useLocation } from 'react-router-dom';

import { AdminNavbar } from './AdminNavbar';
import { AdminSidebar } from './AdminSidebar';

const PAGE_TITLES = {
  '/admin': 'Dashboard',
  '/admin/analytics': 'Platform Analytics',
  '/admin/users': 'User Management',
  '/admin/recruiters': 'Recruiter Management',
  '/admin/jobs': 'Job Management',
  '/admin/resumes': 'Resume Management',
  '/admin/coding': 'Coding Platform',
  '/admin/interviews': 'Interview Management',
  '/admin/cms': 'Content Management',
  '/admin/notifications': 'Notifications',
  '/admin/reports': 'Reports',
  '/admin/audit': 'Audit Logs',
  '/admin/settings': 'Platform Settings',
};

const resolveTitle = (pathname) => {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith('/admin/users/')) return 'User Details';
  if (pathname.startsWith('/admin/coding/')) return 'Coding Management';
  return 'Admin Panel';
};

export function AdminLayout() {
  const { pathname } = useLocation();
  const title = resolveTitle(pathname);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex flex-1 flex-col lg:pl-0">
        <AdminNavbar title={title} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
