import { Link } from 'react-router-dom';

import { Button, Select, Textarea } from '@/components/ui';
import { useResumes } from '@/hooks/useResume';

export function ApplyPanel({ job, onApply, loading, onCancel }) {
  const { data: resumesData } = useResumes();
  const resumes = resumesData?.data?.resumes || [];

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const resumeId = form.resumeId.value;
    const coverLetter = form.coverLetter.value;
    onApply({ resumeId, coverLetter });
  };

  if (job.hasApplied) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm">
        <p className="font-medium">You already applied to this job.</p>
        {job.applicationId && (
          <Link to={`/applications/${job.applicationId}`} className="mt-2 inline-block">
            <Button size="sm" variant="outline">Track application</Button>
          </Link>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border p-4">
      <h3 className="font-semibold">Apply for this role</h3>
      <div>
        <label className="mb-1 block text-sm font-medium">Resume</label>
        <Select
          name="resumeId"
          required
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
      <div>
        <label className="mb-1 block text-sm font-medium">Cover letter (optional)</label>
        <Textarea name="coverLetter" rows={4} placeholder="Why you're a great fit…" />
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={loading || resumes.length === 0}>
          {loading ? 'Submitting…' : 'Submit application'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        )}
      </div>
    </form>
  );
}
