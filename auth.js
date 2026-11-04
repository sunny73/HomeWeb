'use strict';

(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  const accountButton = $('#account-button');
  const accountLabel = $('#account-label');
  const accountAvatar = $('#account-avatar');
  const accountMenu = $('#account-menu');
  const accountMenuAvatar = $('#account-menu-avatar');
  const accountMenuName = $('#account-menu-name');
  const accountMenuEmail = $('#account-menu-email');
  const logoutButton = $('#logout-button');

  const authDialog = $('#auth-dialog');
  const authForm = $('#auth-form');
  const authName = $('#auth-name');
  const authEmail = $('#auth-email');
  const authPassword = $('#auth-password');
  const authConfirm = $('#auth-confirm');
  const authMessage = $('#auth-message');
  const authSubmit = $('#auth-submit');
  const authTitle = $('#auth-title');
  const authSubtitle = $('#auth-subtitle');
  const authKicker = $('#auth-kicker');
  const passwordToggle = $('#auth-password-toggle');
  const authClose = $('[data-auth-close]');

  if (!accountButton || !authDialog || !authForm) return;

  const state = {
    user: null,
    mode: 'login',
    loading: false
  };

  const iconMarkup = (name) =>
    `<svg class="icon" aria-hidden="true"><use href="#i-${name}"/></svg>`;

  async function request(path, options = {}) {
    const config = {
      method: options.method || 'GET',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json'
      }
    };

    if (options.body !== undefined) {
      config.headers['Content-Type'] = 'application/json';
      config.body = JSON.stringify(options.body);
    }

    let response;
    try {
      response = await fetch(path, config);
    } catch {
      throw new Error('无法连接服务器，请确认后端已启动。');
    }

    let data = {};
    try {
      data = await response.json();
    } catch {
      /* Keep a readable fallback for empty or non-JSON responses. */
    }

    if (!response.ok) {
      const error = new Error(data?.error?.message || '请求失败，请稍后再试。');
      error.status = response.status;
      error.code = data?.error?.code;
      throw error;
    }

    return data;
  }

  function notify(message) {
    if (window.newsCompass && typeof window.newsCompass.toast === 'function') {
      window.newsCompass.toast(message);
    }
  }

  function initialFor(name, email) {
    const value = String(name || email || '知').trim();
    return Array.from(value)[0]?.toUpperCase() || '知';
  }

  function closeAccountMenu() {
    if (!accountMenu) return;
    accountMenu.hidden = true;
    accountButton.setAttribute('aria-expanded', 'false');
  }

  function toggleAccountMenu() {
    if (!accountMenu) return;
    const opening = accountMenu.hidden;
    accountMenu.hidden = !opening;
    accountButton.setAttribute('aria-expanded', String(opening));
  }

  function updateAccountUI() {
    const user = state.user;
    if (user) {
      accountButton.classList.add('is-logged-in');
      accountButton.setAttribute('aria-haspopup', 'menu');
      accountButton.setAttribute('aria-controls', 'account-menu');
      accountButton.setAttribute('aria-label', `账号菜单，${user.name}`);
      accountButton.setAttribute('aria-expanded', 'false');
      accountLabel.textContent = user.name;
      accountAvatar.textContent = initialFor(user.name, user.email);
      if (accountMenuAvatar) accountMenuAvatar.textContent = initialFor(user.name, user.email);
      if (accountMenuName) accountMenuName.textContent = user.name;
      if (accountMenuEmail) accountMenuEmail.textContent = user.email;
    } else {
      accountButton.classList.remove('is-logged-in');
      accountButton.setAttribute('aria-haspopup', 'dialog');
      accountButton.setAttribute('aria-controls', 'auth-dialog');
      accountButton.setAttribute('aria-label', '登录知闻');
      accountButton.setAttribute('aria-expanded', 'false');
      accountLabel.textContent = '登录';
      accountAvatar.innerHTML = iconMarkup('user');
      closeAccountMenu();
    }
  }

  function clearAuthError() {
    if (!authMessage) return;
    authMessage.hidden = true;
    authMessage.textContent = '';
  }

  function showAuthError(message) {
    if (!authMessage) return;
    authMessage.textContent = message;
    authMessage.hidden = false;
  }

  function setAuthLoading(loading) {
    state.loading = loading;
    authSubmit.disabled = loading;
    authSubmit.textContent = loading
      ? (state.mode === 'register' ? '正在创建…' : '正在登录…')
      : (state.mode === 'register' ? '创建账户' : '登录');
    authForm.setAttribute('aria-busy', String(loading));
  }

  function setMode(mode) {
    if (mode !== 'login' && mode !== 'register') return;
    state.mode = mode;
    const isRegister = mode === 'register';

    $$('.auth-tab', authDialog).forEach((tab) => {
      const active = tab.dataset.authMode === mode;
      tab.classList.toggle('is-active', active);
      tab.setAttribute('aria-pressed', String(active));
    });

    $$('[data-auth-register]', authDialog).forEach((field) => {
      field.hidden = !isRegister;
    });

    const passwordHint = $('[data-auth-password-hint]', authDialog);
    if (passwordHint) passwordHint.hidden = !isRegister;

    authKicker.textContent = isRegister ? 'CREATE AN ACCOUNT' : 'WELCOME BACK';
    authTitle.textContent = isRegister ? '创建账户' : '欢迎回来';
    authSubtitle.textContent = isRegister
      ? '注册后，你的阅读记录、收藏和关注频道会保存在同一个小角落里。'
      : '登录后，你的阅读轨迹和收藏会慢慢留在这里。';
    authPassword.setAttribute('autocomplete', isRegister ? 'new-password' : 'current-password');
    authSubmit.textContent = isRegister ? '创建账户' : '登录';
    clearAuthError();
  }

  function openAuth(mode = 'login') {
    closeAccountMenu();
    setMode(mode);
    authForm.reset();
    clearAuthError();
    if (authPassword) {
      authPassword.type = 'password';
      passwordToggle?.setAttribute('aria-pressed', 'false');
      passwordToggle?.setAttribute('aria-label', '显示密码');
      passwordToggle?.querySelector('use')?.setAttribute('href', '#i-eye');
    }
    if (!authDialog.open) {
      authDialog.showModal();
      document.body.classList.add('has-dialog');
    }
    window.setTimeout(() => {
      (mode === 'register' ? authName : authEmail)?.focus({ preventScroll: true });
    }, 60);
  }

  function closeAuthDialog() {
    if (authDialog.open) authDialog.close();
  }

  function validateAuthForm() {
    const email = authEmail.value.trim();
    const password = authPassword.value;
    const isRegister = state.mode === 'register';

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return { message: '请输入有效的邮箱地址。', field: authEmail };
    }

    if (isRegister) {
      const name = authName.value.trim();
      if (Array.from(name).length < 2) {
        return { message: '昵称至少需要 2 个字符。', field: authName };
      }
      if (password.length < 8) {
        return { message: '密码至少需要 8 位字符。', field: authPassword };
      }
      if (password !== authConfirm.value) {
        return { message: '两次输入的密码不一致。', field: authConfirm };
      }
    } else if (!password) {
      return { message: '请输入密码。', field: authPassword };
    }

    return null;
  }

  accountButton.addEventListener('click', (event) => {
    event.stopPropagation();
    if (state.user) {
      toggleAccountMenu();
    } else {
      openAuth('login');
    }
  });

  $$('.auth-tab', authDialog).forEach((tab) => {
    tab.addEventListener('click', () => {
      if (state.loading) return;
      setMode(tab.dataset.authMode);
    });
  });

  passwordToggle?.addEventListener('click', () => {
    const visible = authPassword.type === 'text';
    authPassword.type = visible ? 'password' : 'text';
    passwordToggle.setAttribute('aria-pressed', String(!visible));
    passwordToggle.setAttribute('aria-label', visible ? '显示密码' : '隐藏密码');
    passwordToggle.querySelector('use')?.setAttribute('href', visible ? '#i-eye' : '#i-eye-off');
  });

  authForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (state.loading) return;
    clearAuthError();

    const validation = validateAuthForm();
    if (validation) {
      showAuthError(validation.message);
      validation.field?.focus();
      return;
    }

    const isRegister = state.mode === 'register';
    const payload = {
      email: authEmail.value.trim().toLowerCase(),
      password: authPassword.value
    };
    if (isRegister) payload.name = authName.value.trim();

    setAuthLoading(true);
    try {
      const data = await request(isRegister ? '/api/auth/register' : '/api/auth/login', {
        method: 'POST',
        body: payload
      });
      state.user = data.user;
      updateAccountUI();
      closeAuthDialog();
      notify(isRegister ? `账户已创建，欢迎你，${data.user.name}。` : `欢迎回来，${data.user.name}。`);
    } catch (error) {
      showAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  });

  logoutButton?.addEventListener('click', async () => {
    logoutButton.disabled = true;
    try {
      await request('/api/auth/logout', { method: 'POST', body: {} });
      state.user = null;
      updateAccountUI();
      notify('已安全退出登录。');
    } catch (error) {
      notify(error.message);
    } finally {
      logoutButton.disabled = false;
      closeAccountMenu();
    }
  });

  authClose?.addEventListener('click', closeAuthDialog);
  authDialog.addEventListener('click', (event) => {
    if (event.target === authDialog) closeAuthDialog();
  });
  authDialog.addEventListener('close', () => {
    if (!document.querySelector('dialog[open]')) {
      document.body.classList.remove('has-dialog');
    }
  });

  document.addEventListener('click', (event) => {
    if (!accountMenu || accountMenu.hidden) return;
    if (!event.target.closest('.account-area')) closeAccountMenu();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeAccountMenu();
  });

  async function bootstrap() {
    try {
      const data = await request('/api/auth/me');
      state.user = data.user || null;
    } catch {
      state.user = null;
    }
    updateAccountUI();
  }

  updateAccountUI();
  bootstrap();
})();
