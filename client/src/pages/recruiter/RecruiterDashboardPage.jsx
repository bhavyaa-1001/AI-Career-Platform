import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { RecentActivity, StatCard } from '@/components/dashboard';
import { CandidateRankBadge, StatusBadge } from '@/components/recruiter/CandidateRankBadge';
import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Progress } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useRecruiterDashboard } from '@/hooks/useRecruiter';

export function RecruiterDashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useRecruiterDashboard();

  if (isLoading) return <Loader className="py-20" />;

  if (isError) {
    return (
      <div className="text-center">
        <p className="text-destructive">{error.message}</p>
        <Button className="mt-4" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const { stats, company, recentApplications, recentActivity } = data.data;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
          <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Recruiter Dashboard</h1>
              <p className="mt-1 text-muted-foreground">
                Welcome, {user?.firstName}. Manage {company?.name || 'your company'} hiring pipeline.
              </p>
              <Badge variant="outline" className="mt-2 capitalize">Recruiter</Badge>
            </div>
            <div className="w-full sm:w-56">
              <p className="mb-2 text-sm text-muted-foreground">Company profile</p>
              <Progress value={stats.companyCompletion} showLabel />
              <Link to="/recruiter/company" className="mt-3 block">
                <Button variant="outline" className="w-full">Edit Company</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard label="Open Jobs" value={stats.openJobs} trend={`${stats.totalJobs} total`} icon={<span className="text-lg">💼</span>} />
        <StatCard label="Applicants" value={stats.totalApplications} trend={`${stats.pendingApplications} pending`} icon={<span className="text-lg">👥</span>} />
        <StatCard label="Shortlisted" value={stats.shortlistedApplications} trend="In pipeline" icon={<span className="text-lg">⭐</span>} />
        <StatCard
          label="Avg Match Score"
          value={stats.avgRankingScore != null ? `${stats.avgRankingScore}%` : '—'}
          trend="AI candidate ranking"
          icon={<span className="text-lg">🎯</span>}
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {[
                { to: '/recruiter/jobs/new', label: 'Post Job', desc: 'Create a new opening' },
                { to: '/recruiter/jobs', label: 'Manage Jobs', desc: 'Edit and publish listings' },
                { to: '/recruiter/analytics', label: 'Analytics', desc: 'Hiring insights' },
                { to: '/recruiter/company', label: 'Company Profile', desc: 'Update company info' },
              ].map((action) => (
                <Link key={action.to} to={action.to}>
                  <div className="rounded-lg border border-border p-4 transition-colors hover:border-primary/50 hover:bg-accent/50">
                    <p className="font-medium">{action.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{action.desc}</p>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Recent Applicants</CardTitle></CardHeader>
            <CardContent>
              {recentApplications?.length ? (
                <ul className="divide-y divide-border">
                  {recentApplications.map((app) => (
                    <li key={app.id} className="flex items-center justify-between gap-3 py-3">
                      <div className="min-w-0">
                        <p className="truncate font-medium">{app.applicantName || 'Candidate'}</p>
                        <p className="text-xs text-muted-foreground">{app.jobTitle} · {app.companyName}</p>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <CandidateRankBadge score={app.rankingScore} />
                        <StatusBadge status={app.status} />
                        <Link to={`/recruiter/applicants/${app.id}`}>
                          <Button variant="ghost" size="sm">View</Button>
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No applications yet. Post an open job to start receiving candidates.</p>
              )}
            </CardContent>
          </Card>

          <RecentActivity activities={recentActivity} />
        </div>

        <Card>
          <CardHeader><CardTitle>Statistics</CardTitle></CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Total jobs</span><span className="font-medium">{stats.totalJobs}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Open</span><span className="font-medium">{stats.openJobs}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Closed</span><span className="font-medium">{stats.closedJobs}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Total applicants</span><span className="font-medium">{stats.totalApplications}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Pending review</span><span className="font-medium">{stats.pendingApplications}</span></div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
