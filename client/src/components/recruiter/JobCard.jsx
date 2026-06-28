import { Link } from 'react-router-dom';

import { Button, Card, CardContent } from '@/components/ui';

import { StatusBadge } from './CandidateRankBadge';

export function JobCard({ job, onDelete }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-semibold">{job.title}</h3>
            <StatusBadge status={job.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {job.location || 'Remote'} · {job.employmentType} · {job.applicantCount} applicant{job.applicantCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/recruiter/jobs/${job.id}/applicants`}>
            <Button variant="outline" size="sm">Applicants</Button>
          </Link>
          <Link to={`/recruiter/jobs/${job.id}/edit`}>
            <Button variant="outline" size="sm">Edit</Button>
          </Link>
          {onDelete && (
            <Button variant="ghost" size="sm" onClick={() => onDelete(job.id)}>Delete</Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
