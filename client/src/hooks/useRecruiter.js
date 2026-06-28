import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { jobsApi, recruiterApi } from '@/lib/api/recruiter';

export const RECRUITER_DASHBOARD_KEY = ['recruiter', 'dashboard'];
export const RECRUITER_ANALYTICS_KEY = ['recruiter', 'analytics'];
export const RECRUITER_COMPANY_KEY = ['recruiter', 'company'];
export const RECRUITER_JOBS_KEY = ['recruiter', 'jobs'];
export const recruiterJobKey = (id) => ['recruiter', 'jobs', id];
export const recruiterApplicantsKey = (jobId, params) => ['recruiter', 'applicants', jobId, params];
export const recruiterApplicationKey = (id) => ['recruiter', 'application', id];
export const OPEN_JOBS_KEY = ['jobs', 'open'];

export function useRecruiterDashboard(options = {}) {
  return useQuery({
    queryKey: RECRUITER_DASHBOARD_KEY,
    queryFn: () => recruiterApi.dashboard(),
    ...options,
  });
}

export function useRecruiterAnalytics() {
  return useQuery({
    queryKey: RECRUITER_ANALYTICS_KEY,
    queryFn: () => recruiterApi.analytics(),
  });
}

export function useCompany() {
  return useQuery({
    queryKey: RECRUITER_COMPANY_KEY,
    queryFn: () => recruiterApi.getCompany(),
  });
}

export function useRecruiterJobs(params) {
  return useQuery({
    queryKey: [...RECRUITER_JOBS_KEY, params],
    queryFn: () => recruiterApi.listJobs(params),
  });
}

export function useRecruiterJob(id) {
  return useQuery({
    queryKey: recruiterJobKey(id),
    queryFn: () => recruiterApi.getJob(id),
    enabled: Boolean(id),
  });
}

export function useJobApplicants(jobId, params) {
  return useQuery({
    queryKey: recruiterApplicantsKey(jobId, params),
    queryFn: () => recruiterApi.listApplicants(jobId, params),
    enabled: Boolean(jobId),
  });
}

export function useApplication(id) {
  return useQuery({
    queryKey: recruiterApplicationKey(id),
    queryFn: () => recruiterApi.getApplication(id),
    enabled: Boolean(id),
  });
}

export function useOpenJobs(params) {
  return useQuery({
    queryKey: [...OPEN_JOBS_KEY, params],
    queryFn: () => jobsApi.listOpen(params),
  });
}

export function useRecruiterMutations() {
  const queryClient = useQueryClient();

  const invalidateJobs = () => {
    queryClient.invalidateQueries({ queryKey: RECRUITER_JOBS_KEY });
    queryClient.invalidateQueries({ queryKey: RECRUITER_DASHBOARD_KEY });
    queryClient.invalidateQueries({ queryKey: RECRUITER_ANALYTICS_KEY });
  };

  const updateCompany = useMutation({
    mutationFn: recruiterApi.updateCompany,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: RECRUITER_COMPANY_KEY });
      queryClient.invalidateQueries({ queryKey: RECRUITER_DASHBOARD_KEY });
    },
  });

  const createJob = useMutation({
    mutationFn: recruiterApi.createJob,
    onSuccess: invalidateJobs,
  });

  const updateJob = useMutation({
    mutationFn: ({ id, ...data }) => recruiterApi.updateJob(id, data),
    onSuccess: (_, { id }) => {
      invalidateJobs();
      queryClient.invalidateQueries({ queryKey: recruiterJobKey(id) });
    },
  });

  const deleteJob = useMutation({
    mutationFn: recruiterApi.deleteJob,
    onSuccess: invalidateJobs,
  });

  const updateApplication = useMutation({
    mutationFn: ({ id, ...data }) => recruiterApi.updateApplication(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: recruiterApplicationKey(id) });
      queryClient.invalidateQueries({ queryKey: RECRUITER_DASHBOARD_KEY });
      queryClient.invalidateQueries({ queryKey: ['recruiter', 'applicants'] });
    },
  });

  const rankApplication = useMutation({
    mutationFn: recruiterApi.rankApplication,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: recruiterApplicationKey(id) });
      queryClient.invalidateQueries({ queryKey: ['recruiter', 'applicants'] });
    },
  });

  const applyToJob = useMutation({
    mutationFn: ({ jobId, ...data }) => jobsApi.apply(jobId, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: OPEN_JOBS_KEY }),
  });

  return {
    updateCompany,
    createJob,
    updateJob,
    deleteJob,
    updateApplication,
    rankApplication,
    applyToJob,
  };
}
