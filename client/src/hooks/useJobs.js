import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { jobsApi } from '@/lib/api/jobs';
import { trackingApi } from '@/lib/api/tracking';
import { trackingDetailKey } from '@/hooks/useApplicationTracking';

export const JOBS_BROWSE_KEY = ['jobs', 'browse'];
export const JOBS_BOOKMARKS_KEY = ['jobs', 'bookmarks'];
export const JOBS_APPLICATIONS_KEY = ['jobs', 'applications'];
export const jobKey = (id) => ['jobs', id];
export const applicationKey = (id) => ['jobs', 'applications', id];

export function useBrowseJobs(params) {
  return useQuery({
    queryKey: [...JOBS_BROWSE_KEY, params],
    queryFn: () => jobsApi.browse(params),
  });
}

export function useJob(id) {
  return useQuery({
    queryKey: jobKey(id),
    queryFn: () => jobsApi.get(id),
    enabled: Boolean(id),
  });
}

export function useSavedJobs(params) {
  return useQuery({
    queryKey: [...JOBS_BOOKMARKS_KEY, params],
    queryFn: () => jobsApi.bookmarks(params),
  });
}

export function useMyApplications(params) {
  return useQuery({
    queryKey: [...JOBS_APPLICATIONS_KEY, params],
    queryFn: () => jobsApi.applications(params),
  });
}

export function useApplicationDetail(id) {
  return useQuery({
    queryKey: trackingDetailKey(id),
    queryFn: () => trackingApi.getDetail(id),
    enabled: Boolean(id),
  });
}

export function useJobMutations() {
  const queryClient = useQueryClient();

  const invalidateJobs = () => {
    queryClient.invalidateQueries({ queryKey: JOBS_BROWSE_KEY });
    queryClient.invalidateQueries({ queryKey: JOBS_BOOKMARKS_KEY });
    queryClient.invalidateQueries({ queryKey: JOBS_APPLICATIONS_KEY });
  };

  const addBookmark = useMutation({
    mutationFn: jobsApi.addBookmark,
    onSuccess: invalidateJobs,
  });

  const removeBookmark = useMutation({
    mutationFn: jobsApi.removeBookmark,
    onSuccess: invalidateJobs,
  });

  const apply = useMutation({
    mutationFn: ({ jobId, ...data }) => jobsApi.apply(jobId, data),
    onSuccess: () => {
      invalidateJobs();
      queryClient.invalidateQueries({ queryKey: ['tracking'] });
    },
  });

  const toggleBookmark = async (job) => {
    if (job.isBookmarked) {
      await removeBookmark.mutateAsync(job.id);
    } else {
      await addBookmark.mutateAsync(job.id);
    }
  };

  return {
    addBookmark,
    removeBookmark,
    apply,
    toggleBookmark,
    isBookmarkLoading: addBookmark.isPending || removeBookmark.isPending,
    isApplying: apply.isPending,
  };
}

export const DEFAULT_JOB_FILTERS = {
  search: '',
  employmentType: '',
  location: '',
  skill: '',
  salaryMin: '',
  sort: 'recent',
  page: 1,
  limit: 12,
};

export const EMPLOYMENT_TYPE_OPTIONS = [
  { value: '', label: 'All types' },
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'remote', label: 'Remote' },
];

export const SORT_OPTIONS = [
  { value: 'recent', label: 'Most recent' },
  { value: 'salary', label: 'Highest salary' },
  { value: 'applicants', label: 'Most popular' },
];

export const APPLICATION_STATUS_OPTIONS = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'shortlisted', label: 'Shortlisted' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];
