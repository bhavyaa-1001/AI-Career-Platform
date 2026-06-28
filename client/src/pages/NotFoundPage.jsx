import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { Button } from '@/components/ui';

export function NotFoundPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center"
    >
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-semibold">Page not found</h1>
      <p className="max-w-md text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link to="/">
        <Button>Go home</Button>
      </Link>
    </motion.div>
  );
}
