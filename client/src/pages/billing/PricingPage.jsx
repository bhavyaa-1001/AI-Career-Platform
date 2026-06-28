import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { StripeTestModeBanner } from '@/components/billing/StripeTestModeBanner';
import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useBillingPlans, useCheckout, useStripeStatus } from '@/hooks/useBilling';
import { billingApi } from '@/lib/api/billing';
import { cn } from '@/lib/utils';

export function PricingPage() {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useBillingPlans();
  const checkout = useCheckout();
  const { data: stripeData } = useStripeStatus();
  const testMode = stripeData?.data?.testMode;
  const [couponCode, setCouponCode] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [error, setError] = useState(null);

  const plans = data?.data?.plans || [];

  const handleSubscribe = async (planSlug) => {
    if (!isAuthenticated) {
      window.location.href = `/register?plan=${planSlug}`;
      return;
    }
    setError(null);
    setSelectedPlan(planSlug);
    try {
      if (couponCode) {
        await billingApi.validateCoupon({ code: couponCode, planSlug });
      }
      const res = await checkout.mutateAsync({ planSlug, couponCode: couponCode || undefined });
      if (res.data?.url) window.location.href = res.data.url;
      else setError('Stripe checkout is not configured. Contact support.');
    } catch (err) {
      setError(err.message || 'Checkout failed');
    } finally {
      setSelectedPlan(null);
    }
  };

  if (isLoading) return <Loader className="py-20" />;

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-4 md:p-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold">Choose Your Plan</h1>
        <p className="mt-2 text-muted-foreground">Scale your career with flexible subscription tiers</p>
      </div>

      {testMode && <StripeTestModeBanner />}

      <div className="mx-auto flex max-w-md gap-2">
        <Input placeholder="Promo code" value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} />
      </div>

      {error && <p className="text-center text-sm text-destructive">{error}</p>}

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan, i) => (
          <motion.div key={plan.id || plan.slug} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className={cn('relative h-full', plan.slug === 'pro' && 'border-primary shadow-lg')}>
              {plan.slug === 'pro' && (
                <Badge className="absolute -top-2 right-4">Popular</Badge>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
                <div className="pt-2">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.interval === 'yearly' ? 'yr' : 'mo'}</span>
                </div>
                {plan.trialDays > 0 && (
                  <Badge variant="secondary">{plan.trialDays}-day trial</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-sm">
                  {(plan.features || []).map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <span className="text-primary">✓</span> {f}
                    </li>
                  ))}
                </ul>
                {plan.limits && (
                  <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
                    <p>AI Credits: {plan.limits.aiCredits === -1 ? 'Unlimited' : plan.limits.aiCredits}</p>
                    <p>Resumes: {plan.limits.resumeLimit === -1 ? 'Unlimited' : plan.limits.resumeLimit}</p>
                    <p>Storage: {plan.limits.storageMb} MB</p>
                  </div>
                )}
                {plan.slug === 'free' ? (
                  isAuthenticated ? (
                    <Button variant="outline" className="w-full" asChild><Link to="/billing">Current Free Tier</Link></Button>
                  ) : (
                    <Button variant="outline" className="w-full" asChild><Link to="/register">Get Started Free</Link></Button>
                  )
                ) : (
                  <Button
                    className="w-full"
                    onClick={() => handleSubscribe(plan.slug)}
                    disabled={checkout.isPending && selectedPlan === plan.slug}
                  >
                    {checkout.isPending && selectedPlan === plan.slug ? 'Redirecting…' : 'Subscribe'}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
