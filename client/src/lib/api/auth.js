import api from '../axios';

export const authApi = {
  register: (data) => api.post('/auth/register', data),
  verifySignupOtp: (data) => api.post('/auth/verify-signup-otp', data),
  resendSignupOtp: (email) => api.post('/auth/resend-signup-otp', { email }),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  logoutAll: () => api.post('/auth/logout-all'),
  refreshToken: () => api.post('/auth/refresh-token'),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: () => api.post('/auth/resend-verification'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  changePassword: (data) => api.patch('/auth/change-password', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.patch('/auth/profile', data),
  uploadAvatar: (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    return api.post('/auth/profile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};
