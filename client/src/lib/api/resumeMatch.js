import api from '@/lib/axios';

export const resumeMatchApi = {
  status: () => api.get('/resume-match/status'),
  dashboard: () => api.get('/resume-match/dashboard'),
  list: (params) => api.get('/resume-match', { params }),
  get: (id) => api.get(`/resume-match/${id}`),
  generate: (data) => api.post('/resume-match/generate', data, { timeout: 120000 }),
  remove: (id) => api.delete(`/resume-match/${id}`),
};
