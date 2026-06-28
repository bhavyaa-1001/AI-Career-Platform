import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';

import { AuthLayout } from '@/components/auth';
import { Button, Input, Select } from '@/components/ui';
import { setCredentials } from '@/features/auth/authSlice';
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
  const dispatch = useDispatch();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const referralFromUrl = searchParams.get('ref') || '';
  const emailFromUrl = searchParams.get('email') || '';
  const needsVerification = location.state?.needsVerification;
  const [step, setStep] = useState(needsVerification || emailFromUrl ? 'otp' : 'register');
  const [pendingEmail, setPendingEmail] = useState(emailFromUrl);
  const [referralCode, setReferralCode] = useState(referralFromUrl);
  const [devOtp, setDevOtp] = useState(null);
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [resendMessage, setResendMessage] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: { role: 'student', referralCode: referralFromUrl },
  });

  const password = watch('password');

  useEffect(() => {
    if (!needsVerification || !emailFromUrl) return;

    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await authApi.resendSignupOtp(emailFromUrl);
        if (cancelled) return;
        setDevOtp(res.devOtp || null);
        setResendMessage('A new verification code has been sent to your email.');
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [needsVerification, emailFromUrl]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.register(data);
      setPendingEmail(res.data?.email || data.email);
      setReferralCode(data.referralCode || '');
      setDevOtp(res.devOtp || null);
      setStep('otp');
    } catch (err) {
      if (err.code === 'EMAIL_NOT_VERIFIED') {
        setPendingEmail(data.email);
        setReferralCode(data.referralCode || '');
        setStep('otp');
        setError('This email is already registered but not verified. Enter OTP or request a new code.');
      } else {
        setError(err.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError('Enter a valid 6-digit code');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await authApi.verifySignupOtp({
        email: pendingEmail,
        otp,
        referralCode: referralCode || undefined,
      });
      dispatch(setCredentials(res.data));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setIsLoading(true);
    setError(null);
    setResendMessage(null);
    try {
      const res = await authApi.resendSignupOtp(pendingEmail);
      setDevOtp(res.devOtp || null);
      setResendMessage('A new verification code has been sent.');
      setOtp('');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'otp') {
    return (
      <AuthLayout title="Verify your email" subtitle={`Enter the 6-digit code sent to ${pendingEmail}`}>
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {resendMessage && (
            <div className="rounded-md border border-primary/30 bg-primary/5 p-3 text-sm text-primary">
              {resendMessage}
            </div>
          )}
          {devOtp && (
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
              SMTP not configured — dev OTP: <strong>{devOtp}</strong>
            </div>
          )}
          {!devOtp && (
            <p className="text-sm text-muted-foreground">
              Didn&apos;t get the email? Check spam or wait a minute, then tap Resend code.
            </p>
          )}
          <Input
            label="Verification code"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="123456"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
          />
          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Verify & continue'}
          </Button>
          <Button type="button" variant="outline" className="w-full" onClick={handleResendOtp} disabled={isLoading}>
            Resend code
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Wrong email?{' '}
            <button type="button" className="font-medium text-primary hover:underline" onClick={() => setStep('register')}>
              Go back
            </button>
          </p>
        </form>
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
          label="Referral code (optional)"
          placeholder="FRIEND123"
          error={errors.referralCode?.message}
          {...register('referralCode')}
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

        <p className="text-xs text-muted-foreground">
          A 6-digit verification code will be sent to your email. You must verify before signing in.
        </p>

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
