import { Link } from 'react-router-dom';

import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

import { ScoreGauge } from './ScoreGauge';

const severityVariant = (severity) => {
  if (severity === 'high') return 'destructive';
  if (severity === 'medium') return 'warning';
  return 'outline';
};

const priorityVariant = (priority) => {
  if (priority === 'high') return 'destructive';
  if (priority === 'medium') return 'warning';
  return 'outline';
};

export function AnalysisResults({ analysis, showHeader = true }) {
  if (!analysis) return null;

  if (analysis.status === 'failed') {
    const isRateLimit = /rate limit|quota|429/i.test(analysis.error || '');
    return (
      <Card className="border-destructive/30">
        <CardContent className="py-8 text-center">
          <p className="font-medium text-destructive">Analysis failed</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRateLimit
              ? 'Gemini rate limit reached. Wait about a minute and try again.'
              : /model not available|gemini-2\.0|shut down/i.test(analysis.error || '')
                ? 'Your Gemini model is outdated or unavailable. Set GEMINI_MODEL=gemini-2.5-flash-lite in server .env and restart.'
                : (analysis.error || 'Unknown error occurred.')}
          </p>
          {isRateLimit && (
            <p className="mt-3 text-xs text-muted-foreground">
              <a href="https://ai.google.dev/gemini-api/docs/rate-limits" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                View Gemini rate limits
              </a>
            </p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {showHeader && (
        <Card>
          <CardContent className="flex flex-col items-center gap-6 py-8 sm:flex-row sm:justify-around">
            <ScoreGauge score={analysis.atsScore} label="ATS Score" size="lg" />
            <ScoreGauge score={analysis.grammar?.score} label="Grammar Score" size="lg" />
          </CardContent>
        </Card>
      )}

      {analysis.resumeSummary && (
        <Card>
          <CardHeader><CardTitle className="text-base">Resume Summary</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed text-muted-foreground">{analysis.resumeSummary}</p>
          </CardContent>
        </Card>
      )}

      {analysis.grammar?.issues?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Grammar & Clarity</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {analysis.grammar.issues.map((issue, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm">{issue.text}</p>
                  <Badge variant={severityVariant(issue.severity)} className="shrink-0 capitalize">{issue.severity}</Badge>
                </div>
                {issue.suggestion && (
                  <p className="mt-2 text-sm text-primary">→ {issue.suggestion}</p>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {analysis.missingSkills?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Missing Skills</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((skill) => (
                <Badge key={skill} variant="outline">{skill}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {analysis.weakBulletPoints?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Weak Bullet Points</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {analysis.weakBulletPoints.map((bullet, i) => (
              <div key={i} className="rounded-lg border border-border p-3">
                <Badge variant="outline" className="mb-2 capitalize">{bullet.section}</Badge>
                <p className="text-sm text-muted-foreground line-through">{bullet.original}</p>
                <p className="mt-2 text-sm font-medium">{bullet.suggestion}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {analysis.keywordSuggestions?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Keyword Suggestions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {analysis.keywordSuggestions.map((kw, i) => (
              <div key={i} className="flex items-start justify-between gap-3 rounded-lg border border-border p-3">
                <div>
                  <p className="font-medium">{kw.keyword}</p>
                  {kw.reason && <p className="mt-1 text-sm text-muted-foreground">{kw.reason}</p>}
                </div>
                <Badge variant={priorityVariant(kw.priority)} className="shrink-0 capitalize">{kw.priority}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {analysis.improvementTips?.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Improvement Tips</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {analysis.improvementTips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border p-3">
                <Badge variant={priorityVariant(tip.priority)} className="shrink-0 capitalize">{tip.priority}</Badge>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">{tip.category}</p>
                  <p className="mt-1 text-sm">{tip.tip}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function AnalysisHistoryList({ analyses, emptyMessage = 'No analyses yet.' }) {
  if (!analyses?.length) {
    return <p className="py-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  return (
    <div className="divide-y divide-border">
      {analyses.map((item) => (
        <Link
          key={item.id}
          to={`/analytics/${item.id}`}
          className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-accent/30"
        >
          <div className="min-w-0">
            <p className="truncate font-medium">
              {item.resumeTitle || item.sourceFileName || 'Resume Analysis'}
            </p>
            <p className="text-xs text-muted-foreground">
              {new Date(item.createdAt).toLocaleDateString()} · {item.sourceType === 'upload' ? 'Upload' : 'Builder'}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-semibold">{item.atsScore}%</p>
              <p className="text-xs text-muted-foreground">ATS</p>
            </div>
            <Badge variant={item.status === 'completed' ? 'default' : 'destructive'} className="capitalize">
              {item.status}
            </Badge>
          </div>
        </Link>
      ))}
    </div>
  );
}
