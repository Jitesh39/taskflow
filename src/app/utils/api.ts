import axios from 'axios';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://taskflow-backend-ghl9.onrender.com';

const api = axios.create({
  baseURL: `${BASE_URL}/api`,
  withCredentials: true,
});


api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        localStorage.clear();
        // Only redirect to login if we're not already there to avoid infinite loops
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;

