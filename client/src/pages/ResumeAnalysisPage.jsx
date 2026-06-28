import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { AnalysisResults } from '@/components/analysis/AnalysisResults';
import { ResumeUploadZone } from '@/components/resume/ResumeUploadZone';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Textarea } from '@/components/ui';
import { useAnalysisMutations, useAnalysisStatus } from '@/hooks/useResumeAnalysis';

export function ResumeAnalysisPage() {
  const navigate = useNavigate();
  const { data: statusData } = useAnalysisStatus();
  const { uploadAndAnalyze } = useAnalysisMutations();

  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [targetRole, setTargetRole] = useState('');
  const [targetJobDescription, setTargetJobDescription] = useState('');

  const configured = statusData?.data?.configured ?? true;

  const handleUpload = async (file, clientError) => {
    if (clientError) {
      setError(clientError);
      return;
    }
    if (!file) return;

    setError(null);
    setAnalysis(null);
    try {
      const res = await uploadAndAnalyze.mutateAsync({
        file,
        targetRole: targetRole.trim() || undefined,
        targetJobDescription: targetJobDescription.trim() || undefined,
      });
      const result = res.data.analysis;
      setAnalysis(result);
      navigate(`/analytics/${result.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleViewAnalytics = () => navigate('/analytics');

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link to="/analytics" className="text-sm text-muted-foreground hover:text-foreground">← Analytics</Link>
          <h1 className="mt-2 text-2xl font-bold tracking-tight">AI Resume Analysis</h1>
          <p className="mt-1 text-muted-foreground">
            Upload a resume to get ATS score, grammar feedback, keyword suggestions, and improvement tips powered by Gemini.
          </p>
        </div>
        <Button type="button" variant="outline" onClick={handleViewAnalytics}>View Analytics</Button>
      </div>

      {!configured && (
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="py-4 text-sm text-amber-700 dark:text-amber-400">
            Gemini AI is not configured on the server. Add <code className="rounded bg-muted px-1">GEMINI_API_KEY</code> to your server environment.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Target Role (optional)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="e.g. Senior Software Engineer"
          />
          <Textarea
            value={targetJobDescription}
            onChange={(e) => setTargetJobDescription(e.target.value)}
            placeholder="Paste a job description for better keyword matching..."
            rows={4}
          />
        </CardContent>
      </Card>

      {!analysis && (
        <>
          <ResumeUploadZone
            onUpload={handleUpload}
            loading={uploadAndAnalyze.isPending}
            loadingText="Analyzing with Gemini AI..."
            error={error}
          />
          {error && !uploadAndAnalyze.isPending && (
            <Card className="border-destructive/30">
              <CardContent className="py-4 text-sm text-destructive">{error}</CardContent>
            </Card>
          )}
        </>
      )}

      {analysis && (
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => { setAnalysis(null); setError(null); }}>
              Analyze Another
            </Button>
            <Button type="button" onClick={() => navigate(`/analytics/${analysis.id}`)}>View Full Report</Button>
          </div>
          <AnalysisResults analysis={analysis} />
        </div>
      )}
    </div>
  );
}
