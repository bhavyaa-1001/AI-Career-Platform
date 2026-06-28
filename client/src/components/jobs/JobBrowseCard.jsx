import { Link } from 'react-router-dom';

import { StatusBadge } from '@/components/recruiter/CandidateRankBadge';
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui';

const formatSalary = (job) => {
  if (job.salaryMin && job.salaryMax) {
    return `${job.salaryCurrency || 'USD'} ${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}`;
  }
  if (job.salaryMin) return `From ${job.salaryCurrency || 'USD'} ${job.salaryMin.toLocaleString()}`;
  if (job.salaryMax) return `Up to ${job.salaryCurrency || 'USD'} ${job.salaryMax.toLocaleString()}`;
  return null;
};

export function JobBrowseCard({ job, onBookmark, bookmarkLoading }) {
  const salary = formatSalary(job);

  return (
    <Card className="group transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <Link to={`/jobs/${job.id}`} className="hover:text-primary">
              <CardTitle className="text-lg leading-snug">{job.title}</CardTitle>
            </Link>
            <p className="mt-1 text-sm text-muted-foreground">
              {job.companyName} · {job.location || 'Remote'} · <span className="capitalize">{job.employmentType}</span>
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="shrink-0"
            disabled={bookmarkLoading}
            onClick={() => onBookmark(job)}
            aria-label={job.isBookmarked ? 'Remove bookmark' : 'Save job'}
          >
            {job.isBookmarked ? '★' : '☆'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="line-clamp-2 text-sm text-muted-foreground">{job.description}</p>

        <div className="flex flex-wrap items-center gap-2">
          {salary && <Badge variant="outline">{salary}</Badge>}
          <Badge variant="outline">{job.applicantCount} applicant{job.applicantCount !== 1 ? 's' : ''}</Badge>
          {job.hasApplied && job.applicationStatus && (
            <StatusBadge status={job.applicationStatus} />
          )}
        </div>

        {job.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.skills.slice(0, 5).map((s) => (
              <Badge key={s} variant="outline">{s}</Badge>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <Link to={`/jobs/${job.id}`}>
            <Button size="sm">{job.hasApplied ? 'View application' : 'View & Apply'}</Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
