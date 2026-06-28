import { StatCard } from '@/components/dashboard';
import { Loader } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useTrackingAnalytics } from '@/hooks/useApplicationTracking';
import { TRACK_STATUSES, TRACK_STATUS_LABELS } from '@/lib/api/tracking';

export function TrackingAnalyticsPanel() {
  const { data, isLoading } = useTrackingAnalytics();

  if (isLoading) return <Loader className="py-12" />;

  const analytics = data?.data?.analytics;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Applied" value={analytics.totalApplications} icon={<span>📨</span>} />
        <StatCard label="Saved Jobs" value={analytics.savedJobs} icon={<span>★</span>} />
        <StatCard label="Active Pipeline" value={analytics.activeApplications} icon={<span>🔄</span>} />
        <StatCard label="Offers" value={analytics.offers} trend={`${analytics.interviews} interviews`} icon={<span>🎉</span>} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Response Rate" value={`${analytics.responseRate}%`} trend="Moved past Applied" icon={<span>📈</span>} />
        <StatCard label="Avg Days in Pipeline" value={analytics.avgDaysInPipeline} icon={<span>⏱</span>} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>By Status</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {TRACK_STATUSES.map((s) => (
              <div key={s} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{TRACK_STATUS_LABELS[s]}</span>
                <span className="font-medium">{analytics.byStatus[s] || 0}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Applications Over Time</CardTitle></CardHeader>
          <CardContent>
            {analytics.applicationsOverTime?.length ? (
              <div className="flex flex-wrap gap-2">
                {analytics.applicationsOverTime.map((m) => (
                  <div key={m.month} className="rounded-lg border border-border px-3 py-2 text-center text-xs">
                    <p className="font-medium">{m.count}</p>
                    <p className="text-muted-foreground">{m.month}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No application history yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
