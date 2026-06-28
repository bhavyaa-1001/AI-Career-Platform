import { Link, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';

import { ScoreGauge } from '@/components/analysis/ScoreGauge';
import { ApplicantResumeViewer } from '@/components/recruiter/ApplicantResumeViewer';
import { StatusBadge } from '@/components/recruiter/CandidateRankBadge';
import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Select, Textarea } from '@/components/ui';
import { useApplication, useRecruiterMutations } from '@/hooks/useRecruiter';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

export function ApplicantDetailPage() {
  const { id } = useParams();
  const { data, isLoading, refetch } = useApplication(id);
  const { updateApplication, rankApplication } = useRecruiterMutations();
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('pending');
  const [message, setMessage] = useState('');

  const application = data?.data?.application;
  const resume = data?.data?.resume;

  useEffect(() => {
    if (application) {
      setNotes(application.notes || '');
      setStatus(application.status);
    }
  }, [application]);

  if (isLoading) return <Loader className="py-20" />;
  if (!application) return <p className="text-destructive">Application not found.</p>;

  const handleSave = async () => {
    await updateApplication.mutateAsync({ id, status, notes });
    setMessage('Application updated.');
    setTimeout(() => setMessage(''), 2000);
  };

  const handleRank = async () => {
    await rankApplication.mutateAsync(id);
    refetch();
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{application.applicantName || 'Candidate'}</h1>
          <p className="mt-1 text-muted-foreground">
            Applied for {application.jobTitle} at {application.companyName}
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            <StatusBadge status={application.status} />
            {application.rankingScore != null && (
              <Badge variant="outline">{application.rankingScore}% match</Badge>
            )}
          </div>
        </div>
        <Link to={`/recruiter/jobs/${application.jobId}/applicants`}>
          <Button variant="outline">Back to Applicants</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <Card>
            <CardHeader><CardTitle className="text-base">Candidate Ranking</CardTitle></CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <ScoreGauge
                score={application.rankingScore ?? 0}
                label="Match Score"
                size="lg"
              />
              {application.rankingSummary && (
                <p className="text-center text-sm text-muted-foreground">{application.rankingSummary}</p>
              )}
              <Button onClick={handleRank} disabled={rankApplication.isPending} className="w-full">
                {rankApplication.isPending ? 'Ranking…' : application.rankingScore != null ? 'Re-rank' : 'Rank Candidate'}
              </Button>
              {application.rankingStrengths?.length > 0 && (
                <div className="w-full">
                  <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Strengths</p>
                  <ul className="space-y-1 text-sm">
                    {application.rankingStrengths.map((s) => <li key={s}>• {s}</li>)}
                  </ul>
                </div>
              )}
              {application.rankingGaps?.length > 0 && (
                <div className="w-full">
                  <p className="mb-2 text-xs font-medium uppercase text-muted-foreground">Gaps</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {application.rankingGaps.map((g) => <li key={g}>• {g}</li>)}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Review</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Status</label>
                <Select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  options={STATUS_OPTIONS}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Notes</label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  placeholder="Internal notes…"
                />
              </div>
              <Button onClick={handleSave} disabled={updateApplication.isPending} className="w-full">
                Save Review
              </Button>
              {message && <p className="text-sm text-emerald-600">{message}</p>}
            </CardContent>
          </Card>

          {application.coverLetter && (
            <Card>
              <CardHeader><CardTitle className="text-base">Cover Letter</CardTitle></CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{application.coverLetter}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="lg:col-span-2">
          <ApplicantResumeViewer resume={resume} />
        </div>
      </div>
    </div>
  );
}
