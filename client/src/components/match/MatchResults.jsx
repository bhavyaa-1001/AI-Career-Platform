import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

import { MatchScoreChart, SkillCoverageChart } from './MatchCharts';

const priorityVariant = (p) => {
  if (p === 'high') return 'destructive';
  if (p === 'medium') return 'warning';
  return 'outline';
};

export function MatchResults({ match }) {
  if (!match) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <h2 className="text-xl font-bold">
            {match.jobTitle || 'Job Comparison'}
            {match.companyName && (
              <span className="font-normal text-muted-foreground"> @ {match.companyName}</span>
            )}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">Resume: {match.resumeTitle}</p>
          {match.summary && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{match.summary}</p>
          )}
        </div>
        <MatchScoreChart score={match.matchScore} label="Match %" size="lg" />
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Skill Coverage</CardTitle></CardHeader>
        <CardContent>
          <SkillCoverageChart
            matched={match.matchedSkills}
            missing={match.missingSkills}
          />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Strengths</CardTitle></CardHeader>
          <CardContent>
            {match.strengths?.length ? (
              <ul className="space-y-3">
                {match.strengths.map((s) => (
                  <li key={s.title}>
                    <p className="font-medium">{s.title}</p>
                    {s.detail && <p className="mt-0.5 text-sm text-muted-foreground">{s.detail}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No strengths identified.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Weaknesses</CardTitle></CardHeader>
          <CardContent>
            {match.weaknesses?.length ? (
              <ul className="space-y-3">
                {match.weaknesses.map((w) => (
                  <li key={w.title}>
                    <p className="font-medium">{w.title}</p>
                    {w.detail && <p className="mt-0.5 text-sm text-muted-foreground">{w.detail}</p>}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No weaknesses identified.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Missing Skills</CardTitle></CardHeader>
        <CardContent>
          {match.missingSkills?.length ? (
            <ul className="space-y-2">
              {match.missingSkills.map((s) => (
                <li key={s.skill} className="flex flex-wrap items-start gap-2 text-sm">
                  <Badge variant={priorityVariant(s.priority)}>{s.priority}</Badge>
                  <span className="font-medium">{s.skill}</span>
                  {s.reason && <span className="text-muted-foreground">— {s.reason}</span>}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-emerald-600">No critical skill gaps detected.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Learning Suggestions</CardTitle></CardHeader>
        <CardContent>
          {match.learningSuggestions?.length ? (
            <ul className="space-y-4">
              {match.learningSuggestions.map((l) => (
                <li key={l.topic} className="border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{l.topic}</p>
                    <Badge variant={priorityVariant(l.priority)}>{l.priority}</Badge>
                  </div>
                  {l.resource && (
                    <p className="mt-1 text-sm text-primary">{l.resource}</p>
                  )}
                  {l.reason && (
                    <p className="mt-1 text-sm text-muted-foreground">{l.reason}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No learning suggestions.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
