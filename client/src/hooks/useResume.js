import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { resumeApi } from '@/lib/api/resume';

export const RESUMES_QUERY_KEY = ['resumes'];
export const resumeQueryKey = (id) => ['resumes', id];
export const resumeVersionsKey = (id) => ['resumes', id, 'versions'];

export function useResumes() {
  return useQuery({
    queryKey: RESUMES_QUERY_KEY,
    queryFn: () => resumeApi.list(),
  });
}

export function useResume(id) {
  return useQuery({
    queryKey: resumeQueryKey(id),
    queryFn: () => resumeApi.get(id),
    enabled: Boolean(id),
  });
}

export function useResumeVersions(id) {
  return useQuery({
    queryKey: resumeVersionsKey(id),
    queryFn: () => resumeApi.listVersions(id),
    enabled: Boolean(id),
  });
}

export function useResumeMutations() {
  const queryClient = useQueryClient();

  const invalidate = (id) => {
    queryClient.invalidateQueries({ queryKey: RESUMES_QUERY_KEY });
    if (id) {
      queryClient.invalidateQueries({ queryKey: resumeQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: resumeVersionsKey(id) });
    }
  };

  const create = useMutation({
    mutationFn: resumeApi.create,
    onSuccess: () => invalidate(),
  });

  const update = useMutation({
    mutationFn: ({ id, data }) => resumeApi.update(id, data),
    onSuccess: (_, { id }) => invalidate(id),
  });

  const autosave = useMutation({
    mutationFn: ({ id, data }) => resumeApi.autosave(id, data),
    onSuccess: (res, { id }) => {
      queryClient.setQueryData(resumeQueryKey(id), res);
      queryClient.invalidateQueries({ queryKey: RESUMES_QUERY_KEY });
    },
  });

  const remove = useMutation({
    mutationFn: resumeApi.remove,
    onSuccess: () => invalidate(),
  });

  const duplicate = useMutation({
    mutationFn: resumeApi.duplicate,
    onSuccess: () => invalidate(),
  });

  const importFromProfile = useMutation({
    mutationFn: (title) => resumeApi.importFromProfile(title),
    onSuccess: () => invalidate(),
  });

  const parseImport = useMutation({
    mutationFn: resumeApi.parseImport,
  });

  const saveImport = useMutation({
    mutationFn: resumeApi.saveImport,
    onSuccess: () => invalidate(),
  });

  const restoreVersion = useMutation({
    mutationFn: ({ id, versionId }) => resumeApi.restoreVersion(id, versionId),
    onSuccess: (_, { id }) => invalidate(id),
  });

  return { create, update, autosave, remove, duplicate, importFromProfile, parseImport, saveImport, restoreVersion };
}
