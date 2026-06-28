import { Link, useParams } from 'react-router-dom';
import { useState } from 'react';

import { ApplicantTable } from '@/components/recruiter/ApplicantTable';
import { Loader } from '@/components/common';
import { Button, Select } from '@/components/ui';
import { useJobApplicants } from '@/hooks/useRecruiter';

const STATUS_FILTER = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

const SORT_OPTIONS = [
  { value: 'ranking', label: 'Best match first' },
  { value: 'recent', label: 'Most recent' },
];

export function JobApplicantsPage() {
  const { jobId } = useParams();
  const [status, setStatus] = useState('all');
  const [sort, setSort] = useState('ranking');
  const { data, isLoading } = useJobApplicants(jobId, { status, sort });

  if (isLoading) return <Loader className="py-20" />;

  const job = data?.data?.job;
  const applications = data?.data?.applications || [];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Applicants</h1>
          <p className="mt-1 text-muted-foreground">
            {job?.title} · {applications.length} candidate{applications.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link to="/recruiter/jobs">
          <Button variant="outline">Back to Jobs</Button>
        </Link>
      </div>

      <div className="flex flex-wrap gap-3">
        <Select value={status} onChange={(e) => setStatus(e.target.value)} options={STATUS_FILTER} className="w-40" />
        <Select value={sort} onChange={(e) => setSort(e.target.value)} options={SORT_OPTIONS} className="w-44" />
      </div>

      <ApplicantTable applications={applications} />
    </div>
  );
}
