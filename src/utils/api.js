// Shared API utility — attaches JWT token to every request automatically
// BASE is relative so it works through the Vite proxy on any host/IP

const BASE = '/api';

const getToken = () => localStorage.getItem('hms_token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...(localStorage.getItem('hms_hostel_id') ? { 'X-Hostel-Id': localStorage.getItem('hms_hostel_id') } : {}),
});

const handleResponse = async (r) => {
  const data = await r.json().catch(() => ({}));
  if (!r.ok) {
    return {
      error: true,
      message: data.message || `Error: ${r.status} ${r.statusText}`,
    };
  }
  return data;
};

export const api = {
  get: (path) =>
    fetch(`${BASE}${path}`, { headers: authHeaders() }).then(handleResponse),

  post: (path, body) =>
    fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  put: (path, body) =>
    fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  patch: (path, body) =>
    fetch(`${BASE}${path}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  delete: (path) =>
    fetch(`${BASE}${path}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handleResponse),

  download: (path) =>
    fetch(`${BASE}${path}`, { headers: authHeaders() }).then(r => {
      if (!r.ok) throw new Error(`${r.status}: ${r.statusText}`);
      return r.blob();
    }),

  upload: (path, formData) =>
    fetch(`${BASE}${path}`, {
      method: 'POST',
      headers: { ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}) },
      body: formData,
    }).then(handleResponse),
};
