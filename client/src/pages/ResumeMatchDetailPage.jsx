import { Link, useNavigate, useParams } from 'react-router-dom';

import { MatchResults } from '@/components/match/MatchResults';
import { Loader } from '@/components/common';
import { Button } from '@/components/ui';
import { useResumeMatch, useResumeMatchMutations } from '@/hooks/useResumeMatch';

export function ResumeMatchDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data, isLoading } = useResumeMatch(id);
  const { remove } = useResumeMatchMutations();

  if (isLoading) return <Loader className="py-20" />;

  const match = data?.data?.match;
  if (!match) return <p className="text-destructive">Match report not found.</p>;

  const handleDelete = async () => {
    if (!window.confirm('Delete this comparison?')) return;
    await remove.mutateAsync(match.id);
    navigate('/match');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/match">
          <Button variant="ghost" size="sm">← Back to Compare</Button>
        </Link>
        <Button variant="outline" size="sm" onClick={handleDelete}>Delete</Button>
      </div>

      <MatchResults match={match} />

      <p className="text-xs text-muted-foreground">
        Generated {new Date(match.createdAt).toLocaleString()}
        {match.model && ` · ${match.model}`}
      </p>
    </div>
  );
}
