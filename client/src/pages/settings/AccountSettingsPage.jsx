import { useState } from 'react';

import { useDispatch } from 'react-redux';

import { Loader } from '@/components/common';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select } from '@/components/ui';
import { setTheme as setThemeAction } from '@/features/theme/themeSlice';
import { usePreferences, useSecurityOverview, useUpdatePreferences } from '@/hooks/useBilling';
import { billingApi } from '@/lib/api/billing';
import { useTheme } from '@/hooks/useTheme';

const TABS = [
  { id: 'general', label: 'General' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'security', label: 'Security' },
  { id: 'billing', label: 'Billing Address' },
  { id: 'data', label: 'Data & Account' },
];

export function AccountSettingsPage() {
  const [tab, setTab] = useState('general');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [twoFactorToken, setTwoFactorToken] = useState('');
  const [twoFactorSetup, setTwoFactorSetup] = useState(null);
  const [address, setAddress] = useState({ line1: '', city: '', postalCode: '', country: 'US' });
  const [deletePassword, setDeletePassword] = useState('');

  const { data: prefsData, isLoading } = usePreferences();
  const { data: securityData } = useSecurityOverview();
  const updatePrefs = useUpdatePreferences();
  const dispatch = useDispatch();
  const { mode: themeMode } = useTheme();

  const prefs = prefsData?.data?.preferences;
  const security = securityData?.data;

  const savePrefs = async (payload) => {
    setError(null);
    try {
      await updatePrefs.mutateAsync(payload);
      setMessage('Settings saved.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handle2faSetup = async () => {
    try {
      const res = await billingApi.setup2fa();
      setTwoFactorSetup(res.data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handle2faEnable = async () => {
    try {
      await billingApi.enable2fa(twoFactorToken);
      setMessage('Two-factor authentication enabled.');
      setTwoFactorSetup(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleExport = async () => {
    const res = await billingApi.exportData();
    setMessage(res.data?.message);
  };

  const handleDelete = async () => {
    if (!window.confirm('This will deactivate your account. Continue?')) return;
    try {
      await billingApi.deleteAccount(deletePassword);
      setMessage('Account deletion scheduled.');
    } catch (err) {
      setError(err.message);
    }
  };

  const saveAddress = async () => {
    try {
      await billingApi.updateBillingAddress(address);
      setMessage('Billing address saved.');
    } catch (err) {
      setError(err.message);
    }
  };

  if (isLoading) return <Loader className="py-20" />;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground">Language, theme, privacy, security, and data preferences</p>
      </div>

      {message && <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">{message}</div>}
      {error && <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">{error}</div>}

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`rounded-lg px-3 py-1.5 text-sm ${tab === t.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && (
        <Card>
          <CardHeader><CardTitle>General</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Language</label>
              <Select
                value={prefs?.language || 'en'}
                onChange={(e) => savePrefs({ language: e.target.value })}
                options={[
                  { value: 'en', label: 'English' },
                  { value: 'es', label: 'Spanish' },
                  { value: 'fr', label: 'French' },
                  { value: 'de', label: 'German' },
                ]}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Theme</label>
              <div className="mt-2 flex items-center gap-4">
                <ThemeToggle />
                <Select
                  value={themeMode || prefs?.theme || 'light'}
                  onChange={(e) => {
                    if (e.target.value !== 'system') dispatch(setThemeAction(e.target.value));
                    savePrefs({ theme: e.target.value });
                  }}
                  options={[
                    { value: 'light', label: 'Light' },
                    { value: 'dark', label: 'Dark' },
                    { value: 'system', label: 'System' },
                  ]}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {tab === 'notifications' && prefs && (
        <Card>
          <CardHeader><CardTitle>Notification Preferences</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(prefs.notifications || {}).map(([key, val]) => (
              <label key={key} className="flex items-center justify-between text-sm">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <input
                  type="checkbox"
                  checked={val}
                  onChange={(e) => savePrefs({ notifications: { [key]: e.target.checked } })}
                />
              </label>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === 'privacy' && prefs && (
        <Card>
          <CardHeader><CardTitle>Privacy</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(prefs.privacy || {}).map(([key, val]) => (
              <label key={key} className="flex items-center justify-between text-sm">
                <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                <input
                  type="checkbox"
                  checked={val}
                  onChange={(e) => savePrefs({ privacy: { [key]: e.target.checked } })}
                />
              </label>
            ))}
          </CardContent>
        </Card>
      )}

      {tab === 'security' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Two-Factor Authentication</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Badge variant={security?.security?.twoFactorEnabled ? 'default' : 'secondary'}>
                {security?.security?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </Badge>
              {!security?.security?.twoFactorEnabled && !twoFactorSetup && (
                <Button onClick={handle2faSetup}>Set Up 2FA</Button>
              )}
              {twoFactorSetup && (
                <div className="space-y-2 rounded-lg bg-muted p-3 text-sm">
                  <p>Scan this secret in your authenticator app:</p>
                  <code className="block break-all">{twoFactorSetup.secret}</code>
                  <Input placeholder="6-digit code" value={twoFactorToken} onChange={(e) => setTwoFactorToken(e.target.value)} />
                  <Button onClick={handle2faEnable}>Verify & Enable</Button>
                </div>
              )}
              {security?.security?.twoFactorEnabled && (
                <Button variant="outline" onClick={() => billingApi.disable2fa()}>Disable 2FA</Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Active Sessions</CardTitle></CardHeader>
            <CardContent>
              {(security?.activeSessions || []).length === 0 ? (
                <p className="text-sm text-muted-foreground">No active sessions tracked</p>
              ) : (
                <ul className="space-y-2 text-sm">
                  {security.activeSessions.map((s) => (
                    <li key={s.sessionId} className="flex justify-between rounded border p-2">
                      <span>{s.userAgent?.slice(0, 40) || s.ip}</span>
                      <Button size="sm" variant="ghost" onClick={() => billingApi.revokeSession(s.sessionId)}>Revoke</Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Login History</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-1 text-sm text-muted-foreground">
                {(security?.loginHistory || []).slice(0, 10).map((l) => (
                  <li key={l.id}>{new Date(l.createdAt).toLocaleString()} — {l.ip || 'Unknown IP'}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}

      {tab === 'billing' && (
        <Card>
          <CardHeader><CardTitle>Billing Address</CardTitle></CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-2">
            <Input placeholder="Address line 1" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
            <Input placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
            <Input placeholder="Postal code" value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} />
            <Input placeholder="Country (US)" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
            <Button onClick={saveAddress} className="md:col-span-2">Save Address</Button>
          </CardContent>
        </Card>
      )}

      {tab === 'data' && (
        <Card>
          <CardHeader><CardTitle>Data & Account</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Export all your account data as an archive.</p>
              <Button variant="outline" onClick={handleExport}>Request Data Export</Button>
            </div>
            <div className="border-t pt-4">
              <p className="text-sm text-destructive mb-2">Permanently delete your account and data.</p>
              <Input type="password" placeholder="Confirm password" value={deletePassword} onChange={(e) => setDeletePassword(e.target.value)} />
              <Button variant="destructive" className="mt-2" onClick={handleDelete}>Delete Account</Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
