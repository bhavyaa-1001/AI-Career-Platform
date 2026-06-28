import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { cn } from '@/lib/utils';

const ACTION_ICONS = {
  profile_update: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z',
  profile_draft: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  profile_publish: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
  avatar_upload: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z',
  login: 'M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1',
  register: 'M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z',
};

function formatTime(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return new Date(date).toLocaleDateString();
}

export function RecentActivity({ activities = [] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recent activity yet.</p>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity) => (
              <li key={activity.id} className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <svg className="h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={ACTION_ICONS[activity.action] || ACTION_ICONS.profile_update} />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <p className="text-xs text-muted-foreground">{formatTime(activity.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

export function ProfileCompletionCard({ completion }) {
  if (!completion) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Completion</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex items-center gap-4">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15.5" fill="none" className="stroke-muted" strokeWidth="3" />
              <circle
                cx="18"
                cy="18"
                r="15.5"
                fill="none"
                className="stroke-primary"
                strokeWidth="3"
                strokeDasharray={`${completion.percentage} 100`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute text-lg font-bold">{completion.percentage}%</span>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              {completion.completedCount} of {completion.totalCount} sections complete
            </p>
          </div>
        </div>
        <ul className="space-y-2">
          {completion.checks?.map((check) => (
            <li key={check.key} className="flex items-center gap-2 text-sm">
              <span
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-full text-[10px]',
                  check.done ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground',
                )}
              >
                {check.done ? '✓' : '·'}
              </span>
              <span className={check.done ? 'text-foreground' : 'text-muted-foreground'}>{check.label}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
