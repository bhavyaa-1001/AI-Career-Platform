import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';
import { useQueryClient } from '@tanstack/react-query';

import { AuthLayout } from '@/components/auth';
import { Loader } from '@/components/common';
import { Button } from '@/components/ui';
import { setUser } from '@/features/auth/authSlice';
import { PROFILE_QUERY_KEY } from '@/hooks/useProfile';
import { authApi } from '@/lib/api/auth';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    authApi
      .verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.message || 'Email verified successfully');
        if (res.data?.user) {
          dispatch(setUser(res.data.user));
          queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
        }
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.message);
      });
  }, [token, dispatch, queryClient]);

  return (
    <AuthLayout title="Email verification" subtitle="Verifying your email address">
      <div className="text-center">
        {status === 'loading' && <Loader className="py-8" />}

        {status === 'success' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Link to="/profile" className="mt-6 inline-block">
              <Button>Go to profile</Button>
            </Link>
          </motion.div>
        )}

        {status === 'error' && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-sm text-destructive">{message}</p>
            <Link to="/profile" className="mt-6 inline-block text-sm text-primary hover:underline">
              Back to profile
            </Link>
          </motion.div>
        )}
      </div>
    </AuthLayout>
  );
}
