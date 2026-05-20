let salesChart;
let categoryChart;

document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAdmin()) return;

  document.getElementById('admin-sidebar').innerHTML = Components.adminSidebar('Dashboard');
  document.getElementById('mobile-header-wrap').innerHTML = Components.mobileHeader('Admin');
  Components.bindGlobalEvents();
  UI.initSidebar();

  try {
    const { analytics: a } = await API.get('/admin/analytics');

    document.getElementById('admin-stats').innerHTML = `
      <div class="glass-card stat-card"><div class="stat-label">Revenue</div><div class="stat-value">${UI.formatPrice(a.totalRevenue)}</div></div>
      <div class="glass-card stat-card"><div class="stat-label">Orders</div><div class="stat-value">${a.orderCount}</div></div>
      <div class="glass-card stat-card"><div class="stat-label">Products</div><div class="stat-value">${a.productCount}</div></div>
      <div class="glass-card stat-card"><div class="stat-label">Users</div><div class="stat-value">${a.userCount}</div></div>
      <div class="glass-card stat-card"><div class="stat-label">Pending</div><div class="stat-value">${a.pendingOrders}</div></div>
      <div class="glass-card stat-card"><div class="stat-label">Low Stock</div><div class="stat-value">${a.lowStockCount}</div></div>
    `;

    renderCharts(a.salesByMonth, a.categoryStats);
    renderRecentOrders(a.recentOrders);
    renderLowStock(a.lowStock);
  } catch (err) {
    UI.toast(err.message, 'error');
  }
});

function renderCharts(salesByMonth, categoryStats) {
  const months = Object.keys(salesByMonth);
  const sales = Object.values(salesByMonth);

  salesChart?.destroy();
  salesChart = new Chart(document.getElementById('sales-chart'), {
    type: 'line',
    data: {
      labels: months.length ? months : ['No data'],
      datasets: [{
        label: 'Sales',
        data: sales.length ? sales : [0],
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        fill: true,
        tension: 0.4,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#94a3b8' } } },
      scales: {
        x: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
        y: { ticks: { color: '#94a3b8' }, grid: { color: 'rgba(255,255,255,0.05)' } },
      },
    },
  });

  const cats = Object.keys(categoryStats);
  categoryChart?.destroy();
  categoryChart = new Chart(document.getElementById('category-chart'), {
    type: 'doughnut',
    data: {
      labels: cats.length ? cats : ['No data'],
      datasets: [{
        data: cats.length ? Object.values(categoryStats) : [1],
        backgroundColor: ['#22d3ee', '#38bdf8', '#818cf8', '#a78bfa', '#f472b6', '#4ade80'],
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { labels: { color: '#94a3b8' } } },
    },
  });
}

function renderRecentOrders(orders) {
  const el = document.getElementById('recent-orders');
  if (!orders.length) {
    el.innerHTML = '<p class="text-muted">No orders yet.</p>';
    return;
  }
  el.innerHTML = `
    <table>
      <thead><tr><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
      <tbody>
        ${orders.map((o) => `
          <tr>
            <td>${o.user?.full_name || o.user?.email || '—'}</td>
            <td>${UI.formatPrice(o.total_price)}</td>
            <td><span class="status-badge status-${o.status}">${o.status}</span></td>
            <td>${new Date(o.created_at).toLocaleDateString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function renderLowStock(items) {
  const el = document.getElementById('low-stock');
  if (!items.length) {
    el.innerHTML = '<p class="text-muted">All products well stocked.</p>';
    return;
  }
  el.innerHTML = items.map((p) => `<p>${p.name} — <span class="text-cyan">${p.stock} left</span> (${p.category})</p>`).join('');
}

