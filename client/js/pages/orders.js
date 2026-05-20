document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;
  document.getElementById('user-sidebar').innerHTML = Components.userSidebar('Orders');
  document.getElementById('mobile-header-wrap').innerHTML = Components.mobileHeader('Orders');
  Components.bindGlobalEvents();
  UI.initSidebar();

  const highlight = new URLSearchParams(location.search).get('order');
  if (highlight) UI.toast('Order placed successfully!');

  let currentPage = 1;
  const limit = 10;

  async function loadOrders(page = 1) {
    const el = document.getElementById('orders-table');
    el.innerHTML = '<div class="glass-card skeleton skeleton-card" style="height:200px"></div>';

    try {
      const { orders, pagination } = await API.get(`/orders?page=${page}&limit=${limit}`);

      if (!orders.length) {
        el.innerHTML = '<p class="text-muted" style="padding:1rem">No orders yet.</p>';
        return;
      }

      el.innerHTML = `
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Date</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${orders.map((o) => `
              <tr>
                <td><a href="/order-detail.html?id=${o.id}" style="font-family:monospace">#${o.id.slice(0, 8).toUpperCase()}</a></td>
                <td>${(o.order_items || []).map((i) => i.product?.name).filter(Boolean).join(', ') || '—'}</td>
                <td>${UI.formatPrice(o.total_price)}</td>
                <td><span class="status-badge status-${o.status}">${o.status}</span></td>
                <td>${o.payment_status}</td>
                <td>${new Date(o.created_at).toLocaleDateString()}</td>
                <td><a href="/order-detail.html?id=${o.id}" class="btn btn-sm btn-ghost">View</a></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${pagination && pagination.pages > 1 ? `
          <div class="pagination" style="display:flex;align-items:center;justify-content:center;gap:0.5rem;padding:1rem">
            <button class="btn btn-ghost btn-sm" id="btn-prev" ${page <= 1 ? 'disabled' : ''}>← Prev</button>
            <span class="text-muted" style="font-size:0.875rem">Page ${page} of ${pagination.pages}</span>
            <button class="btn btn-ghost btn-sm" id="btn-next" ${page >= pagination.pages ? 'disabled' : ''}>Next →</button>
          </div>
        ` : ''}
      `;

      document.getElementById('btn-prev')?.addEventListener('click', () => loadOrders(page - 1));
      document.getElementById('btn-next')?.addEventListener('click', () => loadOrders(page + 1));

    } catch (err) {
      document.getElementById('orders-table').innerHTML = `<p class="text-muted" style="padding:1rem">${err.message}</p>`;
    }
  }

  await loadOrders(currentPage);
});
