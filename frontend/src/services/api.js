import axios from 'axios';

const API_BASE_URL = 'https://deepresearch-ai-gwx.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject JWT access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token if invalid or expired
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/register' && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth endpoints
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Research endpoints
export const researchAPI = {
  create: (data) => api.post('/research', data),
  list: (params) => api.get('/research', { params }),
  getDetail: (id) => api.get(`/research/${id}`),
  getProgress: (id) => api.get(`/research/${id}/progress`),
  delete: (id) => api.delete(`/research/${id}`),
};

// Report & Followup endpoints
export const reportAPI = {
  getReport: (id) => api.get(`/research/${id}/report`),
  downloadPDF: (id) => `${API_BASE_URL}/research/${id}/download?token=${localStorage.getItem('token')}`,
  askFollowUp: (id, message) => api.post(`/research/${id}/follow-up`, { message }),
};

// Dashboard & User endpoints
export const dashboardAPI = {
  getStats: () => api.get('/dashboard'),
};

export const userAPI = {
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.post('/user/change-password', data),
};

export default api;
