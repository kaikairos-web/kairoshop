document.addEventListener('DOMContentLoaded', async () => {
  if (!Auth.requireAdmin()) return;
  document.getElementById('admin-sidebar').innerHTML = Components.adminSidebar('Users');
  document.getElementById('mobile-header-wrap').innerHTML = Components.mobileHeader('Users');
  Components.bindGlobalEvents();
  UI.initSidebar();

  const el = document.getElementById('admin-users-table');
  try {
    const { users } = await API.get('/admin/users');
    el.innerHTML = `
      <table>
        <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Joined</th><th>Actions</th></tr></thead>
        <tbody>
          ${users.map((u) => `
            <tr data-id="${u.id}">
              <td>${u.full_name || '—'}</td>
              <td>${u.email}</td>
              <td>
                <select class="form-control user-role" style="width:auto;padding:0.35rem">
                  <option value="user" ${u.role === 'user' ? 'selected' : ''}>user</option>
                  <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>admin</option>
                </select>
              </td>
              <td>${u.is_blocked ? '<span class="status-badge status-cancelled">Blocked</span>' : '<span class="status-badge status-delivered">Active</span>'}</td>
              <td>${new Date(u.created_at).toLocaleDateString()}</td>
              <td>
                <button class="btn btn-sm btn-ghost btn-toggle-block">${u.is_blocked ? 'Unblock' : 'Block'}</button>
                <button class="btn btn-sm btn-primary btn-save-user">Save</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    el.querySelectorAll('.btn-toggle-block').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const row = btn.closest('tr');
        const { users: list } = await API.get('/admin/users');
        const user = list.find((u) => u.id === row.dataset.id);
        try {
          await API.patch(`/admin/users/${row.dataset.id}`, { is_blocked: !user.is_blocked });
          UI.toast('User updated');
          location.reload();
        } catch (err) {
          UI.toast(err.message, 'error');
        }
      });
    });

    el.querySelectorAll('.btn-save-user').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const row = btn.closest('tr');
        try {
          await API.patch(`/admin/users/${row.dataset.id}`, {
            role: row.querySelector('.user-role').value,
          });
          UI.toast('Role updated');
        } catch (err) {
          UI.toast(err.message, 'error');
        }
      });
    });
  } catch (err) {
    el.innerHTML = `<p class="text-muted">${err.message}</p>`;
  }
});

