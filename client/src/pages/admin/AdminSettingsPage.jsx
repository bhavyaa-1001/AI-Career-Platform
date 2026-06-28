import { useState } from 'react';

import { AdminPageHeader } from '@/components/admin/AdminComponents';
import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input, Textarea } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useAdminSettings, useAdminSettingsMutations } from '@/hooks/useAdmin';
import { authApi } from '@/lib/api/auth';

const CATEGORIES = [
  { key: 'global', label: 'Global Settings', fields: ['siteName', 'siteUrl', 'supportEmail', 'registrationEnabled'] },
  { key: 'branding', label: 'Site Branding', fields: ['logoUrl', 'primaryColor', 'faviconUrl', 'tagline'] },
  { key: 'maintenance', label: 'Maintenance Mode', fields: ['enabled', 'message'] },
  { key: 'features', label: 'Feature Flags', fields: ['coding', 'aiAnalysis', 'jobPortal', 'coverLetter', 'contests', 'resumeMatch'] },
];

export function AdminSettingsPage() {
  const [activeCategory, setActiveCategory] = useState('global');
  const [localSettings, setLocalSettings] = useState({});
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordMsg, setPasswordMsg] = useState(null);
  const [passwordErr, setPasswordErr] = useState(null);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const { user, logout, isFullAdmin } = useAuth();
  const { data, isLoading } = useAdminSettings();
  const { update } = useAdminSettingsMutations();

  const settings = data?.data?.settings || {};
  const services = data?.data?.services || {};
  const current = { ...settings[activeCategory], ...localSettings[activeCategory] };

  const handleSave = () => {
    update.mutate({ category: activeCategory, data: current });
    setLocalSettings((s) => ({ ...s, [activeCategory]: {} }));
  };

  const updateField = (key, value) => {
    setLocalSettings((s) => ({
      ...s,
      [activeCategory]: { ...(s[activeCategory] || {}), [key]: value },
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordErr(null);
    setPasswordMsg(null);
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErr('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordErr('Password must be at least 8 characters');
      return;
    }
    setPasswordLoading(true);
    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordMsg('Password changed successfully. Redirecting to login...');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => logout(), 2000);
    } catch (err) {
      setPasswordErr(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (isLoading) return <Loader className="py-20" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Platform Settings" description="Global settings, branding, maintenance mode, and feature flags" />

      <div className="flex flex-wrap gap-2">
        {Object.entries(services).map(([name, ok]) => (
          <Badge key={name} variant={ok ? 'default' : 'destructive'}>{name}: {ok ? 'OK' : 'Not configured'}</Badge>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        <Card className="lg:col-span-1">
          <CardHeader><CardTitle className="text-base">Categories</CardTitle></CardHeader>
          <CardContent className="space-y-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setActiveCategory(cat.key)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm ${activeCategory === cat.key ? 'bg-primary/10 text-primary font-medium' : 'text-muted-foreground hover:bg-accent'}`}
              >
                {cat.label}
              </button>
            ))}
            <div className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
              <p>Email, Cloudinary, Gemini, JWT settings are read from environment variables.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="text-base">{CATEGORIES.find((c) => c.key === activeCategory)?.label}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {CATEGORIES.find((c) => c.key === activeCategory)?.fields.map((field) => {
              const val = current[field];
              if (typeof val === 'boolean' || field === 'enabled' || field === 'registrationEnabled' || ['coding', 'aiAnalysis', 'jobPortal', 'coverLetter', 'contests', 'resumeMatch'].includes(field)) {
                return (
                  <label key={field} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                    <span className="text-sm font-medium capitalize">{field.replace(/([A-Z])/g, ' $1')}</span>
                    <input type="checkbox" checked={!!val} onChange={(e) => updateField(field, e.target.checked)} />
                  </label>
                );
              }
              if (field === 'message') {
                return (
                  <div key={field}>
                    <label className="mb-1 block text-sm font-medium capitalize">{field}</label>
                    <Textarea value={val || ''} onChange={(e) => updateField(field, e.target.value)} rows={3} />
                  </div>
                );
              }
              return (
                <div key={field}>
                  <label className="mb-1 block text-sm font-medium capitalize">{field.replace(/([A-Z])/g, ' $1')}</label>
                  <Input value={val || ''} onChange={(e) => updateField(field, e.target.value)} />
                </div>
              );
            })}
            <Button onClick={handleSave} disabled={update.isPending || !isFullAdmin}>Save Changes</Button>
            {!isFullAdmin && (
              <p className="text-sm text-muted-foreground">Only full admins can update platform settings.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Security</CardTitle>
          <CardDescription>Change password for {user?.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="max-w-md space-y-4">
            {passwordMsg && <p className="text-sm text-green-600 dark:text-green-400">{passwordMsg}</p>}
            {passwordErr && <p className="text-sm text-destructive">{passwordErr}</p>}
            <div>
              <label className="mb-1 block text-sm font-medium">Current Password</label>
              <Input
                type="password"
                value={passwordForm.currentPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">New Password</label>
              <Input
                type="password"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                required
                minLength={8}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium">Confirm New Password</label>
              <Input
                type="password"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                required
                minLength={8}
              />
            </div>
            <Button type="submit" disabled={passwordLoading}>
              {passwordLoading ? 'Changing...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
