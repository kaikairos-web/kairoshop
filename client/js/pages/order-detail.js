document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAuth()) return;
  document.getElementById('user-sidebar').innerHTML = Components.userSidebar('Orders');
  document.getElementById('mobile-header-wrap').innerHTML = Components.mobileHeader('Order Detail');
  Components.bindGlobalEvents();
  UI.initSidebar();

  const orderId = new URLSearchParams(location.search).get('id');
  const el = document.getElementById('order-detail-content');

  if (!orderId) {
    el.innerHTML = '<p class="text-muted">No order specified. <a href="/orders.html">Back to orders</a></p>';
    return;
  }

  try {
    const { order } = await API.get(`/orders/${orderId}`);

    const statusColors = {
      pending: 'warning', processing: 'blue', shipped: 'cyan',
      delivered: 'success', cancelled: 'danger',
    };

    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:1rem;margin-bottom:1.5rem;flex-wrap:wrap">
        <a href="/orders.html" class="btn btn-ghost btn-sm">← Back to Orders</a>
        <h1 class="page-title" style="margin:0">Order #${order.id.slice(0, 8).toUpperCase()}</h1>
        <span class="status-badge status-${order.status}">${order.status}</span>
      </div>

      <div style="display:grid;grid-template-columns:2fr 1fr;gap:1.5rem;align-items:start">

        <!-- Items -->
        <div class="glass-card">
          <h3 style="margin-bottom:1.25rem">Items</h3>
          ${(order.order_items || []).map((item) => `
            <div class="cart-item">
              <img
                src="${item.product?.image_url || '/assets/placeholder-bike.svg'}"
                alt="${item.product?.name || 'Product'}"
                onerror="this.src='/assets/placeholder-bike.svg'"
              >
              <div class="cart-item-info">
                <p style="font-weight:600">${item.product?.name || 'Unknown product'}</p>
                <p class="text-muted" style="font-size:0.875rem">Qty: ${item.quantity}</p>
              </div>
              <p style="font-weight:700;color:var(--cyan)">${UI.formatPrice(item.price * item.quantity)}</p>
            </div>
          `).join('')}
          <div class="summary-row total" style="margin-top:1rem">
            <span>Total</span>
            <span>${UI.formatPrice(order.total_price)}</span>
          </div>
        </div>

        <!-- Summary -->
        <div style="display:flex;flex-direction:column;gap:1rem">
          <div class="glass-card">
            <h3 style="margin-bottom:1rem">Order Info</h3>
            <div class="summary-row"><span>Order ID</span><span style="font-family:monospace;font-size:0.8rem">${order.id.slice(0, 8).toUpperCase()}</span></div>
            <div class="summary-row"><span>Date</span><span>${new Date(order.created_at).toLocaleDateString()}</span></div>
            <div class="summary-row"><span>Status</span><span class="status-badge status-${order.status}">${order.status}</span></div>
            <div class="summary-row"><span>Payment</span><span>${order.payment_status}</span></div>
          </div>

          ${order.shipping_address ? `
            <div class="glass-card">
              <h3 style="margin-bottom:0.75rem">Shipping Address</h3>
              <p class="text-muted" style="font-size:0.9rem;white-space:pre-line">${order.shipping_address}</p>
            </div>
          ` : ''}

          ${order.status !== 'delivered' && order.status !== 'cancelled' ? `
            <button class="btn btn-danger" id="btn-cancel-order">Cancel Order</button>
          ` : ''}
        </div>
      </div>
    `;

    document.getElementById('btn-cancel-order')?.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to cancel this order?')) return;
      try {
        await API.post(`/orders/${orderId}/cancel`);
        UI.toast('Order cancelled.');
        setTimeout(() => location.reload(), 1000);
      } catch (err) {
        UI.toast(err.message, 'error');
      }
    });

  } catch (err) {
    el.innerHTML = `<p class="text-muted">${err.message}. <a href="/orders.html">Back to orders</a></p>`;
  }
});
