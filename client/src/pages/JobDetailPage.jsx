import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { ApplyPanel } from '@/components/jobs/ApplyPanel';
import { StatusBadge } from '@/components/recruiter/CandidateRankBadge';
import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useJob, useJobMutations } from '@/hooks/useJobs';

const formatSalary = (job) => {
  if (job.salaryMin && job.salaryMax) {
    return `${job.salaryCurrency || 'USD'} ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}`;
  }
  if (job.salaryMin) return `From ${job.salaryCurrency || 'USD'} ${job.salaryMin.toLocaleString()}`;
  return null;
};

export function JobDetailPage() {
  const { id } = useParams();
  const { data, isLoading, refetch } = useJob(id);
  const { apply, toggleBookmark, isApplying, isBookmarkLoading } = useJobMutations();
  const [message, setMessage] = useState(null);

  if (isLoading) return <Loader className="py-20" />;

  const job = data?.data?.job;
  if (!job) return <p className="text-destructive">Job not found.</p>;

  const salary = formatSalary(job);

  const handleApply = async (payload) => {
    setMessage(null);
    try {
      await apply.mutateAsync({ jobId: job.id, ...payload });
      setMessage({ type: 'success', text: 'Application submitted successfully!' });
      refetch();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/jobs">
        <Button variant="ghost" size="sm">← Back to jobs</Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <CardTitle className="text-2xl">{job.title}</CardTitle>
              <p className="mt-2 text-muted-foreground">
                {job.companyName} · {job.location || 'Remote'} · <span className="capitalize">{job.employmentType}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {salary && <Badge variant="outline">{salary}</Badge>}
                <Badge variant="outline">{job.applicantCount} applicants</Badge>
                {job.hasApplied && job.applicationStatus && (
                  <StatusBadge status={job.applicationStatus} />
                )}
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              disabled={isBookmarkLoading}
              onClick={() => toggleBookmark(job)}
            >
              {job.isBookmarked ? '★ Saved' : '☆ Save job'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {job.skills?.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {job.skills.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
            </div>
          )}

          <section>
            <h2 className="mb-2 font-semibold">Description</h2>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{job.description}</p>
          </section>

          {job.requirements && (
            <section>
              <h2 className="mb-2 font-semibold">Requirements</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{job.requirements}</p>
            </section>
          )}

          {job.responsibilities && (
            <section>
              <h2 className="mb-2 font-semibold">Responsibilities</h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">{job.responsibilities}</p>
            </section>
          )}

          {message && (
            <p className={`text-sm ${message.type === 'error' ? 'text-destructive' : 'text-emerald-600'}`}>
              {message.text}
            </p>
          )}

          <ApplyPanel job={job} onApply={handleApply} loading={isApplying} />
        </CardContent>
      </Card>
    </div>
  );
}
