import { useState } from 'react';
import { Link } from 'react-router-dom';

import { ApplicationCard } from '@/components/jobs/ApplicationCard';
import { Pagination } from '@/components/jobs/Pagination';
import { KanbanBoard } from '@/components/tracking/KanbanBoard';
import { TrackingAnalyticsPanel } from '@/components/tracking/TrackingAnalyticsPanel';
import { Loader } from '@/components/common';
import { Button, Select } from '@/components/ui';
import { useMyApplications } from '@/hooks/useJobs';
import { TRACK_STATUS_LABELS, TRACK_STATUSES } from '@/lib/api/tracking';
import { cn } from '@/lib/utils';

const TABS = [
  { id: 'list', label: 'List' },
  { id: 'kanban', label: 'Kanban' },
  { id: 'analytics', label: 'Analytics' },
];

const TRACK_FILTER_OPTIONS = [
  { value: 'all', label: 'All pipeline stages' },
  ...TRACK_STATUSES.map((s) => ({ value: s, label: TRACK_STATUS_LABELS[s] })),
];

export function MyApplicationsPage() {
  const [tab, setTab] = useState('kanban');
  const [trackStatus, setTrackStatus] = useState('all');
  const [page, setPage] = useState(1);
  const { data, isLoading } = useMyApplications({
    trackStatus: trackStatus === 'all' ? undefined : trackStatus,
    page,
    limit: 12,
  });

  const applications = data?.data?.applications || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Application Tracking</h1>
          <p className="mt-1 text-muted-foreground">
            Track pipeline status, timeline, notes, and attachments.
          </p>
        </div>
        <Link to="/jobs">
          <Button variant="outline">Browse jobs</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-border pb-1">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={cn(
              'rounded-t-lg px-4 py-2 text-sm font-medium transition-colors',
              tab === t.id
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'kanban' && <KanbanBoard />}

      {tab === 'analytics' && <TrackingAnalyticsPanel />}

      {tab === 'list' && (
        <>
          <Select
            value={trackStatus}
            onChange={(e) => { setTrackStatus(e.target.value); setPage(1); }}
            options={TRACK_FILTER_OPTIONS}
            className="max-w-xs"
          />

          {isLoading ? (
            <Loader className="py-20" />
          ) : applications.length ? (
            <>
              <div className="space-y-4">
                {applications.map((app) => (
                  <ApplicationCard key={app.id} application={app} />
                ))}
              </div>
              <Pagination pagination={pagination} onPageChange={setPage} />
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-border py-16 text-center">
              <p className="text-muted-foreground">No applications in this stage.</p>
              <Link to="/jobs" className="mt-4 inline-block">
                <Button>Find jobs</Button>
              </Link>
            </div>
          )}
        </>
      )}
    </div>
  );
}
