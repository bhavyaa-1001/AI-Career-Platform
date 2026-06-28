import { useMutation, useQueryClient } from '@tanstack/react-query';

import { rewriteApi } from '@/lib/api/resumeRewrite';

import { RESUMES_QUERY_KEY, resumeQueryKey, resumeVersionsKey } from './useResume';

export function useResumeRewrite(resumeId) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: RESUMES_QUERY_KEY });
    if (resumeId) {
      queryClient.invalidateQueries({ queryKey: resumeQueryKey(resumeId) });
      queryClient.invalidateQueries({ queryKey: resumeVersionsKey(resumeId) });
    }
  };

  const generate = useMutation({
    mutationFn: (body) => rewriteApi.generate(resumeId, body),
  });

  const apply = useMutation({
    mutationFn: (body) => rewriteApi.apply(resumeId, body),
    onSuccess: () => invalidate(),
  });

  return { generate, apply };
}
