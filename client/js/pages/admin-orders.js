document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAdmin()) return;
  document.getElementById('admin-sidebar').innerHTML = Components.adminSidebar('Orders');
  document.getElementById('mobile-header-wrap').innerHTML = Components.mobileHeader('Orders');
  Components.bindGlobalEvents();
  UI.initSidebar();

  const el = document.getElementById('admin-orders-table');
  try {
    const { orders } = await API.get('/orders');
    el.innerHTML = `
      <table>
        <thead><tr><th>Customer</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th><th>Actions</th></tr></thead>
        <tbody>
          ${orders.map((o) => `
            <tr data-id="${o.id}">
              <td>${o.user?.full_name || o.user?.email || '—'}</td>
              <td>${UI.formatPrice(o.total_price)}</td>
              <td>
                <select class="form-control order-status" style="width:auto;padding:0.35rem">
                  ${['pending','processing','shipped','delivered','cancelled'].map((s) =>
                    `<option value="${s}" ${s === o.status ? 'selected' : ''}>${s}</option>`
                  ).join('')}
                </select>
              </td>
              <td>
                <select class="form-control payment-status" style="width:auto;padding:0.35rem">
                  ${['pending','paid','failed','refunded'].map((s) =>
                    `<option value="${s}" ${s === o.payment_status ? 'selected' : ''}>${s}</option>`
                  ).join('')}
                </select>
              </td>
              <td>${new Date(o.created_at).toLocaleDateString()}</td>
              <td><button class="btn btn-sm btn-primary btn-save-order">Update</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    el.querySelectorAll('.btn-save-order').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const row = btn.closest('tr');
        try {
          await API.patch(`/orders/${row.dataset.id}/status`, {
            status: row.querySelector('.order-status').value,
            payment_status: row.querySelector('.payment-status').value,
          });
          UI.toast('Order updated');
        } catch (err) {
          UI.toast(err.message, 'error');
        }
      });
    });
  } catch (err) {
    el.innerHTML = `<p class="text-muted">${err.message}</p>`;
  }
});

