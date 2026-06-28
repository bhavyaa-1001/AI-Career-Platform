import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { StatCard } from '@/components/dashboard';
import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useRecruiterAnalytics } from '@/hooks/useRecruiter';

export function RecruiterAnalyticsPage() {
  const { data, isLoading, isError, error, refetch } = useRecruiterAnalytics();

  if (isLoading) return <Loader className="py-20" />;

  if (isError) {
    return (
      <div className="text-center">
        <p className="text-destructive">{error.message}</p>
        <Button className="mt-4" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const analytics = data?.data?.analytics;

  if (!analytics) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Unable to load analytics data.</p>
        <Button className="mt-4" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const totalApps = Object.values(analytics.applicationsByStatus || {}).reduce((a, b) => a + b, 0);
  const openJobs = analytics.jobsByStatus?.open || 0;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Recruiter Analytics</h1>
            <p className="mt-1 text-muted-foreground">Hiring pipeline insights and candidate match trends.</p>
          </div>
          <Link to="/recruiter">
            <Button variant="outline">Dashboard</Button>
          </Link>
        </div>
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Open Jobs" value={openJobs} trend="Active listings" icon={<span className="text-lg">📋</span>} />
        <StatCard label="Total Applicants" value={totalApps} trend="All time" icon={<span className="text-lg">👥</span>} />
        <StatCard label="Shortlisted" value={analytics.applicationsByStatus?.shortlisted || 0} trend="In pipeline" icon={<span className="text-lg">⭐</span>} />
        <StatCard label="Accepted" value={analytics.applicationsByStatus?.accepted || 0} trend="Hired" icon={<span className="text-lg">✅</span>} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top Jobs by Applicants</CardTitle></CardHeader>
          <CardContent>
            {analytics.topJobs?.length ? (
              <ul className="divide-y divide-border">
                {analytics.topJobs.map((job) => (
                  <li key={job.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{job.title}</p>
                      <p className="text-xs text-muted-foreground">{job.companyName}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{job.applicantCount} apps</Badge>
                      <Link to={`/recruiter/jobs/${job.id}/applicants`}>
                        <Button variant="ghost" size="sm">View</Button>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No job data yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Applications by Status</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {Object.entries(analytics.applicationsByStatus || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="capitalize text-muted-foreground">{status}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
            {!totalApps && <p className="text-sm text-muted-foreground">No applications yet.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Match Score Distribution</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {analytics.scoreDistribution?.length ? analytics.scoreDistribution.map((bucket) => (
              <div key={bucket.range} className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {bucket.range === 'other' ? 'Other' : `${bucket.range}%`}
                </span>
                <span className="font-medium">{bucket.count}</span>
              </div>
            )) : (
              <p className="text-sm text-muted-foreground">Rank candidates to see score distribution.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Recent Rankings</CardTitle></CardHeader>
          <CardContent>
            {analytics.recentRankings?.length ? (
              <ul className="divide-y divide-border">
                {analytics.recentRankings.map((r) => (
                  <li key={r.id} className="flex items-center justify-between py-3 text-sm">
                    <div>
                      <p className="font-medium">{r.applicantName || 'Candidate'}</p>
                      <p className="text-xs text-muted-foreground">{r.jobTitle}</p>
                    </div>
                    <Badge>{r.score}%</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No rankings yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {analytics.applicationsOverTime?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Applications Over Time</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analytics.applicationsOverTime.map((d) => (
                <div key={d.date} className="rounded-lg border border-border px-3 py-2 text-center text-xs">
                  <p className="font-medium">{d.count}</p>
                  <p className="text-muted-foreground">{d.date.slice(5)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
