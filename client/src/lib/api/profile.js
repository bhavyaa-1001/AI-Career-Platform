import api from '../axios';

export const profileApi = {
  getMe: () => api.get('/profile/me'),
  updatePersonal: (data) => api.patch('/profile/personal', data),
  updateSkills: (skills) => api.put('/profile/skills', { skills }),

  addEducation: (data) => api.post('/profile/education', data),
  updateEducation: (id, data) => api.patch(`/profile/education/${id}`, data),
  deleteEducation: (id) => api.delete(`/profile/education/${id}`),

  addExperience: (data) => api.post('/profile/experience', data),
  updateExperience: (id, data) => api.patch(`/profile/experience/${id}`, data),
  deleteExperience: (id) => api.delete(`/profile/experience/${id}`),

  addProject: (data) => api.post('/profile/projects', data),
  updateProject: (id, data) => api.patch(`/profile/projects/${id}`, data),
  deleteProject: (id) => api.delete(`/profile/projects/${id}`),

  addCertification: (data) => api.post('/profile/certifications', data),
  updateCertification: (id, data) => api.patch(`/profile/certifications/${id}`, data),
  deleteCertification: (id) => api.delete(`/profile/certifications/${id}`),

  updateLanguages: (languages) => api.put('/profile/languages', { languages }),
  updatePreferences: (data) => api.patch('/profile/preferences', data),
  saveDraft: (data) => api.patch('/profile/draft', data),
  publishDraft: () => api.post('/profile/publish'),
  discardDraft: () => api.delete('/profile/draft'),
  getPreview: () => api.get('/profile/preview'),
  getCompletion: () => api.get('/profile/completion'),
};
