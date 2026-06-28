import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';

import { ApplicationTimeline } from '@/components/tracking/ApplicationTimeline';
import { AttachmentsPanel } from '@/components/tracking/AttachmentsPanel';
import { NotesPanel } from '@/components/tracking/NotesPanel';
import { TrackStatusBadge } from '@/components/tracking/TrackStatusBadge';
import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Textarea } from '@/components/ui';
import { useTrackingDetail, useTrackingMutations } from '@/hooks/useApplicationTracking';
import { TRACK_STATUS_LABELS, TRACK_STATUSES } from '@/lib/api/tracking';

export function ApplicationDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useTrackingDetail(id);
  const { updateStatus } = useTrackingMutations();
  const [statusNote, setStatusNote] = useState('');

  if (isLoading) return <Loader className="py-20" />;

  const application = data?.data?.application;
  const job = data?.data?.job;

  if (!application) return <p className="text-destructive">Application not found.</p>;

  const handleStatusChange = async (trackStatus) => {
    await updateStatus.mutateAsync({
      id: application.id,
      trackStatus,
      note: statusNote || undefined,
    });
    setStatusNote('');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link to="/applications">
        <Button variant="ghost" size="sm">← Back to tracking</Button>
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>{application.jobTitle}</CardTitle>
              <p className="mt-1 text-muted-foreground">{application.companyName}</p>
            </div>
            <TrackStatusBadge status={application.trackStatus} />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3 text-sm">
            <div>
              <p className="text-muted-foreground">Applied</p>
              <p className="font-medium">{new Date(application.createdAt).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last updated</p>
              <p className="font-medium">{new Date(application.updatedAt).toLocaleDateString()}</p>
            </div>
            {application.rankingScore != null && (
              <div>
                <p className="text-muted-foreground">Match score</p>
                <Badge>{application.rankingScore}%</Badge>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-border p-4 space-y-3">
            <p className="text-sm font-medium">Update pipeline status</p>
            <Textarea
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              placeholder="Optional note for timeline…"
              rows={2}
            />
            <div className="flex flex-wrap gap-2">
              {TRACK_STATUSES.map((s) => (
                <Button
                  key={s}
                  type="button"
                  size="sm"
                  variant={application.trackStatus === s ? 'default' : 'outline'}
                  disabled={updateStatus.isPending}
                  onClick={() => handleStatusChange(s)}
                >
                  {TRACK_STATUS_LABELS[s]}
                </Button>
              ))}
            </div>
          </div>

          {job && (
            <Link to={`/jobs/${job.id}`}>
              <Button variant="outline" size="sm">View job posting</Button>
            </Link>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Timeline</CardTitle></CardHeader>
          <CardContent>
            <ApplicationTimeline timeline={application.timeline} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Notes</CardTitle></CardHeader>
          <CardContent>
            <NotesPanel applicationId={application.id} notes={application.studentNotes} />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Attachments</CardTitle></CardHeader>
        <CardContent>
          <AttachmentsPanel applicationId={application.id} attachments={application.attachments} />
        </CardContent>
      </Card>
    </div>
  );
}
