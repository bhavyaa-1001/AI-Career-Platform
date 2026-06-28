import { Link } from 'react-router-dom';

import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useDailyCalendar, useDailyChallenge } from '@/hooks/useCoding';

export function DailyChallengePage() {
  const { data: dailyData, isLoading } = useDailyChallenge();
  const { data: calendarData } = useDailyCalendar();

  if (isLoading) return <Loader className="py-20" />;

  const challenge = dailyData?.data?.challenge;
  const calendar = calendarData?.data;
  const problem = challenge?.problem;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Daily Challenge</h1>
        <p className="text-muted-foreground">One problem per day — earn bonus points and keep your streak</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Current Streak</p>
            <p className="text-3xl font-bold">{calendar?.currentStreak || 0} 🔥</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Longest Streak</p>
            <p className="text-3xl font-bold">{calendar?.longestStreak || 0} days</p>
          </CardContent>
        </Card>
      </div>

      {problem && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today&apos;s Challenge — {challenge.date}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-medium">{problem.title}</span>
              <Badge className="capitalize">{problem.difficulty}</Badge>
              <Badge variant="outline">+{challenge.bonusPoints} bonus pts</Badge>
            </div>
            <Link to={`/coding/problems/${problem.slug}`}>
              <Button>Solve Today&apos;s Challenge</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader><CardTitle className="text-base">Challenge Calendar</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          {calendar?.challenges?.slice(0, 14).map((c) => (
            <div key={c.date} className="flex items-center justify-between rounded border border-border p-2 text-sm">
              <span>{c.date}</span>
              <span>{c.problem?.title || '—'}</span>
              <Badge variant={c.completed ? 'success' : 'outline'}>{c.completed ? 'Done' : 'Pending'}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
