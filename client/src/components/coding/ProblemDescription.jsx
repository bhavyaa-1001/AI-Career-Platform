import { Badge } from '@/components/ui';
import { DIFFICULTY_COLORS } from '@/features/coding/constants';
import { cn } from '@/lib/utils';

export function ProblemDescription({ problem, userState, onBookmark, onFavorite }) {
  if (!problem) return null;

  return (
    <div className="space-y-4 overflow-y-auto p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 className="text-lg font-semibold">{problem.title}</h2>
        <div className="flex gap-2">
          <Badge className={cn('capitalize', DIFFICULTY_COLORS[problem.difficulty])}>
            {problem.difficulty}
          </Badge>
          <Badge variant="outline">{problem.points} pts</Badge>
          {userState?.status === 'solved' && <Badge variant="success">Solved</Badge>}
        </div>
      </div>

      <div className="flex gap-2">
        <button type="button" onClick={onBookmark} className="text-xs text-primary hover:underline">
          {userState?.isBookmarked ? '★ Bookmarked' : '☆ Bookmark'}
        </button>
        <button type="button" onClick={onFavorite} className="text-xs text-primary hover:underline">
          {userState?.isFavorite ? '♥ Favorite' : '♡ Favorite'}
        </button>
      </div>

      <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
        {problem.description}
      </div>

      {problem.constraints && (
        <div>
          <h3 className="mb-1 text-sm font-medium">Constraints</h3>
          <pre className="whitespace-pre-wrap rounded bg-muted p-3 text-xs">{problem.constraints}</pre>
        </div>
      )}

      {(problem.inputFormat || problem.outputFormat) && (
        <div className="grid gap-3 sm:grid-cols-2">
          {problem.inputFormat && (
            <div>
              <h3 className="mb-1 text-sm font-medium">Input Format</h3>
              <pre className="whitespace-pre-wrap rounded bg-muted p-3 text-xs">{problem.inputFormat}</pre>
            </div>
          )}
          {problem.outputFormat && (
            <div>
              <h3 className="mb-1 text-sm font-medium">Output Format</h3>
              <pre className="whitespace-pre-wrap rounded bg-muted p-3 text-xs">{problem.outputFormat}</pre>
            </div>
          )}
        </div>
      )}

      {problem.sampleTestCases?.length > 0 && (
        <div>
          <h3 className="mb-2 text-sm font-medium">Sample Test Cases</h3>
          <div className="space-y-3">
            {problem.sampleTestCases.map((tc, i) => (
              <div key={i} className="rounded border border-border p-3 text-xs">
                <p><span className="font-medium">Input:</span></p>
                <pre className="mt-1 whitespace-pre-wrap rounded bg-muted p-2">{tc.input}</pre>
                <p className="mt-2 font-medium">Output:</p>
                <pre className="mt-1 whitespace-pre-wrap rounded bg-muted p-2">{tc.output}</pre>
                {tc.explanation && (
                  <p className="mt-2 text-muted-foreground">{tc.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {problem.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {problem.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
          ))}
        </div>
      )}
    </div>
  );
}
