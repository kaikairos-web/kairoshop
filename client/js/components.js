const Components = {
  icons: {
    home:      '<i class="bi bi-house-door-fill"></i>',
    shop:      '<i class="bi bi-bag-fill"></i>',
    cart:      '<i class="bi bi-cart3"></i>',
    user:      '<i class="bi bi-person-fill"></i>',
    search:    '<i class="bi bi-search"></i>',
    heart:     '<i class="bi bi-heart"></i>',
    menu:      '<i class="bi bi-list"></i>',
    dashboard: '<i class="bi bi-grid-fill"></i>',
    orders:    '<i class="bi bi-receipt"></i>',
    settings:  '<i class="bi bi-gear-fill"></i>',
    logout:    '<i class="bi bi-box-arrow-right"></i>',
    box:       '<i class="bi bi-box-seam-fill"></i>',
    users:     '<i class="bi bi-people-fill"></i>',
    chart:     '<i class="bi bi-bar-chart-fill"></i>',
  },

  productCard(product, options = {}) {
    const stock = UI.stockStatus(product.stock);
    const img = product.image_url || '/assets/placeholder-bike.svg';
    return `
      <article class="glass-card product-card" data-id="${product.id}">
        <a href="/product-detail.html?id=${product.id}">
          <img class="product-image" src="${img}" alt="${product.name}"
            onerror="this.src='https://images.unsplash.com/photo-1485965120181-e220f721d03f?w=400'">
        </a>
        <a href="/product-detail.html?id=${product.id}">
          <h3 class="product-name">${product.name}</h3>
        </a>
        <div class="product-rating">${UI.stars(product.rating)} <span class="text-muted">${product.rating}</span></div>
        <p class="product-price">${UI.formatPrice(product.price)}</p>
        <span class="stock-badge ${stock.class}">${stock.text}</span>
        <div class="product-actions">
          <button class="btn btn-primary btn-add-cart" data-id="${product.id}" ${product.stock < 1 ? 'disabled' : ''}>
            Add to Cart
          </button>
          <button class="wishlist-btn" data-id="${product.id}" title="Wishlist">${this.icons.heart}</button>
        </div>
      </article>
    `;
  },

  publicHeader() {
    const loggedIn = Auth.isLoggedIn();
    const isAdmin = Auth.isAdmin();
    return `
      <header class="site-header glass">
        <a href="/index.html" class="sidebar-logo"><img src="/assets/LOGO.png" alt="KairoShop" class="site-logo-img"> <span class="logo-name">KairoShop</span></a>
        <div class="header-search">
          <i class="bi bi-search header-search-icon"></i>
          <input type="search" id="global-search" placeholder="Search bike parts..." aria-label="Search">
        </div>
        <div class="header-actions">
          ${loggedIn ? `
            <a href="/dashboard.html" class="btn btn-ghost hide-mobile">Dashboard</a>
            ${isAdmin ? '<a href="/admin/index.html" class="btn btn-ghost hide-mobile">Admin</a>' : ''}
            <button class="btn btn-ghost" id="btn-logout">Logout</button>
          ` : `
            <a href="/login.html" class="btn btn-ghost">Login</a>
            <a href="/register.html" class="btn btn-primary">Register</a>
          `}
          <a href="/cart.html" class="btn btn-icon btn-ghost" aria-label="Cart">
            ${this.icons.cart}
            <span class="cart-badge" id="cart-count" style="display:none">0</span>
          </a>
        </div>
      </header>
    `;
  },

  bottomNav() {
    return `
      <nav class="bottom-nav glass">
        <a href="/index.html">${this.icons.home} Home</a>
        <a href="/products.html">${this.icons.shop} Shop</a>
        <a href="/cart.html">${this.icons.cart} Cart</a>
        <a href="${Auth.isLoggedIn() ? '/dashboard.html' : '/login.html'}">${this.icons.user} Account</a>
      </nav>
    `;
  },

  userSidebar(active = '') {
    const links = [
      { href: '/dashboard.html', icon: 'dashboard', label: 'Dashboard' },
      { href: '/orders.html', icon: 'orders', label: 'Orders' },
      { href: '/cart.html', icon: 'cart', label: 'Cart' },
      { href: '/products.html', icon: 'shop', label: 'Shop' },
      { href: '/index.html', icon: 'home', label: 'Home' },
    ];
    return `
      <aside class="sidebar glass">
        <a href="/index.html" class="sidebar-logo"><img src="/assets/LOGO.png" alt="KairoShop" class="site-logo-img"> <span class="logo-name">KairoShop</span></a>
        <nav class="sidebar-nav">
          ${links.map((l) => `
            <a href="${l.href}" class="nav-link ${active === l.label ? 'active' : ''}">
              ${this.icons[l.icon]} ${l.label}
            </a>
          `).join('')}
        </nav>
        <button class="btn btn-ghost" id="btn-logout" style="margin-top:auto">${this.icons.logout} Logout</button>
      </aside>
      <div class="sidebar-overlay"></div>
    `;
  },

  adminSidebar(active = '') {
    const links = [
      { href: '/admin/index.html', icon: 'dashboard', label: 'Dashboard' },
      { href: '/admin/products.html', icon: 'box', label: 'Products' },
      { href: '/admin/orders.html', icon: 'orders', label: 'Orders' },
      { href: '/admin/users.html', icon: 'users', label: 'Users' },
      { href: '/admin/reports.html', icon: 'chart', label: 'Reports' },
      { href: '/index.html', icon: 'home', label: 'Store' },
    ];
    return `
      <aside class="sidebar glass">
        <a href="/admin/index.html" class="sidebar-logo"><img src="/assets/LOGO.png" alt="KairoShop Admin" class="site-logo-img"> <span class="logo-name">KairoShop</span></a>
        <nav class="sidebar-nav">
          ${links.map((l) => `
            <a href="${l.href}" class="nav-link ${active === l.label ? 'active' : ''}">
              ${this.icons[l.icon]} ${l.label}
            </a>
          `).join('')}
        </nav>
        <button class="btn btn-ghost" id="btn-logout" style="margin-top:auto">${this.icons.logout} Logout</button>
      </aside>
      <div class="sidebar-overlay"></div>
    `;
  },

  mobileHeader(title = 'KairoShop') {
    return `
      <div class="mobile-header glass">
        <button class="menu-toggle" aria-label="Menu">${this.icons.menu}</button>
        <span class="sidebar-logo" style="margin:0">${title}</span>
        <a href="/cart.html" class="btn btn-icon btn-ghost">${this.icons.cart}</a>
      </div>
    `;
  },

  injectPublicLayout() {
    const header = document.getElementById('site-header');
    if (header) header.innerHTML = this.publicHeader();
    const bottom = document.getElementById('bottom-nav');
    if (bottom) bottom.innerHTML = this.bottomNav();
    this.bindGlobalEvents();
  },

  bindGlobalEvents() {
    document.getElementById('btn-logout')?.addEventListener('click', () => Auth.logout());
    document.getElementById('global-search')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        window.location.href = `/products.html?search=${encodeURIComponent(e.target.value)}`;
      }
    });
    if (typeof Cart !== 'undefined') Cart.updateBadge();
  },
};


