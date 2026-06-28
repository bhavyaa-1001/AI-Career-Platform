import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import { useDashboard } from '@/hooks/useDashboard';
import { DashboardNavbar } from './DashboardNavbar';
import { Sidebar } from './Sidebar';

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/profile': 'Profile',
  '/profile/preview': 'Profile Preview',
  '/resumes': 'Resume Builder',
  '/resumes/import': 'Import Resume',
  '/admin': 'Admin Panel',
};

export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();
  const { data } = useDashboard();
  const completion = data?.data?.stats?.profileCompletion || 0;
  const title = PAGE_TITLES[pathname] || (pathname.startsWith('/resumes/') ? 'Edit Resume' : 'Dashboard');

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar completion={completion} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-1 flex-col lg:pl-0">
        <DashboardNavbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
