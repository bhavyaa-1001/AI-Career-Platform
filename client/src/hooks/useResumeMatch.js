import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { resumeMatchApi } from '@/lib/api/resumeMatch';

export const MATCH_DASHBOARD_KEY = ['resume-match', 'dashboard'];
export const MATCH_LIST_KEY = ['resume-match', 'list'];
export const matchDetailKey = (id) => ['resume-match', id];

export function useMatchStatus() {
  return useQuery({
    queryKey: ['resume-match', 'status'],
    queryFn: () => resumeMatchApi.status(),
  });
}

export function useMatchDashboard() {
  return useQuery({
    queryKey: MATCH_DASHBOARD_KEY,
    queryFn: () => resumeMatchApi.dashboard(),
  });
}

export function useResumeMatches(params) {
  return useQuery({
    queryKey: [...MATCH_LIST_KEY, params],
    queryFn: () => resumeMatchApi.list(params),
  });
}

export function useResumeMatch(id) {
  return useQuery({
    queryKey: matchDetailKey(id),
    queryFn: () => resumeMatchApi.get(id),
    enabled: Boolean(id),
  });
}

export function useResumeMatchMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: MATCH_DASHBOARD_KEY });
    queryClient.invalidateQueries({ queryKey: MATCH_LIST_KEY });
  };

  const generate = useMutation({
    mutationFn: resumeMatchApi.generate,
    onSuccess: invalidate,
  });

  const remove = useMutation({
    mutationFn: resumeMatchApi.remove,
    onSuccess: invalidate,
  });

  return { generate, remove };
}
