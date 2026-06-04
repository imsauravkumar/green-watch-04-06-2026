// Utility to get the correct API base URL
// In production (Vercel), VITE_API_URL points to Railway backend
// In development, Vite proxy handles /api -> localhost:5000
export const API_BASE = import.meta.env.DEV ? '' : (import.meta.env.VITE_API_URL || '');

/**
 * Makes an authenticated fetch request.
 * Automatically prepends the API base URL in production.
 * 
 * @param {string} path - API path starting with /api/...
 * @param {RequestInit} options - Fetch options
 */
export const apiFetch = (path, options = {}) => {
  return fetch(`${API_BASE}${path}`, options);
};
