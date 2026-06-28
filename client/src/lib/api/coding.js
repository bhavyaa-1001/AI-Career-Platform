import api from '@/lib/axios';

const BASE = '/coding';

export const codingApi = {
  status: () => api.get(`${BASE}/status`),

  listProblems: (params) => api.get(`${BASE}/problems`, { params }),
  getProblem: (slug) => api.get(`${BASE}/problems/${slug}`),

  runCode: (body) => api.post(`${BASE}/run`, body, { timeout: 120000 }),
  submitCode: (body) => api.post(`${BASE}/submit`, body, { timeout: 120000 }),
  saveDraft: (body) => api.post(`${BASE}/draft`, body),
  getDraft: (problemId) => api.get(`${BASE}/draft/${problemId}`),

  listSubmissions: (params) => api.get(`${BASE}/submissions`, { params }),
  getSubmission: (id) => api.get(`${BASE}/submissions/${id}`),

  toggleBookmark: (problemId) => api.post(`${BASE}/bookmarks/toggle`, { problemId }),
  toggleFavorite: (problemId) => api.post(`${BASE}/bookmarks/favorite`, { problemId }),
  listBookmarks: (params) => api.get(`${BASE}/bookmarks`, { params }),
  bookmarkStats: () => api.get(`${BASE}/bookmarks/stats`),

  leaderboard: (params) => api.get(`${BASE}/leaderboard`, { params }),

  dailyChallenge: () => api.get(`${BASE}/daily`),
  dailyCalendar: () => api.get(`${BASE}/daily/calendar`),

  listContests: (params) => api.get(`${BASE}/contests`, { params }),
  getContest: (id) => api.get(`${BASE}/contests/${id}`),
  joinContest: (id) => api.post(`${BASE}/contests/${id}/join`),
  contestLeaderboard: (id) => api.get(`${BASE}/contests/${id}/leaderboard`),
  startVirtualContest: (id) => api.post(`${BASE}/contests/${id}/virtual`),

  dashboard: () => api.get(`${BASE}/dashboard`),
  progress: () => api.get(`${BASE}/progress`),
  achievements: () => api.get(`${BASE}/achievements`),
  heatmap: () => api.get(`${BASE}/heatmap`),

  codeReview: (body) => api.post(`${BASE}/ai/review`, body, { timeout: 120000 }),
  listReviews: (params) => api.get(`${BASE}/ai/reviews`, { params }),
  requestHint: (body) => api.post(`${BASE}/ai/hint`, body, { timeout: 60000 }),
  requestDryRun: (body) => api.post(`${BASE}/ai/dry-run`, body, { timeout: 60000 }),
  requestVisual: (body) => api.post(`${BASE}/ai/visual`, body, { timeout: 60000 }),
  getHintSession: (problemId) => api.get(`${BASE}/ai/hints/${problemId}`),

  // Admin
  adminListProblems: (params) => api.get(`${BASE}/problems`, { params: { ...params, status: params?.status } }),
  adminGetProblem: (id) => api.get(`${BASE}/admin/problems/${id}`),
  adminCreateProblem: (body) => api.post(`${BASE}/admin/problems`, body),
  adminUpdateProblem: (id, body) => api.put(`${BASE}/admin/problems/${id}`, body),
  adminDeleteProblem: (id) => api.delete(`${BASE}/admin/problems/${id}`),
  adminCreateContest: (body) => api.post(`${BASE}/admin/contests`, body),
  adminUpdateContest: (id, body) => api.put(`${BASE}/admin/contests/${id}`, body),
  adminDeleteContest: (id) => api.delete(`${BASE}/admin/contests/${id}`),
  adminContestAnalytics: (id) => api.get(`${BASE}/admin/contests/${id}/analytics`),
};
