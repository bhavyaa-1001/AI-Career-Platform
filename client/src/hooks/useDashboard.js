import { useQuery } from '@tanstack/react-query';

import { dashboardApi } from '@/lib/api/dashboard';

export const DASHBOARD_QUERY_KEY = ['dashboard'];

export function useDashboard() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: dashboardApi.getDashboard,
    staleTime: 1000 * 60 * 2,
  });
}
