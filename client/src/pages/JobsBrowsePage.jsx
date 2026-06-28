import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

import { JobBrowseCard } from '@/components/jobs/JobBrowseCard';
import { JobFilters } from '@/components/jobs/JobFilters';
import { Pagination } from '@/components/jobs/Pagination';
import { Loader } from '@/components/common';
import { Button } from '@/components/ui';
import { DEFAULT_JOB_FILTERS, useBrowseJobs, useJobMutations } from '@/hooks/useJobs';

export function JobsBrowsePage() {
  const [filters, setFilters] = useState({ ...DEFAULT_JOB_FILTERS });
  const queryParams = {
    ...filters,
    salaryMin: filters.salaryMin ? Number(filters.salaryMin) : undefined,
    employmentType: filters.employmentType || undefined,
    location: filters.location || undefined,
    skill: filters.skill || undefined,
  };

  const { data, isLoading, isFetching } = useBrowseJobs(queryParams);
  const { toggleBookmark, isBookmarkLoading } = useJobMutations();

  const jobs = data?.data?.jobs || [];
  const pagination = data?.data?.pagination;

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Browse Jobs</h1>
            <p className="mt-1 text-muted-foreground">
              Search openings, filter by role type, and apply with your resume.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to="/jobs/saved">
              <Button variant="outline">Saved Jobs</Button>
            </Link>
            <Link to="/applications">
              <Button variant="outline">My Applications</Button>
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-4">
        <aside className="lg:col-span-1">
          <JobFilters
            filters={filters}
            onChange={setFilters}
            onReset={() => setFilters({ ...DEFAULT_JOB_FILTERS })}
            total={pagination?.total}
          />
        </aside>

        <div className="space-y-4 lg:col-span-3">
          {isLoading ? (
            <Loader className="py-20" />
          ) : jobs.length ? (
            <>
              {isFetching && !isLoading && (
                <p className="text-xs text-muted-foreground">Updating results…</p>
              )}
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
              <Pagination
                pagination={pagination}
                onPageChange={(page) => setFilters((f) => ({ ...f, page }))}
              />
            </>
          ) : (
            <div className="rounded-lg border border-dashed border-border py-16 text-center">
              <p className="text-muted-foreground">No jobs match your filters.</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => setFilters({ ...DEFAULT_JOB_FILTERS })}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
