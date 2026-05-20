const AUTH_KEY = 'kairoshop_session';

const Auth = {
  saveSession(session, profile) {
    const data = {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      expires_at: session.expires_at,
      user: session.user,
      profile,
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('auth-change'));
  },

  getSession() {
    try {
      const raw = localStorage.getItem(AUTH_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  getToken() {
    return this.getSession()?.access_token || null;
  },

  getUser() {
    return this.getSession()?.user || null;
  },

  getProfile() {
    return this.getSession()?.profile || null;
  },

  isLoggedIn() {
    const s = this.getSession();
    if (!s?.access_token) return false;
    if (s.expires_at && s.expires_at * 1000 < Date.now()) {
      this.clear();
      return false;
    }
    return true;
  },

  isAdmin() {
    return this.getProfile()?.role === 'admin';
  },

  clear() {
    localStorage.removeItem(AUTH_KEY);
    window.dispatchEvent(new Event('auth-change'));
  },

  async login(email, password) {
    const data = await API.post('/auth/login', { email, password });
    if (data.session) this.saveSession(data.session, data.profile);
    return data;
  },

  async register(full_name, email, password) {
    const data = await API.post('/auth/register', { full_name, email, password });
    if (data.session) this.saveSession(data.session, data.profile);
    return data;
  },

  async logout() {
    try {
      await API.post('/auth/logout');
    } catch (_) { /* ignore */ }
    this.clear();
    window.location.href = '/index.html';
  },

  async forgotPassword(email) {
    return API.post('/auth/forgot-password', {
      email,
      redirect_to: `${window.location.origin}/reset-password.html`,
    });
  },

  requireAuth(redirect = '/login.html') {
    if (!this.isLoggedIn()) {
      window.location.href = redirect + '?redirect=' + encodeURIComponent(window.location.pathname);
      return false;
    }
    return true;
  },

  requireAdmin() {
    if (!this.requireAuth()) return false;
    if (!this.isAdmin()) {
      UI.toast('Admin access required', 'error');
      window.location.href = '/index.html';
      return false;
    }
    return true;
  },
};


