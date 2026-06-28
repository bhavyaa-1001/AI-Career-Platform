import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationApi } from '@/lib/api/notifications';
import { DASHBOARD_QUERY_KEY } from '@/hooks/useDashboard';

export const NOTIFICATIONS_QUERY_KEY = ['notifications'];

export function useNotifications() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: NOTIFICATIONS_QUERY_KEY,
    queryFn: notificationApi.getAll,
    staleTime: 1000 * 30,
  });

  const markRead = useMutation({
    mutationFn: notificationApi.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
  });

  const markAllRead = useMutation({
    mutationFn: notificationApi.markAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTIFICATIONS_QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: DASHBOARD_QUERY_KEY });
    },
  });

  return {
    ...query,
    markRead: (id) => markRead.mutate(id),
    markAllRead: () => markAllRead.mutate(),
  };
}
