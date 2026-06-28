import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { adminApi } from '@/lib/api/admin';

export const ADMIN_KEY = ['admin'];

// Dashboard
export function useAdminDashboard(params, options = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'dashboard', params],
    queryFn: () => adminApi.dashboard(params),
    ...options,
  });
}

export function useAdminAnalytics(params, options = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'analytics', params],
    queryFn: () => adminApi.analytics(params),
    ...options,
  });
}

// Users
export function useAdminUsers(params, options = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'users', params],
    queryFn: () => adminApi.listUsers(params),
    ...options,
  });
}

export function useAdminUser(id, options = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'user', id],
    queryFn: () => adminApi.getUser(id),
    enabled: !!id,
    ...options,
  });
}

export function useAdminUserMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: [...ADMIN_KEY, 'users'] });

  return {
    createUser: useMutation({ mutationFn: adminApi.createUser, onSuccess: invalidate }),
    updateUser: useMutation({ mutationFn: ({ id, data }) => adminApi.updateUser(id, data), onSuccess: invalidate }),
    deleteUser: useMutation({ mutationFn: adminApi.deleteUser, onSuccess: invalidate }),
    suspendUser: useMutation({ mutationFn: ({ id, data }) => adminApi.suspendUser(id, data), onSuccess: invalidate }),
    activateUser: useMutation({ mutationFn: adminApi.activateUser, onSuccess: invalidate }),
    banUser: useMutation({ mutationFn: ({ id, data }) => adminApi.banUser(id, data), onSuccess: invalidate }),
    unbanUser: useMutation({ mutationFn: adminApi.unbanUser, onSuccess: invalidate }),
    assignRole: useMutation({ mutationFn: ({ id, role }) => adminApi.assignRole(id, role), onSuccess: invalidate }),
    resetPassword: useMutation({ mutationFn: ({ id, newPassword }) => adminApi.resetPassword(id, newPassword) }),
    bulkAction: useMutation({ mutationFn: adminApi.bulkAction, onSuccess: invalidate }),
  };
}

// Recruiters
export function useAdminRecruiters(params, options = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'recruiters', params],
    queryFn: () => adminApi.listRecruiters(params),
    ...options,
  });
}

export function useAdminRecruiterMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: [...ADMIN_KEY, 'recruiters'] });
  return {
    approve: useMutation({ mutationFn: adminApi.approveRecruiter, onSuccess: invalidate }),
    reject: useMutation({ mutationFn: ({ id, data }) => adminApi.rejectRecruiter(id, data), onSuccess: invalidate }),
    suspend: useMutation({ mutationFn: ({ id, data }) => adminApi.suspendRecruiter(id, data), onSuccess: invalidate }),
    verify: useMutation({ mutationFn: adminApi.verifyCompany, onSuccess: invalidate }),
    updatePremium: useMutation({ mutationFn: ({ id, premiumStatus }) => adminApi.updatePremium(id, premiumStatus), onSuccess: invalidate }),
  };
}

// Jobs
export function useAdminJobs(params, options = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'jobs', params],
    queryFn: () => adminApi.listJobs(params),
    ...options,
  });
}

export function useAdminJobMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: [...ADMIN_KEY, 'jobs'] });
  return {
    approve: useMutation({ mutationFn: adminApi.approveJob, onSuccess: invalidate }),
    reject: useMutation({ mutationFn: ({ id, data }) => adminApi.rejectJob(id, data), onSuccess: invalidate }),
    feature: useMutation({ mutationFn: ({ id, data }) => adminApi.featureJob(id, data), onSuccess: invalidate }),
    delete: useMutation({ mutationFn: adminApi.deleteJob, onSuccess: invalidate }),
  };
}

// Resumes
export function useAdminResumes(params, options = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'resumes', params],
    queryFn: () => adminApi.listResumes(params),
    ...options,
  });
}

// Coding
export function useAdminCodingOverview(options = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'coding', 'overview'],
    queryFn: () => adminApi.codingOverview(),
    ...options,
  });
}

// CMS
export function useAdminCms(params, options = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'cms', params],
    queryFn: () => adminApi.listCms(params),
    ...options,
  });
}

export function useAdminCmsMutations() {
  const qc = useQueryClient();
  const invalidate = () => qc.invalidateQueries({ queryKey: [...ADMIN_KEY, 'cms'] });
  return {
    create: useMutation({ mutationFn: adminApi.createCms, onSuccess: invalidate }),
    update: useMutation({ mutationFn: ({ id, data }) => adminApi.updateCms(id, data), onSuccess: invalidate }),
    delete: useMutation({ mutationFn: adminApi.deleteCms, onSuccess: invalidate }),
  };
}

// Broadcasts
export function useAdminBroadcasts(params, options = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'broadcasts', params],
    queryFn: () => adminApi.listBroadcasts(params),
    ...options,
  });
}

// Reports
export function useAdminReports(params, options = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'reports', params],
    queryFn: () => adminApi.listReports(params),
    ...options,
  });
}

// Audit
export function useAdminAudit(params, options = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'audit', params],
    queryFn: () => adminApi.listAudit(params),
    ...options,
  });
}

// Settings
export function useAdminSettings(options = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'settings'],
    queryFn: () => adminApi.getSettings(),
    ...options,
  });
}

export function useAdminSettingsMutations() {
  const qc = useQueryClient();
  return {
    update: useMutation({
      mutationFn: ({ category, data }) => adminApi.updateSettings(category, data),
      onSuccess: () => qc.invalidateQueries({ queryKey: [...ADMIN_KEY, 'settings'] }),
    }),
  };
}

// Interviews
export function useAdminInterviews(params, options = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'interviews', params],
    queryFn: () => adminApi.listInterviews(params),
    ...options,
  });
}

export function useAdminQuestions(params, options = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'questions', params],
    queryFn: () => adminApi.listQuestions(params),
    ...options,
  });
}

export function useAdminTemplates(params, options = {}) {
  return useQuery({
    queryKey: [...ADMIN_KEY, 'templates', params],
    queryFn: () => adminApi.listTemplates(params),
    ...options,
  });
}
