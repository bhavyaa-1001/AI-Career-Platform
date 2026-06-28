import { Link } from 'react-router-dom';

import { AchievementBadges, DifficultyChart, HeatmapGrid, LanguageUsageChart } from '@/components/coding/CodingWidgets';
import { Loader } from '@/components/common';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useAchievements, useCodingProgress, useHeatmap } from '@/hooks/useCoding';

export function CodingProgressPage() {
  const { data: progressData, isLoading: pLoading } = useCodingProgress();
  const { data: heatmapData, isLoading: hLoading } = useHeatmap();
  const { data: achievementsData } = useAchievements();

  if (pLoading) return <Loader className="py-20" />;

  const progress = progressData?.data;
  const profile = progress?.profile || {};
  const stats = progress?.stats || {};
  const heatmap = heatmapData?.data?.heatmap || [];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Progress Tracking</h1>
        <p className="text-muted-foreground">Solved, attempted, acceptance rate, and activity</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Solved', value: stats.solved },
          { label: 'Attempted', value: stats.attempted },
          { label: 'Submissions', value: stats.totalSubmissions },
          { label: 'Acceptance Rate', value: `${stats.acceptanceRate}%` },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <DifficultyChart distribution={stats.difficultyDistribution} />
        <LanguageUsageChart usage={profile.languageUsage} />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Daily Activity Heatmap</CardTitle></CardHeader>
        <CardContent>
          {hLoading ? <Loader className="py-4" /> : <HeatmapGrid heatmap={heatmap} />}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Achievements</CardTitle></CardHeader>
        <CardContent>
          <AchievementBadges badges={achievementsData?.data?.badges || profile.badges} />
        </CardContent>
      </Card>

      <p className="text-center text-sm">
        <Link to="/coding" className="text-primary hover:underline">← Back to Dashboard</Link>
      </p>
    </div>
  );
}
