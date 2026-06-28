import api from '../axios';

export const dashboardApi = {
  getDashboard: () => api.get('/dashboard'),
};
