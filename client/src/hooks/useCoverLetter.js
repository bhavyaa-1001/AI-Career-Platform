import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { coverLetterApi } from '@/lib/api/coverLetter';

export const COVER_LETTERS_KEY = ['cover-letters'];
export const coverLetterKey = (id) => ['cover-letters', id];

export function useCoverLetters(params) {
  return useQuery({
    queryKey: [...COVER_LETTERS_KEY, params],
    queryFn: () => coverLetterApi.list(params),
  });
}

export function useCoverLetter(id) {
  return useQuery({
    queryKey: coverLetterKey(id),
    queryFn: () => coverLetterApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCoverLetterMutations() {
  const queryClient = useQueryClient();

  const invalidate = (id) => {
    queryClient.invalidateQueries({ queryKey: COVER_LETTERS_KEY });
    if (id) queryClient.invalidateQueries({ queryKey: coverLetterKey(id) });
  };

  const generate = useMutation({
    mutationFn: coverLetterApi.generate,
    onSuccess: () => invalidate(),
  });

  const update = useMutation({
    mutationFn: ({ id, body }) => coverLetterApi.update(id, body),
    onSuccess: (_, { id }) => invalidate(id),
  });

  const remove = useMutation({
    mutationFn: coverLetterApi.remove,
    onSuccess: () => invalidate(),
  });

  return { generate, update, remove };
}
