import axios from 'axios';
import toast from 'react-hot-toast';

const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          const { data } = await axios.post(`${API_BASE}/auth/refresh-token`, { refreshToken });
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
          return api(originalRequest);
        }
      } catch {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    const message = error.response?.data?.error || 'An error occurred';
    if (error.response?.status !== 401) {
      toast.error(message);
    }
    return Promise.reject(error);
  }
);

// Auth
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  refreshToken: (refreshToken: string) => api.post('/auth/refresh-token', { refreshToken }),
  forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data: { token: string; password: string }) => api.post('/auth/reset-password', data),
};

// User
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),
  getVehicles: () => api.get('/users/vehicles'),
  addVehicle: (data: any) => api.post('/users/vehicles', data),
  deleteVehicle: (id: string) => api.delete(`/users/vehicles/${id}`),
};

// Bookings
export const bookingAPI = {
  checkAvailability: (params?: any) => api.get('/bookings/availability', { params }),
  create: (data: any) => api.post('/bookings', data),
  getAll: (params?: any) => api.get('/bookings', { params }),
  getById: (id: string) => api.get(`/bookings/${id}`),
  cancel: (id: string) => api.put(`/bookings/${id}/cancel`),
  getQR: (id: string) => api.get(`/bookings/${id}/qrcode`),
};

// Parking
export const parkingAPI = {
  getRealTimeStatus: () => api.get('/parking/real-time-status'),
  processEntry: (data: any) => api.post('/parking/entry', data),
  processExit: (data: any) => api.post('/parking/exit', data),
  getNavigation: (slotId: string) => api.get(`/parking/navigation/${slotId}`),
};

// Admin
export const adminAPI = {
  getDashboardStats: () => api.get('/admin/dashboard-stats'),
  getUsageAnalytics: (params?: any) => api.get('/admin/analytics/usage', { params }),
  getRevenueAnalytics: (params?: any) => api.get('/admin/analytics/revenue', { params }),
  createZone: (data: any) => api.post('/admin/zones', data),
  updateZone: (id: string, data: any) => api.put(`/admin/zones/${id}`, data),
  getViolations: () => api.get('/admin/violations'),
  createViolation: (data: any) => api.post('/admin/violations', data),
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  toggleUserStatus: (id: string) => api.put(`/admin/users/${id}/toggle-status`),
};

// Payments
export const paymentAPI = {
  initiate: (data: any) => api.post('/payments/initiate', data),
  verify: (data: any) => api.post('/payments/verify', data),
  getHistory: (params?: any) => api.get('/payments/history', { params }),
};

// Notifications
export const notificationAPI = {
  getAll: (params?: any) => api.get('/notifications', { params }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
};

export default api;
