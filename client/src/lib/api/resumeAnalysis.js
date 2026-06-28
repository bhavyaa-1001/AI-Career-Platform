import api from '@/lib/axios';

export const analysisApi = {
  status: () => api.get('/analysis/status'),
  analytics: () => api.get('/analysis/analytics'),
  list: (params) => api.get('/analysis', { params }),
  get: (id) => api.get(`/analysis/${id}`),
  uploadAndAnalyze: (file, options = {}) => {
    const formData = new FormData();
    formData.append('file', file);
    if (options.targetRole) formData.append('targetRole', options.targetRole);
    if (options.targetJobDescription) formData.append('targetJobDescription', options.targetJobDescription);
    return api.post('/analysis/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 120000,
    });
  },
  analyzeResume: (resumeId, options = {}) => api.post(`/analysis/resume/${resumeId}`, options, { timeout: 120000 }),
};
