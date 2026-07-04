import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Send cookies for Google OAuth session
  timeout: 60000,
});

/** Attach JWT access token from localStorage to every request (if present). */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gavixa_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (r) => r,
  (err) => {
    // Pass through; components decide how to react.
    return Promise.reject(err);
  }
);

export function humanError(err) {
  if (!err) return 'Something went wrong.';
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  if (err.message) return err.message;
  return 'Something went wrong.';
}
