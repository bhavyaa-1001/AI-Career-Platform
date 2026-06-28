import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

import { ThemeToggle } from '@/components/common';

export function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 overflow-hidden bg-primary lg:flex lg:flex-col lg:justify-between lg:p-12">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className="flex items-center gap-2 text-primary-foreground">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-sm font-bold">
              AI
            </span>
            <span className="text-lg font-semibold">Career Platform</span>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-3xl font-bold leading-tight text-primary-foreground">
            Accelerate your developer career with AI
          </h2>
          <p className="max-w-md text-primary-foreground/80">
            Build resumes, track applications, and get personalized career guidance — all in one
            platform.
          </p>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-primary-foreground/60"
        >
          Trusted by developers worldwide
        </motion.p>

        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-white/10 blur-3xl" />
      </div>

      <div className="flex flex-1 flex-col">
        <div className="flex items-center justify-between p-4 lg:justify-end lg:p-6">
          <Link to="/" className="flex items-center gap-2 font-semibold lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-xs text-primary-foreground">
              AI
            </span>
            Career Platform
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center px-4 pb-12 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <div className="mb-8 text-center lg:text-left">
              <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
              {subtitle && <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
            {children}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
