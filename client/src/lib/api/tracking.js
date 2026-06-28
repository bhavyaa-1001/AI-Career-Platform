import api from '@/lib/axios';
import axios from 'axios';

const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const trackingApi = {
  kanban: () => api.get('/jobs/tracking/kanban'),
  analytics: () => api.get('/jobs/tracking/analytics'),
  getDetail: (id) => api.get(`/jobs/tracking/applications/${id}`),
  updateStatus: (id, data) => api.patch(`/jobs/tracking/applications/${id}/status`, data),
  addNote: (id, text) => api.post(`/jobs/tracking/applications/${id}/notes`, { text }),
  updateNote: (id, noteId, text) => api.patch(`/jobs/tracking/applications/${id}/notes/${noteId}`, { text }),
  deleteNote: (id, noteId) => api.delete(`/jobs/tracking/applications/${id}/notes/${noteId}`),
  addAttachmentUrl: (id, data) => api.post(`/jobs/tracking/applications/${id}/attachments`, data),
  uploadAttachment: async (id, file) => {
    const token = localStorage.getItem('accessToken');
    const form = new FormData();
    form.append('file', file);
    const response = await axios.post(
      `${getBaseUrl()}/jobs/tracking/applications/${id}/attachments/upload`,
      form,
      {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'multipart/form-data',
        },
        withCredentials: true,
      },
    );
    return response.data;
  },
  deleteAttachment: (id, attachmentId) =>
    api.delete(`/jobs/tracking/applications/${id}/attachments/${attachmentId}`),
};

export const TRACK_STATUSES = [
  'applied',
  'assessment',
  'interview',
  'offer',
  'rejected',
  'withdrawn',
];

export const TRACK_STATUS_LABELS = {
  saved: 'Saved',
  applied: 'Applied',
  assessment: 'Assessment',
  interview: 'Interview',
  offer: 'Offer',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

export const KANBAN_COLUMNS = ['saved', ...TRACK_STATUSES];

export const TRACK_STATUS_COLORS = {
  saved: 'border-slate-300 bg-slate-50 dark:bg-slate-900/30',
  applied: 'border-blue-300 bg-blue-50 dark:bg-blue-950/30',
  assessment: 'border-violet-300 bg-violet-50 dark:bg-violet-950/30',
  interview: 'border-amber-300 bg-amber-50 dark:bg-amber-950/30',
  offer: 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30',
  rejected: 'border-red-300 bg-red-50 dark:bg-red-950/30',
  withdrawn: 'border-gray-300 bg-gray-50 dark:bg-gray-900/30',
};
