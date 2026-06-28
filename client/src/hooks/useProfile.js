import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { profileApi } from '@/lib/api/profile';

export const PROFILE_QUERY_KEY = ['profile'];

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: profileApi.getMe,
  });
}

export function useProfileMutation(mutationFn, successMessage) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: (response) => {
      queryClient.setQueryData(PROFILE_QUERY_KEY, (old) => {
        if (!old) return response;
        if (response.data?.user && response.data?.profile) {
          return { ...old, data: response.data };
        }
        if (response.data?.profile) {
          return { ...old, data: { ...old.data, profile: response.data.profile } };
        }
        return old;
      });
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
      return successMessage;
    },
  });
}
