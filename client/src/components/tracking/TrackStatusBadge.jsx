import { Badge } from '@/components/ui';
import { TRACK_STATUS_LABELS } from '@/lib/api/tracking';
import { cn } from '@/lib/utils';

const variantMap = {
  saved: 'outline',
  applied: 'default',
  assessment: 'default',
  interview: 'warning',
  offer: 'success',
  rejected: 'destructive',
  withdrawn: 'outline',
};

export function TrackStatusBadge({ status, className }) {
  const label = TRACK_STATUS_LABELS[status] || status;
  return (
    <Badge variant={variantMap[status] || 'outline'} className={cn('capitalize', className)}>
      {label}
    </Badge>
  );
}
