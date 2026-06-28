import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';

import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Input, Select, Textarea } from '@/components/ui';
import { useCoverLetter, useCoverLetterMutations, useCoverLetters } from '@/hooks/useCoverLetter';
import { coverLetterApi, triggerBlobDownload } from '@/lib/api/coverLetter';
import { useResumes } from '@/hooks/useResume';

const TONE_OPTIONS = [
  { value: 'professional', label: 'Professional' },
  { value: 'confident', label: 'Confident' },
  { value: 'friendly', label: 'Friendly' },
  { value: 'formal', label: 'Formal' },
  { value: 'enthusiastic', label: 'Enthusiastic' },
];

const LENGTH_OPTIONS = [
  { value: 'short', label: 'Short (~150 words)' },
  { value: 'medium', label: 'Medium (~250 words)' },
  { value: 'long', label: 'Long (~400 words)' },
];

export function CoverLetterPage() {
  const { id: routeId } = useParams();
  const navigate = useNavigate();
  const { data: resumesData } = useResumes();
  const { data: historyData } = useCoverLetters();
  const { data: letterData, isLoading: letterLoading } = useCoverLetter(routeId);
  const { generate, update, remove } = useCoverLetterMutations();

  const [resumeId, setResumeId] = useState('');
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [body, setBody] = useState('');
  const [activeId, setActiveId] = useState(routeId || null);
  const [error, setError] = useState(null);
  const [copyStatus, setCopyStatus] = useState('');
  const [pdfLoading, setPdfLoading] = useState(false);
  const saveTimer = useRef(null);

  const resumes = resumesData?.data?.resumes || [];
  const history = historyData?.data?.coverLetters || [];

  useEffect(() => {
    if (letterData?.data?.coverLetter) {
      const cl = letterData.data.coverLetter;
      setBody(cl.body);
      setCompany(cl.company);
      setRole(cl.role);
      setJobDescription(cl.jobDescription || '');
      setTone(cl.tone);
      setLength(cl.length);
      setResumeId(cl.resumeId || '');
      setActiveId(cl.id);
    }
  }, [letterData]);

  useEffect(() => {
    if (!routeId && resumes.length && !resumeId) {
      setResumeId(resumes[0].id);
    }
  }, [resumes, routeId, resumeId]);

  const scheduleSave = useCallback((letterId, text) => {
    if (!letterId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      try {
        await update.mutateAsync({ id: letterId, body: text });
      } catch {
        /* silent autosave */
      }
    }, 1500);
  }, [update]);

  const handleBodyChange = (text) => {
    setBody(text);
    if (activeId) scheduleSave(activeId, text);
  };

  const handleGenerate = async (regenerate = false) => {
    setError(null);
    setCopyStatus('');
    if (!resumeId || !company.trim() || !role.trim() || jobDescription.trim().length < 20) {
      setError('Select a resume and fill in company, role, and job description (min 20 chars).');
      return;
    }
    try {
      const res = await generate.mutateAsync({
        resumeId,
        company: company.trim(),
        role: role.trim(),
        jobDescription: jobDescription.trim(),
        tone,
        length,
      });
      const cl = res.data.coverLetter;
      setBody(cl.body);
      setActiveId(cl.id);
      navigate(`/cover-letters/${cl.id}`, { replace: !regenerate });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCopy = async () => {
    if (!body) return;
    try {
      await navigator.clipboard.writeText(body);
      setCopyStatus('Copied!');
      setTimeout(() => setCopyStatus(''), 2000);
    } catch {
      setCopyStatus('Copy failed');
    }
  };

  const handleDownloadPdf = async () => {
    if (!activeId) return;
    setPdfLoading(true);
    setError(null);
    try {
      const result = await coverLetterApi.downloadPdf(activeId);
      triggerBlobDownload(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSelectHistory = (cl) => {
    navigate(`/cover-letters/${cl.id}`);
  };

  const handleDelete = async (letterId) => {
    if (!window.confirm('Delete this cover letter?')) return;
    await remove.mutateAsync(letterId);
    if (activeId === letterId) {
      setActiveId(null);
      setBody('');
      navigate('/cover-letters');
    }
  };

  if (routeId && letterLoading) return <Loader className="py-20" />;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Cover Letter</h1>
        <p className="mt-1 text-muted-foreground">
          Generate tailored cover letters from your resume and job description.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-1">
          <Card>
            <CardHeader><CardTitle className="text-base">Inputs</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Resume</label>
                <Select
                  value={resumeId}
                  onChange={(e) => setResumeId(e.target.value)}
                  options={[{ value: '', label: 'Select resume…' }, ...resumes.map((r) => ({ value: r.id, label: r.title }))]}
                />
                {resumes.length === 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    <Link to="/resumes" className="text-primary hover:underline">Create a resume</Link> first.
                  </p>
                )}
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Company</label>
                <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Acme Corp" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Role</label>
                <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Senior Software Engineer" />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Tone</label>
                <Select value={tone} onChange={(e) => setTone(e.target.value)} options={TONE_OPTIONS} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Length</label>
                <Select value={length} onChange={(e) => setLength(e.target.value)} options={LENGTH_OPTIONS} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Job Description</label>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description here…"
                  rows={8}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={() => handleGenerate(false)} disabled={generate.isPending}>
                  {generate.isPending ? 'Generating…' : 'Generate'}
                </Button>
                {activeId && (
                  <Button type="button" variant="outline" onClick={() => handleGenerate(true)} disabled={generate.isPending}>
                    Regenerate
                  </Button>
                )}
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">History</CardTitle></CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">No cover letters yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {history.map((cl) => (
                    <li key={cl.id} className="flex items-start justify-between gap-2 py-3">
                      <button
                        type="button"
                        onClick={() => handleSelectHistory(cl)}
                        className="min-w-0 flex-1 text-left hover:text-primary"
                      >
                        <p className="truncate text-sm font-medium">{cl.role} @ {cl.company}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(cl.createdAt).toLocaleDateString()} · {cl.wordCount} words
                        </p>
                      </button>
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleDelete(cl.id)}>×</Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <CardTitle className="text-base">
                  {body ? 'Cover Letter' : 'Output'}
                  {activeId && update.isPending && (
                    <Badge variant="outline" className="ml-2">Saving…</Badge>
                  )}
                </CardTitle>
                {body && (
                  <div className="flex flex-wrap gap-2">
                    <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
                      {copyStatus || 'Copy'}
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={handleDownloadPdf} disabled={pdfLoading || !activeId}>
                      {pdfLoading ? 'Preparing…' : 'Download PDF'}
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {body ? (
                <Textarea
                  value={body}
                  onChange={(e) => handleBodyChange(e.target.value)}
                  rows={22}
                  className="min-h-[480px] font-serif text-base leading-relaxed"
                />
              ) : (
                <div className="flex min-h-[480px] items-center justify-center rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground">
                  <p>Fill in the form and click Generate to create your cover letter.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
