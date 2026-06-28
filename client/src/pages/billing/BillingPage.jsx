import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';

import { StripeTestModeBanner } from '@/components/billing/StripeTestModeBanner';
import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { billingApi } from '@/lib/api/billing';
import {
  useBillingOverview,
  useBillingPortal,
  useBillingUsage,
  useCancelSubscription,
  useInvoices,
  usePaymentHistory,
  useStripeStatus,
} from '@/hooks/useBilling';

function UsageBar({ label, used, limit, unlimited }) {
  const pct = unlimited || !limit ? 100 : Math.min(100, Math.round((used / limit) * 100));
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="text-muted-foreground">
          {used}{unlimited ? '' : ` / ${limit}`}{unlimited ? ' (Unlimited)' : ''}
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function BillingPage() {
  const [params] = useSearchParams();
  const [message, setMessage] = useState(null);
  const { data: overviewData, isLoading, refetch: refetchOverview } = useBillingOverview();
  const { data: usageData } = useBillingUsage();
  const { data: paymentsData } = usePaymentHistory({ page: 1, limit: 5 });
  const { data: invoicesData } = useInvoices({ page: 1, limit: 5 });
  const portal = useBillingPortal();
  const cancel = useCancelSubscription();
  const { data: stripeData } = useStripeStatus();
  const testMode = stripeData?.data?.testMode;

  useEffect(() => {
    const sessionId = params.get('session_id');
    if (params.get('success') && sessionId) {
      billingApi.confirmCheckout(sessionId)
        .then(() => {
          setMessage('Subscription activated successfully.');
          refetchOverview();
        })
        .catch((err) => setMessage(err.message || 'Payment received — syncing subscription…'));
    } else if (params.get('success')) {
      setMessage('Subscription updated successfully.');
    }
    if (params.get('cancelled')) setMessage('Checkout was cancelled.');
  }, [params, refetchOverview]);

  if (isLoading) return <Loader className="py-20" />;

  const overview = overviewData?.data;
  const usage = usageData?.data?.usage || {};
  const plan = overview?.plan;
  const subscription = overview?.subscription;

  const handlePortal = async () => {
    try {
      const res = await portal.mutateAsync();
      window.location.href = res.data.url;
    } catch (err) {
      setMessage(err.message || 'Unable to open billing portal');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel subscription at end of billing period?')) return;
    try {
      await cancel.mutateAsync({ immediately: false });
      setMessage('Subscription will cancel at period end.');
    } catch (err) {
      setMessage(err.message || 'Cancel failed');
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground">Manage your plan, usage, and payment history</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild><Link to="/pricing">View Plans</Link></Button>
          <Button onClick={handlePortal} disabled={portal.isPending}>Manage Billing</Button>
        </div>
      </div>

      {testMode && <StripeTestModeBanner />}

      {message && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3 text-sm">
          {message}
        </motion.div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Current Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold">{plan?.name || 'Free'}</span>
              {subscription?.status && <Badge variant="secondary">{subscription.status}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">{plan?.description}</p>
            {plan?.price > 0 && (
              <p className="text-lg font-medium">${plan.price}/{plan.interval === 'yearly' ? 'yr' : 'mo'}</p>
            )}
            {subscription?.currentPeriodEnd && (
              <p className="text-xs text-muted-foreground">
                Renews {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                {subscription.cancelAtPeriodEnd ? ' (cancelling)' : ''}
              </p>
            )}
            {plan?.slug !== 'free' && subscription?.status === 'active' && !subscription.cancelAtPeriodEnd && (
              <Button variant="destructive" size="sm" onClick={handleCancel} disabled={cancel.isPending}>
                Cancel Subscription
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Usage This Month</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {Object.entries(usage).map(([key, val]) => (
              <UsageBar
                key={key}
                label={key.replace(/([A-Z])/g, ' $1')}
                used={val.used}
                limit={val.limit}
                unlimited={val.unlimited}
              />
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Recent Payments</CardTitle></CardHeader>
          <CardContent>
            {(paymentsData?.data?.payments || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No payments yet</p>
            ) : (
              <ul className="space-y-2">
                {paymentsData.data.payments.map((p) => (
                  <li key={p.id} className="flex justify-between text-sm">
                    <span>{p.description || 'Payment'}</span>
                    <span>${p.amount?.toFixed(2)} {p.currency}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Invoices</CardTitle></CardHeader>
          <CardContent>
            {(invoicesData?.data?.invoices || []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No invoices yet</p>
            ) : (
              <ul className="space-y-2">
                {invoicesData.data.invoices.map((inv) => (
                  <li key={inv.id} className="flex justify-between text-sm">
                    <span>{inv.number || inv.id}</span>
                    {inv.hostedUrl ? (
                      <a href={inv.hostedUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">View</a>
                    ) : (
                      <Badge variant="outline">{inv.status}</Badge>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
