import api from '@/lib/axios';

export const resumeApi = {
  list: () => api.get('/resumes'),
  get: (id) => api.get(`/resumes/${id}`),
  create: (data) => api.post('/resumes', data),
  update: (id, data) => api.put(`/resumes/${id}`, data),
  autosave: (id, data) => api.patch(`/resumes/${id}/autosave`, data),
  remove: (id) => api.delete(`/resumes/${id}`),
  duplicate: (id) => api.post(`/resumes/${id}/duplicate`),
  importFromProfile: (title) => api.post('/resumes/import-profile', { title }),
  parseImport: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post('/resumes/import/parse', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 60000,
    });
  },
  saveImport: (data) => api.post('/resumes/import/save', data),
  listVersions: (id) => api.get(`/resumes/${id}/versions`),
  getVersion: (id, versionId) => api.get(`/resumes/${id}/versions/${versionId}`),
  restoreVersion: (id, versionId) => api.post(`/resumes/${id}/restore/${versionId}`),
};
