import { Link, useParams } from 'react-router-dom';

import { AnalysisResults } from '@/components/analysis/AnalysisResults';
import { Loader } from '@/components/common';
import { Badge, Button } from '@/components/ui';
import { useAnalysis } from '@/hooks/useResumeAnalysis';

export function AnalysisDetailPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useAnalysis(id);

  if (isLoading) return <Loader className="py-20" />;

  if (error || !data?.data?.analysis) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Analysis not found.</p>
        <Link to="/analytics"><Button className="mt-4">Back to Analytics</Button></Link>
      </div>
    );
  }

  const analysis = data.data.analysis;
  const title = analysis.resumeTitle || analysis.sourceFileName || 'Resume Analysis';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <Link to="/analytics" className="text-sm text-muted-foreground hover:text-foreground">← Analytics</Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          <Badge variant="outline" className="capitalize">{analysis.sourceType}</Badge>
          {analysis.targetRole && <Badge variant="secondary">{analysis.targetRole}</Badge>}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Analyzed on {new Date(analysis.createdAt).toLocaleString()}
          {analysis.durationMs ? ` · ${(analysis.durationMs / 1000).toFixed(1)}s` : ''}
        </p>
      </div>

      <AnalysisResults analysis={analysis} />
    </div>
  );
}
