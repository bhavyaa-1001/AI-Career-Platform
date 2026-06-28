import { useState } from 'react';
import { Link } from 'react-router-dom';

import { JobCard } from '@/components/recruiter/JobCard';
import { Loader } from '@/components/common';
import { Button, Select } from '@/components/ui';
import { useRecruiterJobs, useRecruiterMutations } from '@/hooks/useRecruiter';

const STATUS_FILTER = [
  { value: 'all', label: 'All statuses' },
  { value: 'open', label: 'Open' },
  { value: 'draft', label: 'Draft' },
  { value: 'closed', label: 'Closed' },
];

export function ManageJobsPage() {
  const [status, setStatus] = useState('all');
  const { data, isLoading } = useRecruiterJobs({ status });
  const { deleteJob } = useRecruiterMutations();

  const jobs = data?.data?.jobs || [];

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this job and all its applications?')) return;
    await deleteJob.mutateAsync(id);
  };

  if (isLoading) return <Loader className="py-20" />;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Manage Jobs</h1>
          <p className="mt-1 text-muted-foreground">Create, publish, and manage job postings.</p>
        </div>
        <Link to="/recruiter/jobs/new">
          <Button>Post Job</Button>
        </Link>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={STATUS_FILTER}
          className="w-40"
        />
        <span className="text-sm text-muted-foreground">{jobs.length} job{jobs.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="space-y-3">
        {jobs.length ? jobs.map((job) => (
          <JobCard key={job.id} job={job} onDelete={handleDelete} />
        )) : (
          <p className="py-12 text-center text-muted-foreground">No jobs yet. Post your first opening.</p>
        )}
      </div>
    </div>
  );
}
