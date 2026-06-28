import { Navigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

export function RoleDashboardRedirect() {
  const { isRecruiter, isAdmin } = useAuth();

  if (isRecruiter) return <Navigate to="/recruiter" replace />;
  if (isAdmin) return <Navigate to="/admin" replace />;
  return null;
}
