import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

import { AdminPageHeader, AdminStatGrid, AdminTable } from '@/components/admin/AdminComponents';
import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select } from '@/components/ui';
import { adminSaasApi } from '@/lib/api/billing';

const TABS = ['revenue', 'plans', 'coupons', 'subscriptions', 'payments', 'referrals'];

export function AdminSaasPage() {
  const [tab, setTab] = useState('revenue');
  const [couponForm, setCouponForm] = useState({ code: '', discountType: 'percent', discountValue: 10 });

  const { data: revenueData, isLoading: revenueLoading } = useQuery({
    queryKey: ['admin', 'saas', 'revenue'],
    queryFn: () => adminSaasApi.revenue(),
    enabled: tab === 'revenue',
  });

  const { data: plansData, refetch: refetchPlans } = useQuery({
    queryKey: ['admin', 'saas', 'plans'],
    queryFn: () => adminSaasApi.plans(),
    enabled: tab === 'plans',
  });

  const { data: couponsData, refetch: refetchCoupons } = useQuery({
    queryKey: ['admin', 'saas', 'coupons'],
    queryFn: () => adminSaasApi.coupons(),
    enabled: tab === 'coupons',
  });

  const { data: subsData } = useQuery({
    queryKey: ['admin', 'saas', 'subscriptions'],
    queryFn: () => adminSaasApi.subscriptions({ page: 1, limit: 20 }),
    enabled: tab === 'subscriptions',
  });

  const { data: paymentsData } = useQuery({
    queryKey: ['admin', 'saas', 'payments'],
    queryFn: () => adminSaasApi.payments({ page: 1, limit: 20 }),
    enabled: tab === 'payments',
  });

  const { data: referralsData } = useQuery({
    queryKey: ['admin', 'saas', 'referrals'],
    queryFn: () => adminSaasApi.referrals({ page: 1, limit: 20 }),
    enabled: tab === 'referrals',
  });

  const dashboard = revenueData?.data?.dashboard;
  const summary = dashboard?.summary || {};

  const createCoupon = async () => {
    await adminSaasApi.createCoupon(couponForm);
    setCouponForm({ code: '', discountType: 'percent', discountValue: 10 });
    refetchCoupons();
  };

  if (revenueLoading && tab === 'revenue') return <Loader className="py-20" />;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="SaaS Management" description="Plans, billing, coupons, referrals, and revenue analytics" />

      <div className="flex flex-wrap gap-2">
        {TABS.map((t) => (
          <Button key={t} variant={tab === t ? 'default' : 'outline'} size="sm" onClick={() => setTab(t)} className="capitalize">
            {t}
          </Button>
        ))}
      </div>

      {tab === 'revenue' && (
        <>
          <AdminStatGrid stats={[
            { label: 'MRR', value: `$${(summary.mrr || 0).toLocaleString()}` },
            { label: 'Total Revenue', value: `$${(summary.totalRevenue || 0).toLocaleString()}` },
            { label: 'Active Subscriptions', value: summary.activeSubscriptions || 0 },
            { label: 'Active Coupons', value: summary.activeCoupons || 0 },
            { label: 'Rewarded Referrals', value: summary.rewardedReferrals || 0 },
          ]} />
          <Card>
            <CardHeader><CardTitle>Revenue Over Time</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboard?.revenueOverTime || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </>
      )}

      {tab === 'plans' && (
        <AdminTable
          columns={['Name', 'Slug', 'Price', 'Trial', 'Active', 'Actions']}
          rows={(plansData?.data?.plans || []).map((p) => [
            p.name,
            p.slug,
            `$${p.price}`,
            p.trialDays || 0,
            p.isActive ? 'Yes' : 'No',
            <Button key={p.id} size="sm" variant="outline" onClick={() => adminSaasApi.updatePlan(p.id, { isActive: !p.isActive }).then(() => refetchPlans())}>
              Toggle
            </Button>,
          ])}
        />
      )}

      {tab === 'coupons' && (
        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Create Coupon</CardTitle></CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Input placeholder="CODE" value={couponForm.code} onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })} />
              <Select value={couponForm.discountType} onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })} options={[{ value: 'percent', label: 'Percent' }, { value: 'fixed', label: 'Fixed' }]} />
              <Input type="number" placeholder="Value" value={couponForm.discountValue} onChange={(e) => setCouponForm({ ...couponForm, discountValue: Number(e.target.value) })} />
              <Button onClick={createCoupon}>Create</Button>
            </CardContent>
          </Card>
          <AdminTable
            columns={['Code', 'Type', 'Value', 'Redemptions', 'Active']}
            rows={(couponsData?.data?.coupons || []).map((c) => [c.code, c.type, c.value, `${c.redemptionCount}/${c.maxRedemptions || '∞'}`, c.isActive ? 'Yes' : 'No'])}
          />
        </div>
      )}

      {tab === 'subscriptions' && (
        <AdminTable
          columns={['Plan', 'Status', 'Amount', 'Period End']}
          rows={(subsData?.data?.subscriptions || []).map((s) => [
            s.planName || s.planSlug,
            <Badge key={s.id}>{s.status}</Badge>,
            `$${s.amount}`,
            s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : '—',
          ])}
        />
      )}

      {tab === 'payments' && (
        <AdminTable
          columns={['Description', 'Amount', 'Status', 'Date']}
          rows={(paymentsData?.data?.payments || []).map((p) => [
            p.description,
            `$${p.amount}`,
            p.status,
            new Date(p.createdAt).toLocaleDateString(),
          ])}
        />
      )}

      {tab === 'referrals' && (
        <AdminTable
          columns={['Code', 'Status', 'Credits', 'Date']}
          rows={(referralsData?.data?.referrals || []).map((r) => [
            r.referralCode,
            r.status,
            r.rewardCredits,
            new Date(r.createdAt).toLocaleDateString(),
          ])}
        />
      )}
    </div>
  );
}
