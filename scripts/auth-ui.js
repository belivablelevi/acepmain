/**
 * ACEP — Landing page sign-in / sign-up forms
 */
(function () {
  function showErr(el, msg) {
    if (!el) return;
    el.textContent = msg || '';
    el.hidden = !msg;
  }

  function getNextUrl() {
    const params = new URLSearchParams(window.location.search);
    const next = params.get('next');
    if (next && next.endsWith('.html')) return next;
    return 'dashboard.html';
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (window.acepAuth) {
      window.acepAuth.init({});
    }

    const formIn = document.getElementById('formSignIn');
    const formUp = document.getElementById('formSignUp');
    const errIn = document.getElementById('signInError');
    const errUp = document.getElementById('signUpError');
    const tabs = document.querySelectorAll('[data-auth-tab]');

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => {
        const target = tab.getAttribute('data-auth-tab');
        document.querySelectorAll('.auth-panel').forEach((p) => {
          p.hidden = p.getAttribute('data-panel') !== target;
        });
        tabs.forEach((t) => t.classList.toggle('is-active', t === tab));
      });
    });

    if (window.location.hash === '#sign-in') {
      document.querySelector('[data-auth-tab="sign-in"]')?.click();
    }

    formIn?.addEventListener('submit', async (e) => {
      e.preventDefault();
      showErr(errIn, '');
      const email = document.getElementById('signInEmail')?.value?.trim();
      const password = document.getElementById('signInPassword')?.value;
      if (!email || !password) {
        showErr(errIn, 'Please enter email and password.');
        return;
      }
      const btn = formIn.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      try {
        await window.acepAuth.login(email, password);
        window.location.href = getNextUrl();
      } catch (err) {
        showErr(errIn, err.message || 'Could not sign in.');
      } finally {
        if (btn) btn.disabled = false;
      }
    });

    formUp?.addEventListener('submit', async (e) => {
      e.preventDefault();
      showErr(errUp, '');
      const username = document.getElementById('signUpName')?.value?.trim();
      const email = document.getElementById('signUpEmail')?.value?.trim();
      const password = document.getElementById('signUpPassword')?.value;
      if (!username || !email || !password) {
        showErr(errUp, 'Please fill in all fields.');
        return;
      }
      if (password.length < 6) {
        showErr(errUp, 'Password should be at least 6 characters.');
        return;
      }
      const btn = formUp.querySelector('button[type="submit"]');
      if (btn) btn.disabled = true;
      try {
        await window.acepAuth.register(email, password, username);
        window.location.href = getNextUrl();
      } catch (err) {
        showErr(errUp, err.message || 'Could not create account.');
      } finally {
        if (btn) btn.disabled = false;
      }
    });
  });
})();
