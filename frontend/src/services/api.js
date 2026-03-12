const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3015';
const TENANT_SLUG = import.meta.env.VITE_TENANT_SLUG || 'demo';

let authToken = localStorage.getItem('aprende_ai_token');
let unauthorizedHandler = null;

export function setAuthToken(token) {
  authToken = token;
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'x-tenant-slug': TENANT_SLUG,
    ...(options.headers || {})
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers
  });

  const contentType = response.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await response.json() : null;

  if (response.status === 401 && typeof unauthorizedHandler === 'function') {
    unauthorizedHandler();
  }

  if (!response.ok) {
    throw new Error(data?.error || 'Erro na requisição');
  }

  return data;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) })
};
