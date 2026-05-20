document.addEventListener('DOMContentLoaded', () => {
  if (Auth.isLoggedIn()) {
    const redirect = new URLSearchParams(window.location.search).get('redirect') || '/dashboard.html';
    window.location.href = redirect;
    return;
  }

  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');

  loginForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = loginForm.querySelector('[type=submit]');
    btn.disabled = true;
    try {
      const data = await Auth.login(
        document.getElementById('email').value,
        document.getElementById('password').value
      );
      UI.toast('Welcome back!');
      const redirect = new URLSearchParams(window.location.search).get('redirect');
      if (data.profile?.role === 'admin') {
        window.location.href = redirect || '/admin/index.html';
      } else {
        window.location.href = redirect || '/dashboard.html';
      }
    } catch (err) {
      UI.toast(err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });

  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = registerForm.querySelector('[type=submit]');
    btn.disabled = true;
    try {
      const data = await Auth.register(
        document.getElementById('full_name').value,
        document.getElementById('email').value,
        document.getElementById('password').value
      );
      if (data.session) {
        UI.toast('Account created!');
        window.location.href = '/dashboard.html';
      } else {
        UI.toast('Check your email to confirm your account.');
        window.location.href = '/login.html';
      }
    } catch (err) {
      UI.toast(err.message, 'error');
    } finally {
      btn.disabled = false;
    }
  });

  document.getElementById('forgot-link')?.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = prompt('Enter your email for password reset:');
    if (!email) return;
    try {
      await Auth.forgotPassword(email);
      UI.toast('Reset email sent. Check your inbox.');
    } catch (err) {
      UI.toast(err.message, 'error');
    }
  });
});

