import { useDispatch, useSelector } from 'react-redux';

import { clearError, login, logout } from '@/features/auth/authSlice';

export function useAuth() {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);

  return {
    ...auth,
    login: (credentials) => dispatch(login(credentials)).unwrap(),
    logout: () => dispatch(logout()),
    clearError: () => dispatch(clearError()),
    isStudent: auth.user?.role === 'student',
    isRecruiter: auth.user?.role === 'recruiter',
    isAdmin: auth.user?.role === 'admin',
    isSubAdmin: auth.user?.role === 'sub_admin',
    isAdminPanelUser: auth.user?.role === 'admin' || auth.user?.role === 'sub_admin',
    isFullAdmin: auth.user?.role === 'admin',
  };
}
