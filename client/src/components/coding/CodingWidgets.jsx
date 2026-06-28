import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { DIFFICULTY_COLORS } from '@/features/coding/constants';
import { cn } from '@/lib/utils';

export function ProblemCard({ problem, solved }) {
  return (
    <Card className="transition-colors hover:border-primary/40">
      <CardContent className="flex items-center justify-between gap-3 p-4">
        <div>
          <p className="font-medium">{problem.title}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge className={cn('text-xs capitalize', DIFFICULTY_COLORS[problem.difficulty])}>
              {problem.difficulty}
            </Badge>
            <Badge variant="outline" className="text-xs">{problem.points} pts</Badge>
            {solved && <Badge variant="success" className="text-xs">Solved</Badge>}
          </div>
        </div>
        <span className="text-xs text-muted-foreground">{problem.acceptanceRate}% AC</span>
      </CardContent>
    </Card>
  );
}

export function LeaderboardTable({ entries, myRank }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Leaderboard</CardTitle>
          {myRank && (
            <span className="text-xs text-muted-foreground">Your rank: #{myRank.rank}</span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs text-muted-foreground">
                <th className="pb-2 pr-4">#</th>
                <th className="pb-2 pr-4">User</th>
                <th className="pb-2 pr-4">Points</th>
                <th className="pb-2 pr-4">Solved</th>
                <th className="pb-2">Streak</th>
              </tr>
            </thead>
            <tbody>
              {entries?.map((e) => (
                <tr key={e.userId} className="border-b border-border/50">
                  <td className="py-2 pr-4 font-medium">{e.rank}</td>
                  <td className="py-2 pr-4">{e.name}</td>
                  <td className="py-2 pr-4">{e.points}</td>
                  <td className="py-2 pr-4">{e.totalSolved}</td>
                  <td className="py-2">{e.currentStreak}🔥</td>
                </tr>
              ))}
              {!entries?.length && (
                <tr><td colSpan={5} className="py-6 text-center text-muted-foreground">No rankings yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export function AchievementBadges({ badges = [] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <Badge key={b.id} variant="secondary" title={b.name}>
          🏅 {b.name}
        </Badge>
      ))}
      {!badges.length && <p className="text-sm text-muted-foreground">No badges earned yet</p>}
    </div>
  );
}

export function ContestTimer({ endTime }) {
  const end = new Date(endTime).getTime();
  const remaining = Math.max(0, end - Date.now());
  const h = Math.floor(remaining / 3600000);
  const m = Math.floor((remaining % 3600000) / 60000);
  const s = Math.floor((remaining % 60000) / 1000);

  return (
    <div className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-2 text-center">
      <p className="text-xs text-muted-foreground">Time Remaining</p>
      <p className="font-mono text-2xl font-bold tabular-nums">
        {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </p>
    </div>
  );
}

export function HeatmapGrid({ heatmap = [] }) {
  const max = Math.max(1, ...heatmap.map((d) => d.count));

  return (
    <div className="flex flex-wrap gap-1">
      {heatmap.slice(-90).map((d) => (
        <div
          key={d.date}
          title={`${d.date}: ${d.count} submissions`}
          className="h-3 w-3 rounded-sm"
          style={{ backgroundColor: `rgba(59, 130, 246, ${d.count / max})` }}
        />
      ))}
    </div>
  );
}

export function CodingStatCards({ stats }) {
  if (!stats) return null;
  const cards = [
    { label: 'Solved', value: stats.solved ?? stats.totalSolved ?? 0 },
    { label: 'Attempted', value: stats.attempted ?? stats.totalAttempted ?? 0 },
    { label: 'Acceptance', value: `${stats.acceptanceRate ?? 0}%` },
    { label: 'Points', value: stats.totalPoints ?? 0 },
    { label: 'Streak', value: `${stats.currentStreak ?? 0} days` },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">{c.label}</p>
            <p className="text-2xl font-bold">{c.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function DifficultyChart({ distribution = {} }) {
  const items = [
    { key: 'easy', label: 'Easy', color: 'bg-green-500' },
    { key: 'medium', label: 'Medium', color: 'bg-amber-500' },
    { key: 'hard', label: 'Hard', color: 'bg-red-500' },
  ];
  const total = items.reduce((s, i) => s + (distribution[i.key] || 0), 0) || 1;

  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">Difficulty Distribution</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {items.map(({ key, label, color }) => (
          <div key={key}>
            <div className="mb-1 flex justify-between text-xs">
              <span>{label}</span>
              <span>{distribution[key] || 0}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className={cn('h-2 rounded-full', color)} style={{ width: `${((distribution[key] || 0) / total) * 100}%` }} />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export function LanguageUsageChart({ usage = {} }) {
  const entries = Object.entries(usage).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = Math.max(1, ...entries.map(([, v]) => v));

  return (
    <Card>
      <CardHeader className="pb-2"><CardTitle className="text-base">Language Usage</CardTitle></CardHeader>
      <CardContent className="space-y-2">
        {entries.map(([lang, count]) => (
          <div key={lang}>
            <div className="mb-1 flex justify-between text-xs capitalize">
              <span>{lang}</span><span>{count}</span>
            </div>
            <div className="h-2 rounded-full bg-muted">
              <div className="h-2 rounded-full bg-primary" style={{ width: `${(count / max) * 100}%` }} />
            </div>
          </div>
        ))}
        {!entries.length && <p className="text-xs text-muted-foreground">No submissions yet</p>}
      </CardContent>
    </Card>
  );
}
