import API from '../config/api';

const BASE = API;

export const getAuthItem = (key) => sessionStorage.getItem(key) || localStorage.getItem(key);

export const setAuthItem = (key, value) => {
  if (sessionStorage.getItem('hms_token')) sessionStorage.setItem(key, value);
  else localStorage.setItem(key, value);
};

export const removeAuthItem = (key) => {
  sessionStorage.removeItem(key);
  localStorage.removeItem(key);
};

const getToken = () => getAuthItem('hms_token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
  ...(getAuthItem('hms_hostel_id') ? { 'X-Hostel-Id': getAuthItem('hms_hostel_id') } : {}),
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
