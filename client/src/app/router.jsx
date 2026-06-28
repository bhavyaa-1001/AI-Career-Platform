import { createBrowserRouter } from 'react-router-dom';

import { GuestRoute, ProtectedRoute } from '@/components/auth';
import { DashboardLayout, MainLayout } from '@/components/layout';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { VerifyEmailPage } from '@/pages/auth/VerifyEmailPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { AdminPage } from '@/pages/AdminPage';
import { HomePage } from '@/pages/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { ProfilePreviewPage } from '@/pages/ProfilePreviewPage';

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
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'profile/preview', element: <ProfilePreviewPage /> },
      { path: 'admin', element: <ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute> },
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
