import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { Loader } from '@/components/common';
import {
  ProfileCompletionCard,
  QuickActions,
  RecentActivity,
  StatCard,
} from '@/components/dashboard';
import { Avatar, Badge, Button, Card, CardContent, Progress } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';
import { useDashboard } from '@/hooks/useDashboard';

export function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading, isError, error, refetch } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center">
        <p className="text-destructive">{error.message}</p>
        <Button className="mt-4" onClick={() => refetch()}>Retry</Button>
      </div>
    );
  }

  const { stats, completion, recentActivity } = data.data;

  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="overflow-hidden border-primary/20 bg-gradient-to-r from-primary/5 via-transparent to-transparent">
          <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar src={user?.avatar?.url} name={user?.firstName} size="xl" />
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  Welcome back, {user?.firstName}
                </h2>
                <p className="mt-1 text-muted-foreground">
                  {stats.profileCompletion < 50
                    ? 'Complete your profile to unlock personalized insights.'
                    : 'Your career command center is ready.'}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Badge variant="outline" className="capitalize">{user?.role}</Badge>
                  {stats.hasDraft && <Badge variant="warning">Draft saved</Badge>}
                  {!stats.isEmailVerified && <Badge variant="warning">Email pending</Badge>}
                </div>
              </div>
            </div>
            <div className="w-full sm:w-64">
              <Progress value={stats.profileCompletion} showLabel />
              <Link to="/profile" className="mt-3 block">
                <Button className="w-full">Complete Profile</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <StatCard label="Skills" value={stats.skillsCount} trend="Technical expertise" icon={<span className="text-lg">⚡</span>} />
        <StatCard label="Experience" value={stats.experienceCount} trend="Work history" icon={<span className="text-lg">💼</span>} />
        <StatCard label="Projects" value={stats.projectsCount} trend="Portfolio items" icon={<span className="text-lg">🚀</span>} />
        <StatCard label="Certifications" value={stats.certificationsCount} trend="Credentials" icon={<span className="text-lg">🏆</span>} />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <QuickActions />
          <RecentActivity activities={recentActivity} />
        </div>
        <div>
          <ProfileCompletionCard completion={completion} />
        </div>
      </div>
    </div>
  );
}
