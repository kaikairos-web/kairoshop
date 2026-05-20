document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;

  document.getElementById('user-sidebar').innerHTML = Components.userSidebar('Dashboard');
  document.getElementById('mobile-header-wrap').innerHTML = Components.mobileHeader('Dashboard');
  document.getElementById('bottom-nav').innerHTML = Components.bottomNav();
  Components.bindGlobalEvents();
  UI.initSidebar();

  const profile = Auth.getProfile();
  document.getElementById('tab-profile').innerHTML = `
    <h3>Profile</h3>
    <p><strong>Name:</strong> ${profile?.full_name || '—'}</p>
    <p><strong>Email:</strong> ${profile?.email || Auth.getUser()?.email}</p>
    <p><strong>Role:</strong> <span class="text-cyan">${profile?.role}</span></p>
    <p><strong>Member since:</strong> ${profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : '—'}</p>
  `;

  document.getElementById('settings-name').value = profile?.full_name || '';

  document.getElementById('settings-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const data = await API.put('/auth/profile', {
        full_name: document.getElementById('settings-name').value,
      });
      const session = Auth.getSession();
      Auth.saveSession(
        { access_token: session.access_token, refresh_token: session.refresh_token, expires_at: session.expires_at, user: session.user },
        data.profile
      );
      UI.toast('Profile updated');
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  });

  document.querySelectorAll('.tab-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('active'));
      document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
    });
  });

  try {
    const [ordersRes, cartRes, wishRes] = await Promise.all([
      API.get('/orders'),
      API.get('/cart'),
      API.get('/cart/wishlist'),
    ]);

    document.getElementById('user-stats').innerHTML = `
      <div class="glass-card stat-card"><div class="stat-label">Orders</div><div class="stat-value">${ordersRes.orders?.length || 0}</div></div>
      <div class="glass-card stat-card"><div class="stat-label">Cart Items</div><div class="stat-value">${cartRes.items?.length || 0}</div></div>
      <div class="glass-card stat-card"><div class="stat-label">Wishlist</div><div class="stat-value">${wishRes.items?.length || 0}</div></div>
    `;

    renderOrders(ordersRes.orders || []);
    renderWishlist(wishRes.items || []);
  } catch (err) {
    UI.toast(err.message, 'error');
  }
});

function renderOrders(orders) {
  const el = document.getElementById('tab-orders');
  if (!orders.length) {
    el.innerHTML = '<p class="text-muted">No orders yet. <a href="/products.html">Start shopping</a></p>';
    return;
  }
  el.innerHTML = `
    <table>
      <thead><tr><th>ID</th><th>Total</th><th>Status</th><th>Date</th><th></th></tr></thead>
      <tbody>
        ${orders.map((o) => `
          <tr>
            <td class="text-muted">#${o.id.slice(0, 8)}</td>
            <td>${UI.formatPrice(o.total_price)}</td>
            <td><span class="status-badge status-${o.status}">${o.status}</span></td>
            <td>${new Date(o.created_at).toLocaleDateString()}</td>
            <td>${o.status === 'pending' ? `<button class="btn btn-sm btn-danger btn-cancel-order" data-id="${o.id}">Cancel</button>` : ''}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
  el.querySelectorAll('.btn-cancel-order').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await API.post(`/orders/${btn.dataset.id}/cancel`);
        UI.toast('Order cancelled');
        location.reload();
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    });
  });
}

function renderWishlist(items) {
  const grid = document.getElementById('tab-wishlist');
  if (!items.length) {
    grid.innerHTML = '<p class="text-muted" style="grid-column:1/-1">Wishlist is empty.</p>';
    return;
  }
  const products = items.map((i) => i.product).filter(Boolean);
  Products.renderGrid(products, grid);
}

