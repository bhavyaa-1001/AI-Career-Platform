import { useState } from 'react';
import { Link } from 'react-router-dom';

import { JobBrowseCard } from '@/components/jobs/JobBrowseCard';
import { Pagination } from '@/components/jobs/Pagination';
import { Loader } from '@/components/common';
import { Button } from '@/components/ui';
import { useJobMutations, useSavedJobs } from '@/hooks/useJobs';

export function SavedJobsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useSavedJobs({ page, limit: 12 });
  const { toggleBookmark, isBookmarkLoading } = useJobMutations();

  const jobs = data?.data?.bookmarks || [];
  const pagination = data?.data?.pagination;

  if (isLoading) return <Loader className="py-20" />;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Saved Jobs</h1>
          <p className="mt-1 text-muted-foreground">Jobs you bookmarked for later.</p>
        </div>
        <Link to="/jobs">
          <Button variant="outline">Browse all jobs</Button>
        </Link>
      </div>

      {jobs.length ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {jobs.map((job) => (
              <JobBrowseCard
                key={job.id}
                job={job}
                onBookmark={toggleBookmark}
                bookmarkLoading={isBookmarkLoading}
              />
            ))}
          </div>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </>
      ) : (
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-muted-foreground">No saved jobs yet.</p>
          <Link to="/jobs" className="mt-4 inline-block">
            <Button>Browse jobs</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
