import api from '@/lib/axios';

export const recruiterApi = {
  dashboard: () => api.get('/jobs/recruiter/dashboard'),
  analytics: () => api.get('/jobs/recruiter/analytics'),
  getCompany: () => api.get('/jobs/recruiter/company'),
  updateCompany: (data) => api.patch('/jobs/recruiter/company', data),
  listJobs: (params) => api.get('/jobs/recruiter/jobs', { params }),
  getJob: (id) => api.get(`/jobs/recruiter/jobs/${id}`),
  createJob: (data) => api.post('/jobs/recruiter/jobs', data),
  updateJob: (id, data) => api.patch(`/jobs/recruiter/jobs/${id}`, data),
  deleteJob: (id) => api.delete(`/jobs/recruiter/jobs/${id}`),
  listApplicants: (jobId, params) => api.get(`/jobs/recruiter/jobs/${jobId}/applications`, { params }),
  getApplication: (id) => api.get(`/jobs/recruiter/applications/${id}`),
  updateApplication: (id, data) => api.patch(`/jobs/recruiter/applications/${id}`, data),
  rankApplication: (id) => api.post(`/jobs/recruiter/applications/${id}/rank`, {}, { timeout: 120000 }),
};

export const jobsApi = {
  listOpen: (params) => api.get('/jobs/open', { params }),
  apply: (id, data) => api.post(`/jobs/${id}/apply`, data),
  myApplications: (params) => api.get('/jobs/my-applications', { params }),
};
