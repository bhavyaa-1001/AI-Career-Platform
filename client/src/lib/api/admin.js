import api from '@/lib/axios';

const BASE = '/admin';

export const adminApi = {
  // Dashboard
  dashboard: (params) => api.get(`${BASE}/dashboard`, { params }),
  analytics: (params) => api.get(`${BASE}/analytics`, { params }),

  // Users
  listUsers: (params) => api.get(`${BASE}/users`, { params }),
  getUser: (id) => api.get(`${BASE}/users/${id}`),
  createUser: (data) => api.post(`${BASE}/users`, data),
  updateUser: (id, data) => api.patch(`${BASE}/users/${id}`, data),
  deleteUser: (id) => api.delete(`${BASE}/users/${id}`),
  suspendUser: (id, data) => api.post(`${BASE}/users/${id}/suspend`, data),
  activateUser: (id) => api.post(`${BASE}/users/${id}/activate`),
  banUser: (id, data) => api.post(`${BASE}/users/${id}/ban`, data),
  unbanUser: (id) => api.post(`${BASE}/users/${id}/unban`),
  assignRole: (id, role) => api.patch(`${BASE}/users/${id}/role`, { role }),
  resetPassword: (id, newPassword) => api.post(`${BASE}/users/${id}/reset-password`, { newPassword }),
  bulkAction: (data) => api.post(`${BASE}/users/bulk`, data),
  exportUsers: (params) => api.get(`${BASE}/users/export`, { params, responseType: 'blob' }),

  // Recruiters
  listRecruiters: (params) => api.get(`${BASE}/recruiters`, { params }),
  approveRecruiter: (id) => api.post(`${BASE}/recruiters/${id}/approve`),
  rejectRecruiter: (id, data) => api.post(`${BASE}/recruiters/${id}/reject`, data),
  suspendRecruiter: (id, data) => api.post(`${BASE}/recruiters/${id}/suspend`, data),
  verifyCompany: (id) => api.post(`${BASE}/recruiters/${id}/verify`),
  updateKyc: (id, data) => api.patch(`${BASE}/recruiters/${id}/kyc`, data),
  updatePremium: (id, premiumStatus) => api.patch(`${BASE}/recruiters/${id}/premium`, { premiumStatus }),
  recruiterAnalytics: (id) => api.get(`${BASE}/recruiters/${id}/analytics`),

  // Jobs
  listJobs: (params) => api.get(`${BASE}/jobs`, { params }),
  approveJob: (id) => api.post(`${BASE}/jobs/${id}/approve`),
  rejectJob: (id, data) => api.post(`${BASE}/jobs/${id}/reject`, data),
  featureJob: (id, data) => api.post(`${BASE}/jobs/${id}/feature`, data),
  expireJob: (id) => api.post(`${BASE}/jobs/${id}/expire`),
  deleteJob: (id) => api.delete(`${BASE}/jobs/${id}`),
  jobReports: (id) => api.get(`${BASE}/jobs/${id}/reports`),

  // Resumes
  listResumes: (params) => api.get(`${BASE}/resumes`, { params }),
  getResume: (id) => api.get(`${BASE}/resumes/${id}`),
  deleteResume: (id) => api.delete(`${BASE}/resumes/${id}`),
  restoreResume: (id) => api.post(`${BASE}/resumes/${id}/restore`),

  // Coding
  codingOverview: () => api.get(`${BASE}/coding/overview`),
  codingProblems: (params) => api.get(`${BASE}/coding/problems`, { params }),
  codingContests: (params) => api.get(`${BASE}/coding/contests`, { params }),
  codingDaily: (params) => api.get(`${BASE}/coding/daily`, { params }),
  codingLeaderboard: (params) => api.get(`${BASE}/coding/leaderboard`, { params }),
  codingAchievements: () => api.get(`${BASE}/coding/achievements`),

  // Interviews
  listInterviews: (params) => api.get(`${BASE}/interviews`, { params }),
  deleteInterview: (id) => api.delete(`${BASE}/interviews/${id}`),
  listTemplates: (params) => api.get(`${BASE}/interviews/templates`, { params }),
  createTemplate: (data) => api.post(`${BASE}/interviews/templates`, data),
  updateTemplate: (id, data) => api.patch(`${BASE}/interviews/templates/${id}`, data),
  deleteTemplate: (id) => api.delete(`${BASE}/interviews/templates/${id}`),
  listQuestions: (params) => api.get(`${BASE}/interviews/questions`, { params }),
  createQuestion: (data) => api.post(`${BASE}/interviews/questions`, data),
  updateQuestion: (id, data) => api.patch(`${BASE}/interviews/questions/${id}`, data),
  deleteQuestion: (id) => api.delete(`${BASE}/interviews/questions/${id}`),

  // CMS
  listCms: (params) => api.get(`${BASE}/cms`, { params }),
  getCms: (id) => api.get(`${BASE}/cms/${id}`),
  createCms: (data) => api.post(`${BASE}/cms`, data),
  updateCms: (id, data) => api.patch(`${BASE}/cms/${id}`, data),
  deleteCms: (id) => api.delete(`${BASE}/cms/${id}`),

  // Broadcasts
  listBroadcasts: (params) => api.get(`${BASE}/broadcasts`, { params }),
  createBroadcast: (data) => api.post(`${BASE}/broadcasts`, data),
  sendBroadcast: (id) => api.post(`${BASE}/broadcasts/${id}/send`),
  deleteBroadcast: (id) => api.delete(`${BASE}/broadcasts/${id}`),

  // Reports
  listReports: (params) => api.get(`${BASE}/reports`, { params }),
  reportStats: () => api.get(`${BASE}/reports/stats`),
  resolveReport: (id, data) => api.post(`${BASE}/reports/${id}/resolve`, data),

  // Audit
  listAudit: (params) => api.get(`${BASE}/audit`, { params }),
  auditStats: () => api.get(`${BASE}/audit/stats`),
  exportAudit: (params) => api.get(`${BASE}/audit/export`, { params, responseType: 'blob' }),

  // Settings
  getSettings: () => api.get(`${BASE}/settings`),
  getSettingsCategory: (category) => api.get(`${BASE}/settings/${category}`),
  updateSettings: (category, data) => api.patch(`${BASE}/settings/${category}`, data),
};

export async function downloadAdminExport(fetcher, params, filename) {
  const blob = await fetcher(params);
  const url = URL.createObjectURL(blob instanceof Blob ? blob : new Blob([blob]));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
