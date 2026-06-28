import { Link } from 'react-router-dom';

import { Loader } from '@/components/common';
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { STATUS_COLORS } from '@/features/coding/constants';
import { useSubmissions } from '@/hooks/useCoding';
import { cn } from '@/lib/utils';

export function CodingSubmissionsPage() {
  const { data, isLoading } = useSubmissions({ limit: 30 });
  const submissions = data?.data?.submissions || [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Submission History</h1>
        <p className="text-muted-foreground">All your code submissions and results</p>
      </div>

      {isLoading ? <Loader className="py-12" /> : (
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Submissions</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {submissions.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-border p-3 text-sm">
                <div>
                  <Link to={`/coding/problems/${s.problem?.slug}`} className="font-medium text-primary hover:underline">
                    {s.problem?.title || 'Unknown'}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {s.language} · {new Date(s.submittedAt).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{s.passedTestCases}/{s.totalTestCases}</Badge>
                  <span className={cn('capitalize', STATUS_COLORS[s.status])}>{s.status?.replace(/_/g, ' ')}</span>
                </div>
              </div>
            ))}
            {!submissions.length && <p className="py-4 text-center text-muted-foreground">No submissions yet</p>}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
