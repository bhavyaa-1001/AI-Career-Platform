import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

const ACTIONS = [
  { to: '/profile', label: 'Edit Profile', desc: 'Update your career details', primary: true },
  { to: '/profile/preview', label: 'Preview Profile', desc: 'See how others view you' },
  { to: '/profile', label: 'Add Skills', desc: 'Showcase your expertise' },
  { to: '/profile', label: 'Upload Resume', desc: 'Add your resume link' },
];

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {ACTIONS.map((action, i) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Link to={action.to}>
              <div className="group rounded-lg border border-border p-4 transition-all hover:border-primary/50 hover:bg-accent/50">
                <p className="font-medium group-hover:text-primary">{action.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{action.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
