import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

import { AuthLayout } from '@/components/auth';
import { Button, Checkbox, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, error, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: { rememberMe: false },
  });

  const onSubmit = async (data) => {
    clearError();
    try {
      await login(data);
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      if (err?.code === 'EMAIL_NOT_VERIFIED') {
        clearError();
        navigate(`/register?email=${encodeURIComponent(data.email)}`, {
          state: { needsVerification: true },
        });
      }
    }
  };

  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to your account to continue">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
          >
            {typeof error === 'string' ? error : error?.message}
          </motion.div>
        )}

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

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-[34px] text-xs text-muted-foreground hover:text-foreground"
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <Checkbox label="Remember me" {...register('rememberMe')} />
          <Link to="/forgot-password" className="text-sm text-primary hover:underline">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="font-medium text-primary hover:underline">
            Create account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
}
