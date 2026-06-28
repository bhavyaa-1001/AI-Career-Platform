import { motion } from 'framer-motion';

import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export function AdminPage() {
  const { user } = useAuth();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="mb-8 flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
          <Badge variant="destructive">Admin Only</Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Role-Based Access Control</CardTitle>
            <CardDescription>
              This page is only accessible to users with the admin role.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Welcome, {user?.firstName}. User management and platform administration features
              will be added in future milestones.
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
