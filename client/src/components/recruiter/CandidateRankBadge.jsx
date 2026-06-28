import { Badge } from '@/components/ui';
import { cn } from '@/lib/utils';

const scoreVariant = (score) => {
  if (score == null) return 'outline';
  if (score >= 85) return 'success';
  if (score >= 70) return 'default';
  if (score >= 50) return 'warning';
  return 'destructive';
};

export function CandidateRankBadge({ score, className }) {
  if (score == null) {
    return <Badge variant="outline" className={className}>Unranked</Badge>;
  }
  return (
    <Badge variant={scoreVariant(score)} className={cn('tabular-nums', className)}>
      {score}%
    </Badge>
  );
}

export const statusBadgeVariant = (status) => {
  switch (status) {
    case 'shortlisted': return 'default';
    case 'accepted': return 'default';
    case 'rejected': return 'destructive';
    case 'open': return 'default';
    case 'closed': return 'outline';
    case 'draft': return 'outline';
    default: return 'outline';
  }
};

export function StatusBadge({ status, className }) {
  return (
    <Badge variant={statusBadgeVariant(status)} className={cn('capitalize', className)}>
      {status}
    </Badge>
  );
}
