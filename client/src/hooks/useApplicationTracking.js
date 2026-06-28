import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { trackingApi } from '@/lib/api/tracking';

export const TRACKING_KANBAN_KEY = ['tracking', 'kanban'];
export const TRACKING_ANALYTICS_KEY = ['tracking', 'analytics'];
export const trackingDetailKey = (id) => ['tracking', 'detail', id];

export function useKanbanBoard() {
  return useQuery({
    queryKey: TRACKING_KANBAN_KEY,
    queryFn: () => trackingApi.kanban(),
  });
}

export function useTrackingAnalytics() {
  return useQuery({
    queryKey: TRACKING_ANALYTICS_KEY,
    queryFn: () => trackingApi.analytics(),
  });
}

export function useTrackingDetail(id) {
  return useQuery({
    queryKey: trackingDetailKey(id),
    queryFn: () => trackingApi.getDetail(id),
    enabled: Boolean(id),
  });
}

export function useTrackingMutations() {
  const queryClient = useQueryClient();

  const invalidate = (id) => {
    queryClient.invalidateQueries({ queryKey: TRACKING_KANBAN_KEY });
    queryClient.invalidateQueries({ queryKey: TRACKING_ANALYTICS_KEY });
    queryClient.invalidateQueries({ queryKey: ['jobs', 'applications'] });
    if (id) queryClient.invalidateQueries({ queryKey: trackingDetailKey(id) });
  };

  const updateStatus = useMutation({
    mutationFn: ({ id, ...data }) => trackingApi.updateStatus(id, data),
    onSuccess: (_, { id }) => invalidate(id),
  });

  const addNote = useMutation({
    mutationFn: ({ id, text }) => trackingApi.addNote(id, text),
    onSuccess: (_, { id }) => invalidate(id),
  });

  const updateNote = useMutation({
    mutationFn: ({ id, noteId, text }) => trackingApi.updateNote(id, noteId, text),
    onSuccess: (_, { id }) => invalidate(id),
  });

  const deleteNote = useMutation({
    mutationFn: ({ id, noteId }) => trackingApi.deleteNote(id, noteId),
    onSuccess: (_, { id }) => invalidate(id),
  });

  const addAttachmentUrl = useMutation({
    mutationFn: ({ id, ...data }) => trackingApi.addAttachmentUrl(id, data),
    onSuccess: (_, { id }) => invalidate(id),
  });

  const uploadAttachment = useMutation({
    mutationFn: ({ id, file }) => trackingApi.uploadAttachment(id, file),
    onSuccess: (_, { id }) => invalidate(id),
  });

  const deleteAttachment = useMutation({
    mutationFn: ({ id, attachmentId }) => trackingApi.deleteAttachment(id, attachmentId),
    onSuccess: (_, { id }) => invalidate(id),
  });

  return {
    updateStatus,
    addNote,
    updateNote,
    deleteNote,
    addAttachmentUrl,
    uploadAttachment,
    deleteAttachment,
  };
}
