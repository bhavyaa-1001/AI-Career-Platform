import { Navigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

export function RoleDashboardRedirect() {
  const { isRecruiter, isAdminPanelUser } = useAuth();

  if (isRecruiter) return <Navigate to="/recruiter" replace />;
  if (isAdminPanelUser) return <Navigate to="/admin" replace />;
  return null;
}
