import api from '@/lib/axios';

const BASE = '/insights';

export const insightsApi = {
  student: (params) => api.get(`${BASE}/student`, { params }),
  recruiter: (params) => api.get(`${BASE}/recruiter`, { params }),
  admin: (params) => api.get(`${BASE}/admin`, { params }),

  exportStudent: (params) => api.get(`${BASE}/student/export`, {
    params,
    responseType: 'blob',
  }),
  exportRecruiter: (params) => api.get(`${BASE}/recruiter/export`, {
    params,
    responseType: 'blob',
  }),
  exportAdmin: (params) => api.get(`${BASE}/admin/export`, {
    params,
    responseType: 'blob',
  }),
};
