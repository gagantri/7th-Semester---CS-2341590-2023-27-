import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API_BASE = `${BACKEND_URL}/api`;

/**
 * Shared HTTP client for GavixaCare.
 *
 * Auth is fully cookie-based: the backend sets an httpOnly `session_token`
 * cookie on successful signup / login / OAuth callback. The browser sends it
 * automatically on subsequent requests when `withCredentials` is true. We
 * intentionally do NOT store tokens in localStorage — that would expose them
 * to XSS.
 */
export const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  timeout: 60000,
});

api.interceptors.response.use(
  (r) => r,
  (err) => Promise.reject(err)
);

export function humanError(err) {
  if (!err) return 'Something went wrong.';
  const detail = err.response?.data?.detail;
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  if (err.message) return err.message;
  return 'Something went wrong.';
}
