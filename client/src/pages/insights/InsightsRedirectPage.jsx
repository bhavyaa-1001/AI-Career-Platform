import { Navigate } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

export function InsightsRedirectPage() {
  const { user } = useAuth();

  if (user?.role === 'admin') return <Navigate to="/insights/admin" replace />;
  if (user?.role === 'recruiter') return <Navigate to="/insights/recruiter" replace />;
  return <Navigate to="/insights/student" replace />;
}
