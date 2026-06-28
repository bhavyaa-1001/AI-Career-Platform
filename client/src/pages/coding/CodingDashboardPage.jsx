import { Link } from 'react-router-dom';

import {
  AchievementBadges, CodingStatCards, DifficultyChart, HeatmapGrid,
  LanguageUsageChart, LeaderboardTable,
} from '@/components/coding/CodingWidgets';
import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { STATUS_COLORS } from '@/features/coding/constants';
import { useCodingDashboard } from '@/hooks/useCoding';
import { cn } from '@/lib/utils';

export function CodingDashboardPage() {
  const { data, isLoading } = useCodingDashboard();
  const dashboard = data?.data;

  if (isLoading) return <Loader className="py-20" />;

  const profile = dashboard?.profile || {};
  const stats = { ...dashboard?.stats, ...profile, acceptanceRate: dashboard?.stats?.acceptanceRate };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Coding Dashboard</h1>
          <p className="mt-1 text-muted-foreground">Track progress, streaks, and rankings</p>
        </div>
        <div className="flex gap-2">
          <Link to="/coding/problems"><Button variant="outline">Browse Problems</Button></Link>
          <Link to="/coding/daily"><Button>Daily Challenge</Button></Link>
        </div>
      </div>

      <CodingStatCards stats={{ ...stats, totalPoints: dashboard?.points ?? profile.totalPoints }} />

      <div className="grid gap-6 lg:grid-cols-2">
        <DifficultyChart distribution={dashboard?.stats?.difficultyDistribution} />
        <LanguageUsageChart usage={profile.languageUsage} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader><CardTitle className="text-base">Activity Heatmap</CardTitle></CardHeader>
          <CardContent><HeatmapGrid heatmap={Object.entries(profile.dailyActivity || {}).map(([date, count]) => ({ date, count }))} /></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Badges</CardTitle></CardHeader>
          <CardContent><AchievementBadges badges={profile.badges} /></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <LeaderboardTable entries={dashboard?.leaderboardPreview} myRank={{ rank: dashboard?.rank }} />
        <Card>
          <CardHeader><CardTitle className="text-base">Recommended Problems</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {dashboard?.recommendations?.map((p) => (
              <Link key={p.id} to={`/coding/problems/${p.slug}`} className="block rounded border border-border p-3 text-sm hover:border-primary/40">
                {p.title} <Badge className="ml-2 text-xs capitalize">{p.difficulty}</Badge>
              </Link>
            ))}
            {!dashboard?.recommendations?.length && <p className="text-sm text-muted-foreground">Solve problems to get recommendations</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Recent Submissions</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {dashboard?.recentSubmissions?.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded border border-border p-3 text-sm">
              <span>{s.problem?.title || 'Unknown'}</span>
              <span className={cn('capitalize', STATUS_COLORS[s.status])}>{s.status?.replace(/_/g, ' ')}</span>
            </div>
          ))}
          {!dashboard?.recentSubmissions?.length && <p className="text-sm text-muted-foreground">No submissions yet</p>}
        </CardContent>
      </Card>
    </div>
  );
}
