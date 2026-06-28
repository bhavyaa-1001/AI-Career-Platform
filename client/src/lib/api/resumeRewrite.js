import api from '@/lib/axios';

export const rewriteApi = {
  generate: (resumeId, body) => api.post(`/resumes/${resumeId}/rewrite`, body, { timeout: 120000 }),
  apply: (resumeId, body) => api.post(`/resumes/${resumeId}/rewrite/apply`, body, { timeout: 60000 }),
};
