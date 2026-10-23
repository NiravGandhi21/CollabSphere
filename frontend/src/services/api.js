/**
 * CollabSphere API Service Layer — Phase 2 & 4 (Real Backend & Resilience)
 *
 * Provides a configured fetch wrapper that:
 *  - Points to VITE_API_URL (http://localhost:5000/api by default)
 *  - Attaches the Authorization: Bearer <token> header automatically
 *  - Purges invalidated tokens on session rejection (401 on /auth/me)
 *  - Throws ApiError with HTTP status on non-2xx responses
 */

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api');

// ── Token storage (localStorage) ─────────────────────────────────────────────
export const TOKEN_KEY = 'cs_token';

export function getStoredToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// ── Custom error class ────────────────────────────────────────────────────────
export class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ── Core fetch wrapper ────────────────────────────────────────────────────────
/**
 * @param {string} path      - e.g. '/auth/login'
 * @param {RequestInit} opts - fetch options (method, body, etc.)
 * @returns {Promise<any>}   - parsed JSON response
 */
export async function apiFetch(path, opts = {}) {
  const token = getStoredToken();

  const headers = {
    'Content-Type': 'application/json',
    ...(opts.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...opts,
    headers,
  });

  // Parse body regardless of status (errors carry JSON messages)
  let data;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = { message: await res.text() };
  }

  if (!res.ok) {
    // If session validation endpoint returns 401, purge invalid token immediately
    if (res.status === 401 && path === '/auth/me') {
      setStoredToken(null);
    }
    throw new ApiError(data.message || 'Something went wrong', res.status);
  }

  return data;
}

// Legacy compat: delay used in old mock services
export const delay = () => Promise.resolve();
