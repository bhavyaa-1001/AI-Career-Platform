import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';

export function ProtectedRoute({ children, roles }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user?.role)) {
    if (user?.role === 'recruiter') return <Navigate to="/recruiter" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

export function GuestRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (isAuthenticated) {
    const from = location.state?.from?.pathname;
    if (from) return <Navigate to={from} replace />;
    if (user?.role === 'recruiter') return <Navigate to="/recruiter" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
