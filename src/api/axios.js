import axios from 'axios';

const TOKEN_STORAGE_KEY = 'sep_auth_token';

const api = axios.create({
  baseURL: import.meta.env.PROD ? (import.meta.env.VITE_API_URL || '') : (import.meta.env.VITE_API_URL || 'http://localhost:5000'),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch {
    // localStorage unavailable
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    try {
      const url = response.config?.url || '';
      if (url.includes('/auth/logout')) {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
      } else if (response.data?.token) {
        localStorage.setItem(TOKEN_STORAGE_KEY, response.data.token);
      }
    } catch {
      // localStorage unavailable
    }
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (url.includes('/auth/me')) {
        try {
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        } catch {
          // ignore
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
