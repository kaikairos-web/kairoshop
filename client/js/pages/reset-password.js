document.addEventListener('DOMContentLoaded', () => {
  // Supabase sends the recovery token as a hash fragment: #access_token=...&type=recovery
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const accessToken = hash.get('access_token');
  const type = hash.get('type');

  const form = document.getElementById('reset-form');
  const errorMsg = document.getElementById('error-msg');
  const submitBtn = document.getElementById('submit-btn');

  function showError(msg) {
    errorMsg.textContent = msg;
    errorMsg.style.display = 'block';
  }

  if (!accessToken || type !== 'recovery') {
    showError('Invalid or expired reset link. Please request a new one.');
    submitBtn.disabled = true;
    return;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.style.display = 'none';

    const password = document.getElementById('password').value;
    const confirm = document.getElementById('confirm').value;

    if (password !== confirm) {
      showError('Passwords do not match.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Updating…';

    try {
      await API.post('/auth/reset-password', { access_token: accessToken, password });
      UI.toast('Password updated! Please log in.');
      setTimeout(() => { window.location.href = '/login.html'; }, 1500);
    } catch (err) {
      showError(err.message);
      submitBtn.disabled = false;
      submitBtn.textContent = 'Update Password';
    }
  });
});
