import { TrackStatusBadge } from './TrackStatusBadge';

export function ApplicationTimeline({ timeline = [] }) {
  if (!timeline.length) {
    return <p className="text-sm text-muted-foreground">No timeline events yet.</p>;
  }

  const sorted = [...timeline].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  return (
    <ol className="relative space-y-0 border-l border-border pl-6">
      {sorted.map((event) => (
        <li key={event.id} className="relative pb-6 last:pb-0">
          <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-primary bg-background" />
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-medium">{event.title}</p>
              <TrackStatusBadge status={event.status} />
            </div>
            {event.note && (
              <p className="text-sm text-muted-foreground">{event.note}</p>
            )}
            <p className="text-xs text-muted-foreground">
              {new Date(event.createdAt).toLocaleString()}
            </p>
          </div>
        </li>
      ))}
    </ol>
  );
}
