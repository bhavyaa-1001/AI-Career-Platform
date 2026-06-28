import { useState } from 'react';
import { Link } from 'react-router-dom';

import { LeaderboardTable } from '@/components/coding/CodingWidgets';
import { Loader } from '@/components/common';
import { Select } from '@/components/ui';
import { useLeaderboard } from '@/hooks/useCoding';

const PERIODS = [
  { value: 'global', label: 'All Time' },
  { value: 'weekly', label: 'This Week' },
  { value: 'monthly', label: 'This Month' },
];

export function LeaderboardPage() {
  const [period, setPeriod] = useState('global');
  const { data, isLoading } = useLeaderboard(period);
  const entries = data?.data?.entries;
  const myRank = data?.data?.myRank;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground">Global, weekly, and monthly rankings</p>
        </div>
        <Select value={period} onChange={(e) => setPeriod(e.target.value)} options={PERIODS} className="w-36" />
      </div>
      {isLoading ? <Loader className="py-12" /> : (
        <LeaderboardTable entries={entries} myRank={myRank} />
      )}
      <p className="text-center text-sm">
        <Link to="/coding" className="text-primary hover:underline">← Back to Dashboard</Link>
      </p>
    </div>
  );
}
