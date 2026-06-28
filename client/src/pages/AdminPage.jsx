import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui';
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Coding Problems</CardTitle>
              <CardDescription>Create, edit, and publish coding challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/admin/coding/problems">
                <Button>Manage Problems</Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Administration</CardTitle>
              <CardDescription>
                Welcome, {user?.firstName}. Additional admin features coming soon.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                User management and platform settings will be added in future milestones.
              </p>
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
