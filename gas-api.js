/* Chaitanya Impex CRM - GAS JSONP API client */

const API = 'https://script.google.com/macros/s/AKfycbxqZpU0H-NP-pF7YUz1JMeBbGrwFnDpHk_vvV5b-XyTzH7DPAJ6YJyBU60BDxN9X8G7Hw/exec';

let TOKEN = localStorage.getItem('ci_token') || '';
let USER = JSON.parse(localStorage.getItem('ci_user') || 'null');
let _cb = 0;

function api(action, data, ok, fail) {

  if (!API) {
    toast('GAS Web App URL is missing');
    return;
  }

  const cb = '_gcb' + (++_cb);
  const script = document.createElement('script');

  const timer = setTimeout(() => {
    cleanup();
    fail && fail({ error: 'Request timed out' });
  }, 20000);

  function cleanup() {
    clearTimeout(timer);
    try {
      delete window[cb];
    } catch (e) {}
    script.remove();
  }

  window[cb] = r => {
    cleanup();

    if (r && r.error === 'NOT_AUTHENTICATED') {
      logout();
      return;
    }

    ok && ok(r);
  };

  script.id = '_s_' + cb;

  script.onerror = () => {
    cleanup();
    fail && fail({ error: 'Network error' });
  };

  script.src =
    API +
    '?callback=' +
    encodeURIComponent(cb) +
    '&payload=' +
    encodeURIComponent(
      JSON.stringify({
        action: action,
        data: data || {},
        token: TOKEN || ''
      })
    );

  document.head.appendChild(script);
}

function setSession(user, token) {
  USER = user;
  TOKEN = token;

  localStorage.setItem(
    'ci_user',
    JSON.stringify(user)
  );

  localStorage.setItem(
    'ci_token',
    token
  );
}

function clearSession() {
  USER = null;
  TOKEN = '';

  localStorage.removeItem('ci_user');
  localStorage.removeItem('ci_token');
}
