import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { MatchDashboardPanel } from '@/components/match/MatchDashboardPanel';
import { MatchResults } from '@/components/match/MatchResults';
import { Loader } from '@/components/common';
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Textarea } from '@/components/ui';
import { useMatchStatus, useResumeMatchMutations } from '@/hooks/useResumeMatch';
import { useResumes } from '@/hooks/useResume';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'compare', label: 'Compare' },
  { id: 'dashboard', label: 'Dashboard' },
];

export function ResumeMatchPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('compare');
  const [resumeId, setResumeId] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const { data: statusData } = useMatchStatus();
  const { data: resumesData } = useResumes();
  const { generate } = useResumeMatchMutations();

  const resumes = resumesData?.data?.resumes || [];
  const configured = statusData?.data?.configured ?? true;

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError(null);
    if (!resumeId || jobDescription.trim().length < 30) {
      setError('Select a resume and paste a job description (min 30 characters).');
      return;
    }
    try {
      const res = await generate.mutateAsync({
        resumeId,
        jobTitle: jobTitle.trim(),
        companyName: companyName.trim(),
        jobDescription: jobDescription.trim(),
      });
      setResult(res.data.match);
      navigate(`/match/${res.data.match.id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resume vs Job Match</h1>
        <p className="mt-1 text-muted-foreground">
          Compare your resume against a job description — get match %, skill gaps, and learning paths.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-t-lg px-4 py-2 text-sm font-medium transition-colors',
              tab === t.id ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard' && <MatchDashboardPanel />}

      {tab === 'compare' && (
        <>
          {!configured && (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardContent className="py-4 text-sm text-amber-700 dark:text-amber-400">
                Set <code className="rounded bg-muted px-1">GEMINI_API_KEY</code> on the server to enable AI matching.
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader><CardTitle className="text-base">Compare Resume with Job Description</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleGenerate} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-medium">Resume</label>
                  <Select
                    value={resumeId}
                    onChange={(e) => setResumeId(e.target.value)}
                    options={[
                      { value: '', label: 'Select resume…' },
                      ...resumes.map((r) => ({ value: r.id, label: r.title })),
                    ]}
                  />
                  {resumes.length === 0 && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      <Link to="/resumes" className="text-primary hover:underline">Create a resume</Link> first.
                    </p>
                  )}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Job Title</label>
                    <Input value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Senior Developer" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Company</label>
                    <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Acme Corp" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Job Description</label>
                  <Textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here…"
                    rows={10}
                    required
                  />
                </div>
                <Button type="submit" disabled={generate.isPending}>
                  {generate.isPending ? 'Analyzing match…' : 'Generate Match Report'}
                </Button>
                {error && <p className="text-sm text-destructive">{error}</p>}
              </form>
            </CardContent>
          </Card>

          {generate.isPending && <Loader className="py-8" />}

          {result && !generate.isPending && (
            <div className="space-y-4">
              <MatchResults match={result} />
              <Link to={`/match/${result.id}`}>
                <Button>View saved report</Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
