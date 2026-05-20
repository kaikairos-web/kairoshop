const API = {
  async request(endpoint, options = {}) {
    const token = Auth.getToken();
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
    return data;
  },

  get(endpoint) {
    return this.request(endpoint);
  },

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  },

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  },

  patch(endpoint, body) {
    return this.request(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  async upload(endpoint, formData) {
    const token = Auth.getToken();
    const res = await fetch(`${CONFIG.API_BASE}${endpoint}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
};


