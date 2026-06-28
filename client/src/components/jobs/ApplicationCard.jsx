import { Link } from 'react-router-dom';

import { TrackStatusBadge } from '@/components/tracking/TrackStatusBadge';
import { Badge, Button, Card, CardContent } from '@/components/ui';
import { TRACK_STATUSES, TRACK_STATUS_LABELS } from '@/lib/api/tracking';

export function ApplicationCard({ application }) {
  const trackStatus = application.trackStatus || 'applied';
  const isTerminal = ['rejected', 'withdrawn'].includes(trackStatus);
  const currentIndex = TRACK_STATUSES.indexOf(trackStatus);

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">{application.jobTitle}</h3>
            <p className="text-sm text-muted-foreground">{application.companyName}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Applied {new Date(application.createdAt).toLocaleDateString()}
            </p>
          </div>
          <TrackStatusBadge status={trackStatus} />
        </div>

        {!isTerminal && (
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {TRACK_STATUSES.filter((s) => !['rejected', 'withdrawn'].includes(s)).map((step, i) => (
              <div key={step} className="flex items-center gap-1">
                <div
                  className={`flex h-6 shrink-0 items-center justify-center rounded-full px-2 text-[10px] font-medium ${
                    currentIndex >= TRACK_STATUSES.indexOf(step)
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {TRACK_STATUS_LABELS[step]}
                </div>
                {i < 3 && <div className="h-px w-3 bg-border" />}
              </div>
            ))}
          </div>
        )}

        {isTerminal && (
          <Badge variant="destructive">{TRACK_STATUS_LABELS[trackStatus]}</Badge>
        )}

        {application.rankingScore != null && (
          <p className="text-sm text-muted-foreground">Match score: {application.rankingScore}%</p>
        )}

        <Link to={`/applications/${application.id}`}>
          <Button variant="outline" size="sm">Track application</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
