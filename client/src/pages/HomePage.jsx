import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';

import { Loader } from '@/components/common';
import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui';
import { useHealth } from '@/hooks/useHealth';
import { formatUptime } from '@/lib/utils';

export function HomePage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useHealth();
  const health = data?.data;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const onSubmit = (formData) => {
    console.log('Form ready for Milestone 2+:', formData);
    reset();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-16 text-center"
      >
        <Badge variant="outline" className="mb-4">
          Milestone 1 — Foundation
        </Badge>
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Build your developer career
          <span className="block text-primary">with AI-powered insights</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          A production-grade platform for resumes, skills tracking, job applications, and
          personalized career guidance.
        </p>
      </motion.section>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>API Health Status</CardTitle>
                  <CardDescription>Live connection to the Express backend</CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
                  {isFetching ? 'Checking...' : 'Refresh'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading && <Loader className="py-8" />}
              {isError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4">
                  <p className="text-sm text-destructive">{error.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Ensure the server is running on port 5000
                  </p>
                </div>
              )}
              {health && (
                <dl className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-muted-foreground">Status</dt>
                    <dd className="mt-1">
                      <Badge variant={health.status === 'healthy' ? 'success' : 'warning'}>
                        {health.status}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Database</dt>
                    <dd className="mt-1">
                      <Badge variant={health.database?.status === 'connected' ? 'success' : 'destructive'}>
                        {health.database?.status}
                      </Badge>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Environment</dt>
                    <dd className="mt-1 text-sm font-medium">{health.environment}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Uptime</dt>
                    <dd className="mt-1 text-sm font-medium">{formatUptime(health.uptime)}</dd>
                  </div>
                  <div className="sm:col-span-2">
                    <dt className="text-xs text-muted-foreground">Last checked</dt>
                    <dd className="mt-1 text-sm font-medium">
                      {new Date(health.timestamp).toLocaleString()}
                    </dd>
                  </div>
                </dl>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Stack Verification</CardTitle>
              <CardDescription>React Hook Form + reusable Input component</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  error={errors.email?.message}
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                      message: 'Invalid email address',
                    },
                  })}
                />
                <Button type="submit">Verify Setup</Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        {['React 19', 'Redux Toolkit', 'TanStack Query', 'Tailwind CSS'].map((tech) => (
          <Card key={tech} className="text-center">
            <CardContent className="py-6">
              <p className="text-sm font-medium">{tech}</p>
              <Badge variant="success" className="mt-2">
                Configured
              </Badge>
            </CardContent>
          </Card>
        ))}
      </motion.section>
    </div>
  );
}
