document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAdmin()) return;
  document.getElementById('admin-sidebar').innerHTML = Components.adminSidebar('Reports');
  document.getElementById('mobile-header-wrap').innerHTML = Components.mobileHeader('Reports');
  Components.bindGlobalEvents();
  UI.initSidebar();

  try {
    const { analytics: a } = await API.get('/admin/analytics');
    const months = Object.keys(a.salesByMonth);
    const sales = Object.values(a.salesByMonth);
    const cats = Object.keys(a.categoryStats);

    new Chart(document.getElementById('report-sales'), {
      type: 'bar',
      data: {
        labels: months.length ? months : ['N/A'],
        datasets: [{ label: 'Revenue', data: sales.length ? sales : [0], backgroundColor: '#22d3ee' }],
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

    new Chart(document.getElementById('report-categories'), {
      type: 'polarArea',
      data: {
        labels: cats.length ? cats : ['N/A'],
        datasets: [{
          data: cats.length ? Object.values(a.categoryStats) : [1],
          backgroundColor: ['#22d3ee88', '#38bdf888', '#818cf888', '#a78bfa88', '#f472b688', '#4ade8088'],
        }],
      },
      options: { plugins: { legend: { labels: { color: '#94a3b8' } } } },
    });
  } catch (err) {
    UI.toast(err.message, 'error');
  }
});

