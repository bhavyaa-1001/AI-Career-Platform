import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

import { AdminPageHeader, AdminStatGrid, AdminTable } from '@/components/admin/AdminComponents';
import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useAdminDashboard } from '@/hooks/useAdmin';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'];

export function AdminDashboardPage() {
  const { data, isLoading } = useAdminDashboard({});
  const dashboard = data?.data?.dashboard;

  if (isLoading) return <Loader className="py-20" />;

  const s = dashboard?.stats || {};
  const charts = dashboard?.charts || {};

  const stats = [
    { label: 'Total Users', value: s.totalUsers?.toLocaleString() || '0' },
    { label: 'Active Users', value: s.activeUsers?.toLocaleString() || '0', sub: 'Last 30 days' },
    { label: 'Recruiters', value: s.recruiters?.toLocaleString() || '0' },
    { label: 'Companies', value: s.companies?.toLocaleString() || '0' },
    { label: 'Jobs', value: s.totalJobs?.toLocaleString() || '0' },
    { label: 'Applications', value: s.totalApplications?.toLocaleString() || '0' },
    { label: 'Coding Problems', value: s.totalProblems?.toLocaleString() || '0' },
    { label: 'Contests', value: s.totalContests?.toLocaleString() || '0' },
    { label: 'AI Requests', value: s.aiRequests?.toLocaleString() || '0' },
    { label: 'Revenue', value: `$${(s.revenue || 0).toLocaleString()}`, sub: 'Active subs' },
    { label: 'Active Subscriptions', value: s.activeSubscriptions?.toLocaleString() || '0' },
    { label: 'Daily Visitors', value: s.dailyVisitors?.toLocaleString() || '0', sub: 'Today' },
  ];

  const roleData = Object.entries(charts.usersByRole || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Enterprise Dashboard"
        description="Platform overview, growth metrics, and quick statistics"
        actions={
          <>
            <Link to="/admin/analytics"><Button variant="outline" size="sm">Full Analytics</Button></Link>
            <Link to="/admin/users"><Button size="sm">Manage Users</Button></Link>
          </>
        }
      />

      <AdminStatGrid stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">User Growth</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.userGrowth || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Users by Role</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">AI Requests Over Time</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.aiOverTime || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Daily Visitors</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={charts.dailyVisitors || []}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="visitors" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Users</CardTitle></CardHeader>
        <CardContent>
          <AdminTable
            columns={[
              { key: 'name', label: 'Name', render: (r) => `${r.firstName} ${r.lastName}` },
              { key: 'email', label: 'Email' },
              { key: 'role', label: 'Role', render: (r) => <Badge variant="outline">{r.role}</Badge> },
              { key: 'isActive', label: 'Status', render: (r) => r.isActive ? 'Active' : 'Inactive' },
              { key: 'createdAt', label: 'Joined', render: (r) => new Date(r.createdAt).toLocaleDateString() },
            ]}
            rows={dashboard?.recentUsers || []}
          />
        </CardContent>
      </Card>
    </div>
  );
}
