import { Badge } from '@/components/ui';
import { STATUS_COLORS } from '@/features/coding/constants';
import { cn } from '@/lib/utils';

export function TestResultsPanel({ submission }) {
  if (!submission) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-sm text-muted-foreground">
        Run or submit code to see results
      </div>
    );
  }

  return (
    <div className="space-y-3 overflow-y-auto p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn('text-sm font-semibold capitalize', STATUS_COLORS[submission.status])}>
          {submission.status?.replace(/_/g, ' ')}
        </span>
        <Badge variant="outline">
          {submission.passedTestCases}/{submission.totalTestCases} passed
        </Badge>
        {submission.executionTimeMs > 0 && (
          <Badge variant="secondary">{submission.executionTimeMs} ms</Badge>
        )}
        {submission.memoryKb > 0 && (
          <Badge variant="secondary">{submission.memoryKb} KB</Badge>
        )}
      </div>

      {submission.compileOutput && (
        <div>
          <p className="mb-1 text-xs font-medium text-destructive">Compilation Error</p>
          <pre className="max-h-32 overflow-auto rounded bg-destructive/10 p-2 text-xs">{submission.compileOutput}</pre>
        </div>
      )}

      {submission.runtimeError && submission.status !== 'accepted' && (
        <div>
          <p className="mb-1 text-xs font-medium text-destructive">Runtime Error</p>
          <pre className="max-h-32 overflow-auto rounded bg-destructive/10 p-2 text-xs">{submission.runtimeError}</pre>
        </div>
      )}

      {submission.testResults?.map((tr) => (
        <div key={tr.index} className={cn('rounded border p-2 text-xs', tr.passed ? 'border-green-500/30' : 'border-red-500/30')}>
          <p className="font-medium">Test Case {tr.index + 1} — {tr.passed ? 'Passed' : 'Failed'}</p>
          {!tr.passed && tr.actualOutput && (
            <>
              <p className="mt-1 text-muted-foreground">Expected: {tr.expectedOutput}</p>
              <p className="text-muted-foreground">Got: {tr.actualOutput}</p>
            </>
          )}
          {tr.error && <p className="mt-1 text-destructive">{tr.error}</p>}
        </div>
      ))}
    </div>
  );
}
