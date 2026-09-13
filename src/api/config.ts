const configuredDevApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim();

// Production is deliberately same-origin. The browser always calls /api and /media
// on the public website domain, so production availability never depends on CORS.
export const API_BASE_URL = import.meta.env.DEV
  ? (configuredDevApiBaseUrl || 'http://localhost:4000')
  : '';
