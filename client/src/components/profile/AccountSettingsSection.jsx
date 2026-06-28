import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
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

export function AccountSettingsSection({ user, onMessage, onError }) {
  const { logout } = useAuth();
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [devVerifyUrl, setDevVerifyUrl] = useState(null);

  const passwordForm = useForm();
  const newPassword = passwordForm.watch('newPassword');

  const onPasswordSubmit = async (data) => {
    setPasswordLoading(true);
    onError(null);
    onMessage(null);
    try {
      await authApi.changePassword(data);
      onMessage('Password changed. Redirecting to login...');
      passwordForm.reset();
      setTimeout(() => logout(), 2000);
    } catch (err) {
      onError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleResendVerification = async () => {
    setVerifyLoading(true);
    onError(null);
    setDevVerifyUrl(null);
    try {
      const response = await authApi.resendVerification();
      onMessage(response.message || 'Verification email sent');

      if (response.devVerificationUrl) {
        setDevVerifyUrl(response.devVerificationUrl);
        onMessage('Development mode: use the verification link below (also logged in server console).');
      }
    } catch (err) {
      onError(err.message);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!devVerifyUrl) return;
    await navigator.clipboard.writeText(devVerifyUrl);
    onMessage('Verification link copied to clipboard');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Settings</CardTitle>
        <CardDescription>Security and account preferences</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!user?.isEmailVerified && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium">Email not verified</p>
                <p className="text-sm text-muted-foreground">
                  Check your inbox for the verification email, or resend below.
                </p>
              </div>
              <Badge variant="warning">Pending</Badge>
            </div>
            <Button className="mt-3" size="sm" onClick={handleResendVerification} disabled={verifyLoading}>
              {verifyLoading ? 'Sending...' : 'Resend verification email'}
            </Button>

            {devVerifyUrl && (
              <div className="mt-4 rounded-md border border-border bg-background p-3">
                <p className="mb-2 text-xs font-medium text-muted-foreground">Development verification link</p>
                <a
                  href={devVerifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-sm text-primary hover:underline"
                >
                  {devVerifyUrl}
                </a>
                <Button variant="outline" size="sm" className="mt-2" onClick={handleCopyLink}>
                  Copy link
                </Button>
              </div>
            )}
          </div>
        )}

        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4 border-t border-border pt-6">
          <p className="text-sm font-medium">Change password</p>
          <Input
            label="Current password"
            type="password"
            error={passwordForm.formState.errors.currentPassword?.message}
            {...passwordForm.register('currentPassword', { required: 'Required' })}
          />
          <Input
            label="New password"
            type="password"
            error={passwordForm.formState.errors.newPassword?.message}
            {...passwordForm.register('newPassword', passwordRules)}
          />
          <Input
            label="Confirm new password"
            type="password"
            error={passwordForm.formState.errors.confirmPassword?.message}
            {...passwordForm.register('confirmPassword', {
              required: 'Required',
              validate: (v) => v === newPassword || 'Passwords do not match',
            })}
          />
          <Button type="submit" disabled={passwordLoading}>
            {passwordLoading ? 'Updating...' : 'Update password'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
