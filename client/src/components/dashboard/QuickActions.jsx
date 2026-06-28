import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

const ACTIONS = [
  { to: '/profile', label: 'Edit Profile', desc: 'Update your career details', primary: true },
  { to: '/resumes', label: 'Build Resume', desc: 'Create ATS-friendly resumes' },
  { to: '/jobs', label: 'Browse Jobs', desc: 'Search and apply to openings' },
  { to: '/applications', label: 'My Applications', desc: 'Track application status' },
  { to: '/coding', label: 'Coding Practice', desc: 'Solve LeetCode-style problems' },
  { to: '/match', label: 'Job Match', desc: 'Compare resume vs job description' },
  { to: '/insights', label: 'Insights Hub', desc: 'Unified analytics dashboard' },
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
