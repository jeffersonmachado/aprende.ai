const API_BASE = __API_BASE__;
const DEFAULT_TENANT_SLUG = (import.meta.env.VITE_TENANT_SLUG || 'demo').trim();

let authToken = typeof window !== 'undefined'
  ? window.localStorage.getItem('aprende_ai_token')
  : null;
let unauthorizedHandler = null;

function buildUrl(path) {
  const normalizedBase = API_BASE.replace(/\/$/, '');
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (normalizedBase.endsWith('/api') && normalizedPath.startsWith('/api/')) {
    return `${normalizedBase}${normalizedPath.slice(4)}`;
  }

  return `${normalizedBase}${normalizedPath}`;
}

async function request(path, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    'x-tenant-slug': DEFAULT_TENANT_SLUG,
    ...(options.headers || {})
  };

  if (authToken) {
    headers.Authorization = `Bearer ${authToken}`;
  }

  const res = await fetch(buildUrl(path), {
    headers,
    ...options
  });

  if (res.status === 401 && typeof unauthorizedHandler === 'function') {
    unauthorizedHandler();
  }

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error('Não autorizado. Sessao expirada ou nao autorizada. Faca login novamente.');
    }
    const text = await res.text();
    throw new Error(text || 'Erro na requisição');
  }
  return res.json();
}

export function setAuthToken(token) {
  authToken = token;
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export const api = {
  get: (path) => request(path),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) })
};

export default api;
