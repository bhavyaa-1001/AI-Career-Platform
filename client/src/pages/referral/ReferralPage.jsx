import { useState } from 'react';

import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';
import { useReferralDashboard } from '@/hooks/useBilling';
import { billingApi } from '@/lib/api/billing';

export function ReferralPage() {
  const { data, isLoading, refetch } = useReferralDashboard();
  const [applyCode, setApplyCode] = useState('');
  const [message, setMessage] = useState(null);

  if (isLoading) return <Loader className="py-20" />;

  const dashboard = data?.data || {};
  const stats = dashboard.stats || {};

  const copyLink = () => {
    navigator.clipboard.writeText(dashboard.inviteUrl || '');
    setMessage('Invite link copied!');
  };

  const applyReferral = async () => {
    try {
      await billingApi.applyReferral(applyCode);
      setMessage('Referral code applied!');
      refetch();
    } catch (err) {
      setMessage(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold">Referral Program</h1>
        <p className="text-muted-foreground">Invite friends and earn bonus AI credits</p>
      </div>

      {message && <div className="rounded-lg border px-4 py-3 text-sm">{message}</div>}

      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold">{stats.pending || 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Rewarded</p><p className="text-2xl font-bold">{stats.rewarded || 0}</p></CardContent></Card>
        <Card><CardContent className="pt-6"><p className="text-sm text-muted-foreground">Credits Earned</p><p className="text-2xl font-bold">{dashboard.referralCredits || 0}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Your Referral Code</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <Badge className="text-lg px-4 py-2">{dashboard.referralCode}</Badge>
            <Button onClick={copyLink}>Copy Invite Link</Button>
          </div>
          <p className="text-xs text-muted-foreground break-all">{dashboard.inviteUrl}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Have a Referral Code?</CardTitle></CardHeader>
        <CardContent className="flex gap-2">
          <Input placeholder="Enter code" value={applyCode} onChange={(e) => setApplyCode(e.target.value.toUpperCase())} />
          <Button onClick={applyReferral}>Apply</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Recent Referrals</CardTitle></CardHeader>
        <CardContent>
          {(dashboard.referrals || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No referrals yet. Share your link to get started!</p>
          ) : (
            <ul className="space-y-2">
              {dashboard.referrals.map((r) => (
                <li key={r.id} className="flex justify-between text-sm">
                  <span>Referral</span>
                  <Badge variant="outline">{r.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
