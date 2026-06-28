import { Link, useParams } from 'react-router-dom';

import { ContestTimer, LeaderboardTable } from '@/components/coding/CodingWidgets';
import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { codingApi } from '@/lib/api/coding';
import { useContest, useCodingMutations } from '@/hooks/useCoding';
import { useQuery } from '@tanstack/react-query';

export function ContestDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useContest(id);
  const { joinContest } = useCodingMutations();

  const { data: lbData } = useQuery({
    queryKey: ['coding', 'contest-lb', id],
    queryFn: () => codingApi.contestLeaderboard(id),
    enabled: Boolean(id),
  });

  if (isLoading) return <Loader className="py-20" />;

  const contest = data?.data?.contest;
  if (!contest) return <p className="text-destructive">Contest not found</p>;

  const isRunning = contest.status === 'running';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to="/coding/contests"><Button variant="ghost" size="sm">← Contests</Button></Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{contest.title}</h1>
          <div className="mt-2 flex gap-2">
            <Badge variant="outline" className="capitalize">{contest.status}</Badge>
            {contest.isVirtual && <Badge variant="secondary">Virtual</Badge>}
            <span className="text-sm text-muted-foreground">{contest.participantCount} participants</span>
          </div>
        </div>
        {isRunning && <ContestTimer endTime={contest.endTime} />}
      </div>

      <p className="text-sm text-muted-foreground">{contest.description}</p>

      <div className="flex gap-2">
        <Button onClick={() => joinContest.mutate(id)}>Join Contest</Button>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Problems</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {contest.problems?.map((p) => (
            <Link key={p.id} to={`/coding/problems/${p.slug}`} className="block rounded border border-border p-3 text-sm hover:border-primary/40">
              {p.title} <Badge className="ml-2 capitalize">{p.difficulty}</Badge>
            </Link>
          ))}
        </CardContent>
      </Card>

      <LeaderboardTable entries={lbData?.data?.entries} />
    </div>
  );
}
