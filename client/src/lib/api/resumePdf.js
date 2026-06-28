import axios from 'axios';

const getBaseUrl = () => import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1';

const parseBlobError = async (blob) => {
  try {
    const text = await blob.text();
    const json = JSON.parse(text);
    return json.message || 'PDF download failed';
  } catch {
    return 'PDF download failed';
  }
};

export const downloadResumePdf = async (id, override = null) => {
  const token = localStorage.getItem('accessToken');
  const hasOverride = override && Object.keys(override).length > 0;
  const url = `${getBaseUrl()}/resumes/${id}/pdf`;

  const response = hasOverride
    ? await axios.post(url, override, {
        responseType: 'blob',
        timeout: 120000,
        withCredentials: true,
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      })
    : await axios.get(url, {
        responseType: 'blob',
        timeout: 120000,
        withCredentials: true,
        headers: { Authorization: token ? `Bearer ${token}` : '' },
      });

  if (response.data.type === 'application/json') {
    throw new Error(await parseBlobError(response.data));
  }

  const disposition = response.headers['content-disposition'] || '';
  const match = disposition.match(/filename="?([^";\n]+)"?/);
  const filename = match ? decodeURIComponent(match[1]) : 'resume.pdf';

  return { blob: response.data, filename };
};

export const triggerPdfDownload = ({ blob, filename }) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};
