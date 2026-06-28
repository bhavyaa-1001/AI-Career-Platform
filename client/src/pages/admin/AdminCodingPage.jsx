import { Link } from 'react-router-dom';

import { AdminPageHeader, AdminStatGrid } from '@/components/admin/AdminComponents';
import { Loader } from '@/components/common';
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';
import { useAdminCodingOverview } from '@/hooks/useAdmin';

export function AdminCodingPage() {
  const { data, isLoading } = useAdminCodingOverview();
  const overview = data?.data?.overview;

  if (isLoading) return <Loader className="py-20" />;

  const stats = [
    { label: 'Published', value: overview?.problemsByStatus?.published || 0 },
    { label: 'Draft', value: overview?.problemsByStatus?.draft || 0 },
    { label: 'Archived', value: overview?.problemsByStatus?.archived || 0 },
    { label: 'Active Contests', value: overview?.contestsByStatus?.active || overview?.contestsByStatus?.upcoming || 0 },
    { label: 'Daily Challenges', value: overview?.totalDailyChallenges || 0 },
    { label: 'User Profiles', value: overview?.totalProfiles || 0 },
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Coding Platform Management"
        description="Manage problems, contests, daily challenges, and leaderboards"
        actions={<Link to="/admin/coding/problems"><Button>Manage Problems</Button></Link>}
      />

      <AdminStatGrid stats={stats} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Categories</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(overview?.categories || []).map((c) => (
                <div key={c.name} className="flex justify-between rounded-lg border border-border px-3 py-2 text-sm">
                  <span>{c.name}</span>
                  <span className="font-medium">{c.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Top Tags</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {(overview?.topTags || []).map((t) => (
                <span key={t.name} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {t.name} ({t.count})
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Link to="/admin/coding/problems"><Card className="cursor-pointer transition-shadow hover:shadow-md"><CardContent className="p-6 text-center"><p className="font-semibold">Problems</p><p className="text-sm text-muted-foreground">CRUD & publish</p></CardContent></Card></Link>
        <Card><CardContent className="p-6 text-center"><p className="font-semibold">Contests</p><p className="text-sm text-muted-foreground">Via coding admin API</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><p className="font-semibold">Leaderboards</p><p className="text-sm text-muted-foreground">Platform rankings</p></CardContent></Card>
      </div>
    </div>
  );
}
