import api from '@/lib/axios';
import axios from 'axios';

const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

export const coverLetterApi = {
  status: () => api.get('/cover-letters/status'),
  list: (params) => api.get('/cover-letters', { params }),
  get: (id) => api.get(`/cover-letters/${id}`),
  generate: (data) => api.post('/cover-letters/generate', data, { timeout: 120000 }),
  update: (id, body) => api.put(`/cover-letters/${id}`, { body }),
  remove: (id) => api.delete(`/cover-letters/${id}`),
  downloadPdf: async (id) => {
    const token = localStorage.getItem('accessToken');
    const response = await axios.get(`${getBaseUrl()}/cover-letters/${id}/pdf`, {
      responseType: 'blob',
      timeout: 120000,
      withCredentials: true,
      headers: { Authorization: token ? `Bearer ${token}` : '' },
    });
    if (response.data.type === 'application/json') {
      const text = await response.data.text();
      const json = JSON.parse(text);
      throw new Error(json.message || 'PDF download failed');
    }
    const header = await response.data.slice(0, 4).text();
    if (!header.startsWith('%PDF')) throw new Error('PDF download failed');
    const disposition = response.headers['content-disposition'] || '';
    const match = disposition.match(/filename="?([^";\n]+)"?/);
    const filename = match ? decodeURIComponent(match[1]) : 'cover-letter.pdf';
    const blob = response.data.type === 'application/pdf'
      ? response.data
      : new Blob([response.data], { type: 'application/pdf' });
    return { blob, filename };
  },
};

export const triggerBlobDownload = ({ blob, filename }) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
