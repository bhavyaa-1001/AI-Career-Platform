import { Link } from 'react-router-dom';

import { StatCard } from '@/components/dashboard';
import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useMatchDashboard } from '@/hooks/useResumeMatch';

import { DistributionChart, ScoreBarChart } from './MatchCharts';

export function MatchDashboardPanel() {
  const { data, isLoading } = useMatchDashboard();

  if (isLoading) return <Loader className="py-12" />;

  const dashboard = data?.data?.dashboard;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Comparisons" value={dashboard.stats.totalComparisons} icon={<span>📊</span>} />
        <StatCard label="Avg Match" value={`${dashboard.stats.avgMatchScore}%`} icon={<span>🎯</span>} />
        <StatCard label="Best Match" value={`${dashboard.stats.bestMatchScore}%`} icon={<span>🏆</span>} />
        <StatCard
          label="Latest Score"
          value={dashboard.stats.latestScore != null ? `${dashboard.stats.latestScore}%` : '—'}
          icon={<span>📈</span>}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Match Score History</CardTitle></CardHeader>
          <CardContent>
            <ScoreBarChart data={dashboard.scoreHistory} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Score Distribution</CardTitle></CardHeader>
          <CardContent>
            <DistributionChart data={dashboard.scoreDistribution} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Top Missing Skills</CardTitle></CardHeader>
          <CardContent>
            {dashboard.topMissingSkills?.length ? (
              <ul className="space-y-2">
                {dashboard.topMissingSkills.map((s) => (
                  <li key={s.skill} className="flex justify-between text-sm">
                    <span>{s.skill}</span>
                    <Badge variant="outline">{s.count}×</Badge>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Run comparisons to see skill gaps.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Comparisons Over Time</CardTitle></CardHeader>
          <CardContent>
            {dashboard.comparisonsOverTime?.length ? (
              <div className="flex flex-wrap gap-2">
                {dashboard.comparisonsOverTime.map((m) => (
                  <div key={m.month} className="rounded-lg border border-border px-3 py-2 text-center text-xs">
                    <p className="font-medium">{m.count} runs</p>
                    <p className="text-muted-foreground">avg {m.avgScore}%</p>
                    <p className="text-muted-foreground">{m.month}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No history yet.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {dashboard.recentMatches?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Recent Comparisons</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y divide-border">
              {dashboard.recentMatches.map((m) => (
                <li key={m.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium">{m.jobTitle || m.resumeTitle}</p>
                    <p className="text-xs text-muted-foreground">{m.companyName || '—'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge>{m.matchScore}%</Badge>
                    <Link to={`/match/${m.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
