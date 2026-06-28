import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { AuthLayout } from '@/components/auth';
import { Button, Input } from '@/components/ui';
import { authApi } from '@/lib/api/auth';

export function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      await authApi.forgotPassword(data.email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link"
    >
      {sent ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-lg border border-border bg-card p-6 text-center"
        >
          <p className="text-sm text-muted-foreground">
            If an account exists with that email, you will receive a password reset link shortly.
            Check your inbox and server logs in development mode.
          </p>
          <Link to="/login" className="mt-4 inline-block text-sm text-primary hover:underline">
            Back to login
          </Link>
        </motion.div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email address' },
            })}
          />

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send reset link'}
          </Button>

          <p className="text-center text-sm text-muted-foreground">
            <Link to="/login" className="text-primary hover:underline">
              Back to login
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}
