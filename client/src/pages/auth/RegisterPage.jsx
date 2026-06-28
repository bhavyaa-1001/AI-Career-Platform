import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

import { AuthLayout } from '@/components/auth';
import { Button, Input, Select } from '@/components/ui';
import { authApi } from '@/lib/api/auth';

const ROLE_OPTIONS = [
  { value: 'student', label: 'Student — Looking for opportunities' },
  { value: 'recruiter', label: 'Recruiter — Hiring talent' },
];

const passwordRules = {
  required: 'Password is required',
  minLength: { value: 8, message: 'Password must be at least 8 characters' },
  validate: {
    uppercase: (v) => /[A-Z]/.test(v) || 'Must contain an uppercase letter',
    lowercase: (v) => /[a-z]/.test(v) || 'Must contain a lowercase letter',
    number: (v) => /[0-9]/.test(v) || 'Must contain a number',
  },
};

export function RegisterPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { role: 'student' },
  });

  const password = watch('password');

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.register(data);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent you a verification link">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border border-border bg-card p-6 text-center"
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p className="text-sm text-muted-foreground">
            Your account has been created. Please verify your email before signing in.
            Redirecting to login...
          </p>
        </motion.div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Create your account" subtitle="Join thousands of developers building their careers">
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

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First name"
            placeholder="John"
            error={errors.firstName?.message}
            {...register('firstName', { required: 'First name is required' })}
          />
          <Input
            label="Last name"
            placeholder="Doe"
            error={errors.lastName?.message}
            {...register('lastName', { required: 'Last name is required' })}
          />
        </div>

        <Input
          label="Email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
          })}
        />

        <Select
          label="I am a"
          options={ROLE_OPTIONS}
          error={errors.role?.message}
          {...register('role', { required: 'Please select a role' })}
        />

        <Input
          label="Password"
          type="password"
          placeholder="Create a strong password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...register('password', passwordRules)}
        />

        <Input
          label="Confirm password"
          type="password"
          placeholder="Confirm your password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword', {
            required: 'Please confirm your password',
            validate: (v) => v === password || 'Passwords do not match',
          })}
        />

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
