import api from '@/lib/axios';

export const jobsApi = {
  browse: (params) => api.get('/jobs/open', { params }),
  get: (id) => api.get(`/jobs/${id}`),
  bookmarks: (params) => api.get('/jobs/bookmarks', { params }),
  addBookmark: (id) => api.post(`/jobs/${id}/bookmark`),
  removeBookmark: (id) => api.delete(`/jobs/${id}/bookmark`),
  apply: (id, data) => api.post(`/jobs/${id}/apply`, data),
  applications: (params) => api.get('/jobs/applications', { params }),
  getApplication: (id) => api.get(`/jobs/applications/${id}`),
};
