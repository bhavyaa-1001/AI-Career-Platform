import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useDispatch } from 'react-redux';

import { AuthLayout } from '@/components/auth';
import { Button, Input } from '@/components/ui';
import { setCredentials } from '@/features/auth/authSlice';
import { authApi } from '@/lib/api/auth';

const passwordRules = {
  required: 'Password is required',
  minLength: { value: 8, message: 'Password must be at least 8 characters' },
  validate: {
    uppercase: (v) => /[A-Z]/.test(v) || 'Must contain an uppercase letter',
    lowercase: (v) => /[a-z]/.test(v) || 'Must contain a lowercase letter',
    number: (v) => /[0-9]/.test(v) || 'Must contain a number',
  },
};

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch('password');

  const onSubmit = async (data) => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.resetPassword(token, data);
      dispatch(setCredentials(response.data));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <AuthLayout title="Invalid link" subtitle="This password reset link is invalid">
        <p className="text-center text-sm text-muted-foreground">
          <Link to="/forgot-password" className="text-primary hover:underline">
            Request a new reset link
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Reset password" subtitle="Enter your new password below">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {error}
          </motion.div>
        )}

        <Input
          label="New password"
          type="password"
          placeholder="Enter new password"
          error={errors.password?.message}
          {...register('password', passwordRules)}
        />

        <Input
          label="Confirm password"
          type="password"
          placeholder="Confirm new password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (v) => v === password || 'Passwords do not match',
          })}
        />

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset password'}
        </Button>
      </form>
    </AuthLayout>
  );
}
