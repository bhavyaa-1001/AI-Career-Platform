import { Link } from 'react-router-dom';

import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent } from '@/components/ui';
import { useContests, useCodingMutations } from '@/hooks/useCoding';

export function ContestsPage() {
  const { data, isLoading } = useContests({});
  const { joinContest, startVirtual } = useCodingMutations();
  const contests = data?.data?.contests || [];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Coding Contests</h1>
        <p className="text-muted-foreground">Compete in timed challenges and climb the rankings</p>
      </div>

      {isLoading ? <Loader className="py-12" /> : (
        <div className="space-y-3">
          {contests.map((c) => (
            <Card key={c.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{c.title}</p>
                  <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                    <Badge variant="outline" className="capitalize">{c.status}</Badge>
                    {c.isVirtual && <Badge variant="secondary">Virtual</Badge>}
                    <span>{new Date(c.startTime).toLocaleString()} — {c.durationMinutes} min</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link to={`/coding/contests/${c.id}`}><Button variant="outline" size="sm">View</Button></Link>
                  <Button size="sm" onClick={() => joinContest.mutate(c.id)}>Join</Button>
                  <Button variant="secondary" size="sm" onClick={() => startVirtual.mutate(c.id)}>Virtual</Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {!contests.length && <p className="py-8 text-center text-muted-foreground">No contests scheduled. Admins can create contests from the admin panel.</p>}
        </div>
      )}
    </div>
  );
}
