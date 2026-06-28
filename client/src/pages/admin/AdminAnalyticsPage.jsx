import { useState } from 'react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

import { AdminPageHeader, AdminStatGrid } from '@/components/admin/AdminComponents';
import { defaultDateRange } from '@/components/insights/chartTheme';
import { InsightsFilters } from '@/components/insights/InsightsLayout';
import { Loader } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useAdminAnalytics } from '@/hooks/useAdmin';

export function AdminAnalyticsPage() {
  const defaults = defaultDateRange();
  const [params, setParams] = useState({ from: defaults.from, to: defaults.to });
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);

  const { data, isLoading } = useAdminAnalytics(params);
  const analytics = data?.data?.analytics;

  if (isLoading) return <Loader className="py-20" />;

  const s = analytics?.summary || {};

  const stats = [
    { label: 'Total Users', value: s.totalUsers?.toLocaleString() || '0' },
    { label: 'New Users', value: s.newUsers?.toLocaleString() || '0' },
    { label: 'Active Users', value: s.activeUsers?.toLocaleString() || '0' },
    { label: 'AI Requests', value: s.aiRequests?.toLocaleString() || '0' },
    { label: 'Active Subscriptions', value: s.activeSubscriptions?.toLocaleString() || '0' },
    { label: 'Revenue', value: `$${(s.revenue || 0).toLocaleString()}` },
  ];

  return (
    <div className="space-y-8">
      <AdminPageHeader title="Platform Analytics" description="Revenue, users, subscriptions, AI usage, retention, and growth" />

      <InsightsFilters
        from={from} to={to}
        onFromChange={setFrom} onToChange={setTo}
        onApply={() => setParams({ from, to })}
        onReset={() => { const d = defaultDateRange(); setFrom(d.from); setTo(d.to); setParams(d); }}
        onExportCsv={() => {}}
        onExportPdf={() => {}}
      />

      <AdminStatGrid stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">User Growth (Monthly)</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics?.growth || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="users" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Daily Active Users</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.dailyActiveUsers || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="visitors" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">AI Requests by Feature</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.aiByFeature || []} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="feature" type="category" tick={{ fontSize: 10 }} width={120} />
                <Tooltip />
                <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Subscriptions by Status</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(analytics?.subscriptionsByStatus || {}).map(([status, count]) => (
                <div key={status} className="flex justify-between rounded-lg border border-border px-4 py-2 text-sm">
                  <span className="capitalize">{status}</span>
                  <span className="font-bold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
