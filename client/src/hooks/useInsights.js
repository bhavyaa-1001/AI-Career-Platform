import { useQuery } from '@tanstack/react-query';

import { insightsApi } from '@/lib/api/insights';

export const INSIGHTS_KEY = ['insights'];

export function useStudentInsights(params, options = {}) {
  return useQuery({
    queryKey: [...INSIGHTS_KEY, 'student', params],
    queryFn: () => insightsApi.student(params),
    ...options,
  });
}

export function useRecruiterInsights(params, options = {}) {
  return useQuery({
    queryKey: [...INSIGHTS_KEY, 'recruiter', params],
    queryFn: () => insightsApi.recruiter(params),
    ...options,
  });
}

export function useAdminInsights(params, options = {}) {
  return useQuery({
    queryKey: [...INSIGHTS_KEY, 'admin', params],
    queryFn: () => insightsApi.admin(params),
    ...options,
  });
}

export async function downloadInsightsExport(fetcher, params, filename) {
  const blob = await fetcher(params);
  const url = URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob]));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
