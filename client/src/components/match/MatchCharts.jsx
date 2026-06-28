import { ScoreGauge } from '@/components/analysis/ScoreGauge';
import { cn } from '@/lib/utils';

export function MatchScoreChart({ score, label = 'Match Score', size = 'lg', className }) {
  return (
    <ScoreGauge score={score} label={label} size={size} className={className} />
  );
}

export function ScoreBarChart({ data, className }) {
  if (!data?.length) {
    return <p className="text-sm text-muted-foreground">No score data yet.</p>;
  }

  const max = Math.max(...data.map((d) => d.score), 1);

  return (
    <div className={cn('space-y-3', className)}>
      {data.map((item) => (
        <div key={item.id || item.label}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="truncate pr-2 text-muted-foreground">{item.label}</span>
            <span className="font-medium tabular-nums">{item.score}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${(item.score / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function DistributionChart({ data, className }) {
  if (!data?.length) {
    return <p className="text-sm text-muted-foreground">No distribution data.</p>;
  }

  const max = Math.max(...data.map((d) => d.count), 1);
  const labels = { 0: '0–49%', 50: '50–69%', 70: '70–84%', 85: '85–100%' };

  return (
    <div className={cn('flex items-end justify-between gap-2', className)}>
      {data.map((bucket) => (
        <div key={bucket.range} className="flex flex-1 flex-col items-center gap-1">
          <span className="text-xs font-medium tabular-nums">{bucket.count}</span>
          <div
            className="w-full rounded-t-md bg-primary/80"
            style={{ height: `${Math.max(8, (bucket.count / max) * 120)}px` }}
          />
          <span className="text-center text-[10px] text-muted-foreground">
            {labels[bucket.range] || bucket.range}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SkillCoverageChart({ matched = [], missing = [], className }) {
  const total = matched.length + missing.length;
  if (!total) {
    return <p className="text-sm text-muted-foreground">No skill data.</p>;
  }

  const matchedPct = Math.round((matched.length / total) * 100);

  return (
    <div className={cn('space-y-4', className)}>
      <div className="relative h-4 overflow-hidden rounded-full bg-muted">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-emerald-500"
          style={{ width: `${matchedPct}%` }}
        />
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-emerald-600 dark:text-emerald-400">{matched.length} matched</span>
        <span className="text-amber-600 dark:text-amber-400">{missing.length} missing</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Matched</p>
          <div className="flex flex-wrap gap-1">
            {matched.slice(0, 10).map((s) => (
              <span key={s} className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-700 dark:text-emerald-400">{s}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Missing</p>
          <div className="flex flex-wrap gap-1">
            {missing.slice(0, 10).map((s) => (
              <span key={typeof s === 'string' ? s : s.skill} className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-400">
                {typeof s === 'string' ? s : s.skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
