import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { analysisApi } from '@/lib/api/resumeAnalysis';

export const ANALYSIS_QUERY_KEY = ['analysis'];
export const analysisQueryKey = (id) => ['analysis', id];
export const ANALYTICS_QUERY_KEY = ['analysis', 'analytics'];

export function useAnalysisStatus() {
  return useQuery({
    queryKey: ['analysis', 'status'],
    queryFn: () => analysisApi.status(),
    staleTime: 60000,
  });
}

export function useAnalyses(params) {
  return useQuery({
    queryKey: [...ANALYSIS_QUERY_KEY, params],
    queryFn: () => analysisApi.list(params),
  });
}

export function useAnalysis(id) {
  return useQuery({
    queryKey: analysisQueryKey(id),
    queryFn: () => analysisApi.get(id),
    enabled: Boolean(id),
  });
}

export function useAnalytics() {
  return useQuery({
    queryKey: ANALYTICS_QUERY_KEY,
    queryFn: () => analysisApi.analytics(),
  });
}

export function useAnalysisMutations() {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ANALYSIS_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ANALYTICS_QUERY_KEY });
  };

  const uploadAndAnalyze = useMutation({
    mutationFn: ({ file, ...options }) => analysisApi.uploadAndAnalyze(file, options),
    onSuccess: () => invalidate(),
  });

  const analyzeResume = useMutation({
    mutationFn: ({ resumeId, ...options }) => analysisApi.analyzeResume(resumeId, options),
    onSuccess: () => invalidate(),
  });

  return { uploadAndAnalyze, analyzeResume };
}
