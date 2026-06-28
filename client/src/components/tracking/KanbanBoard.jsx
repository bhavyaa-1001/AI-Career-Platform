import { Link } from 'react-router-dom';

import { Loader } from '@/components/common';
import { Button, Card, CardContent, CardHeader, CardTitle, Select } from '@/components/ui';
import { useKanbanBoard, useTrackingMutations } from '@/hooks/useApplicationTracking';
import {
  KANBAN_COLUMNS,
  TRACK_STATUS_COLORS,
  TRACK_STATUS_LABELS,
  TRACK_STATUSES,
} from '@/lib/api/tracking';
import { cn } from '@/lib/utils';

import { TrackStatusBadge } from './TrackStatusBadge';

function KanbanCard({ item, column }) {
  const { updateStatus } = useTrackingMutations();

  if (item.type === 'saved') {
    return (
      <Card className="shadow-sm">
        <CardContent className="space-y-2 p-3">
          <p className="text-sm font-medium leading-snug">{item.jobTitle}</p>
          <p className="text-xs text-muted-foreground">{item.companyName}</p>
          <Link to={`/jobs/${item.jobId}`}>
            <Button size="sm" variant="outline" className="w-full">View job</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  const handleStatusChange = (e) => {
    const trackStatus = e.target.value;
    if (trackStatus && trackStatus !== item.trackStatus) {
      updateStatus.mutate({ id: item.id, trackStatus });
    }
  };

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-2 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug">{item.jobTitle}</p>
          <TrackStatusBadge status={item.trackStatus} />
        </div>
        <p className="text-xs text-muted-foreground">{item.companyName}</p>
        {column !== 'saved' && (
          <Select
            value={item.trackStatus}
            onChange={handleStatusChange}
            options={TRACK_STATUSES.map((s) => ({ value: s, label: TRACK_STATUS_LABELS[s] }))}
            className="text-xs"
          />
        )}
        <Link to={`/applications/${item.id}`}>
          <Button size="sm" variant="outline" className="w-full">Open</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function KanbanBoard() {
  const { data, isLoading } = useKanbanBoard();

  if (isLoading) return <Loader className="py-12" />;

  const columns = data?.data?.columns || {};

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex min-w-max gap-4">
        {KANBAN_COLUMNS.map((column) => (
          <div
            key={column}
            className={cn(
              'flex w-72 shrink-0 flex-col rounded-xl border-2',
              TRACK_STATUS_COLORS[column],
            )}
          >
            <CardHeader className="pb-2 pt-4">
              <CardTitle className="flex items-center justify-between text-sm">
                <span>{TRACK_STATUS_LABELS[column]}</span>
                <span className="text-muted-foreground">{(columns[column] || []).length}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-2 pb-4">
              {(columns[column] || []).length ? (
                columns[column].map((item) => (
                  <KanbanCard
                    key={item.type === 'saved' ? item.id : item.id}
                    item={item}
                    column={column}
                  />
                ))
              ) : (
                <p className="py-6 text-center text-xs text-muted-foreground">Empty</p>
              )}
            </CardContent>
          </div>
        ))}
      </div>
    </div>
  );
}
