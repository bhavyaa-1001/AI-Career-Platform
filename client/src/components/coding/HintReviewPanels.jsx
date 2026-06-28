import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

export function HintPanel({ hintsUsed, onRequestHint, onDryRun, onVisual, isLoading, history = [] }) {
  const levels = [
    { level: 1, label: 'Hint 1 — Nudge' },
    { level: 2, label: 'Hint 2 — Approach' },
    { level: 3, label: 'Hint 3 — Steps' },
    { level: 4, label: 'Full Solution' },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">AI Hints</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {levels.map(({ level, label }) => (
            <Button
              key={level}
              variant={hintsUsed >= level ? 'secondary' : 'outline'}
              size="sm"
              disabled={isLoading || level > hintsUsed + 1}
              onClick={() => onRequestHint(level)}
            >
              {label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onDryRun} disabled={isLoading}>Dry Run</Button>
          <Button variant="outline" size="sm" onClick={onVisual} disabled={isLoading}>Visual Explain</Button>
        </div>
        <div className="max-h-64 space-y-2 overflow-y-auto">
          {history.slice().reverse().map((h, i) => (
            <div key={i} className="rounded bg-muted p-2 text-xs whitespace-pre-wrap">
              <span className="font-medium capitalize">{h.type.replace('_', ' ')}</span>
              {h.level > 0 && ` (Level ${h.level})`}
              <p className="mt-1">{h.content}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export function CodeReviewPanel({ review, onRequest, isLoading }) {
  if (!review && !isLoading) {
    return (
      <Card>
        <CardContent className="py-6 text-center">
          <p className="mb-3 text-sm text-muted-foreground">Get AI feedback on your code</p>
          <Button onClick={onRequest} disabled={isLoading}>
            {isLoading ? 'Analyzing…' : 'Request AI Review'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) return <Card><CardContent className="py-8 text-center text-sm">Analyzing code…</CardContent></Card>;

  const sections = [
    { title: 'Summary', items: review.summary ? [review.summary] : [], single: true },
    { title: 'Bugs', items: review.bugs },
    { title: 'Optimizations', items: review.optimizations },
    { title: 'Naming', items: review.namingSuggestions },
    { title: 'Code Smells', items: review.codeSmells },
    { title: 'Security', items: review.securityIssues },
    { title: 'Best Practices', items: review.bestPractices },
    { title: 'Alternatives', items: review.alternativeSolutions },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">AI Code Review</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {(review.timeComplexity || review.spaceComplexity) && (
          <div className="grid gap-2 sm:grid-cols-2">
            {review.timeComplexity && (
              <div className="rounded bg-muted p-2 text-xs"><strong>Time:</strong> {review.timeComplexity}</div>
            )}
            {review.spaceComplexity && (
              <div className="rounded bg-muted p-2 text-xs"><strong>Space:</strong> {review.spaceComplexity}</div>
            )}
          </div>
        )}
        {sections.map(({ title, items, single }) => items?.length > 0 && (
          <div key={title}>
            <p className="mb-1 font-medium">{title}</p>
            {single ? <p className="text-xs text-muted-foreground">{items[0]}</p> : (
              <ul className="list-inside list-disc text-xs text-muted-foreground">
                {items.map((item, i) => <li key={i}>{item}</li>)}
              </ul>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
