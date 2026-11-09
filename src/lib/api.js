import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    /* storage blocked */
  }
  return config;
});

let onUnauthorized = null;
/** Called once by the auth store so an expired/invalid token logs the user out. */
export const setUnauthorizedHandler = (fn) => {
  onUnauthorized = fn;
};

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response && error.response.status;
    const isAuthCall = /\/auth\/(login|register)$/.test((error.config && error.config.url) || '');
    if (status === 401 && !isAuthCall && onUnauthorized) onUnauthorized();
    return Promise.reject(error);
  }
);

/** Human-readable message for any API error. */
export function apiMessage(error, fallback = 'Something went wrong. Please try again.') {
  if (!error) return fallback;
  if (error.code === 'ECONNABORTED') return 'The server took too long to respond. Please try again.';
  if (!error.response) return "Can't reach the server. Check your connection — the server may also be waking up (this can take up to a minute).";
  const data = error.response.data || {};
  return data.message || data.error || fallback;
}

export const apiCode = (error) => (error && error.response && error.response.data && error.response.data.code) || null;
export const apiStatus = (error) => (error && error.response && error.response.status) || null;

export default api;
