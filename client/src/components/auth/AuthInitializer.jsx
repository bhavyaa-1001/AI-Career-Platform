import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

import { initializeAuth } from '@/features/auth/authSlice';
import { Loader } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';

export function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  const { isInitialized } = useAuth();

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  return children;
}
