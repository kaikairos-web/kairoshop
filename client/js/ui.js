const UI = {
  toast(message, type = 'success') {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
  },

  showLoader() {
    let loader = document.querySelector('.page-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.className = 'page-loader';
      loader.innerHTML = '<div class="loader-spinner"></div>';
      document.body.prepend(loader);
    }
    loader.classList.remove('hidden');
  },

  hideLoader() {
    document.querySelector('.page-loader')?.classList.add('hidden');
  },

  formatPrice(price) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(price);
  },

  stockStatus(stock) {
    if (stock <= 0) return { class: 'stock-out', text: 'Out of Stock' };
    if (stock < 10) return { class: 'stock-low', text: `Low Stock (${stock})` };
    return { class: 'stock-in', text: 'In Stock' };
  },

  stars(rating) {
    const full = Math.floor(rating);
    return '★'.repeat(full) + '☆'.repeat(5 - full);
  },

  openModal(id) {
    document.getElementById(id)?.classList.add('active');
    document.body.style.overflow = 'hidden';
  },

  closeModal(id) {
    document.getElementById(id)?.classList.remove('active');
    document.body.style.overflow = '';
  },

  initModals() {
    document.querySelectorAll('[data-modal-close]').forEach((el) => {
      el.addEventListener('click', () => {
        const modal = el.closest('.modal-overlay');
        if (modal) {
          modal.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });
    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      });
    });
  },

  initSidebar() {
    const toggle = document.querySelector('.menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.querySelector('.sidebar-overlay');

    toggle?.addEventListener('click', () => {
      sidebar?.classList.toggle('open');
      overlay?.classList.toggle('active');
    });

    overlay?.addEventListener('click', () => {
      sidebar?.classList.remove('open');
      overlay?.classList.remove('active');
    });

    document.querySelectorAll('.sidebar .nav-link').forEach((link) => {
      link.addEventListener('click', () => {
        sidebar?.classList.remove('open');
        overlay?.classList.remove('active');
      });
    });
  },

  setActiveNav() {
    const path = window.location.pathname;
    document.querySelectorAll('.nav-link, .bottom-nav a').forEach((link) => {
      const href = link.getAttribute('href');
      if (href && (path === href || path.endsWith(href))) {
        link.classList.add('active');
      }
    });
  },

  skeletonGrid(count = 6) {
    return Array(count)
      .fill('')
      .map(() => '<div class="glass-card skeleton skeleton-card"></div>')
      .join('');
  },
};

document.addEventListener('DOMContentLoaded', () => {
  UI.initModals();
  UI.initSidebar();
  UI.setActiveNav();
  setTimeout(() => UI.hideLoader(), 400);
});


