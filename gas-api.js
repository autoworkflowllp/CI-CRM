/* Chaitanya Impex CRM - GAS JSONP API client */

const API = 'https://script.google.com/macros/s/AKfycbxpWzdBXTk8CdfmSp-1NMjl0wAp2ZnDabTTbS7ICYtCLrExl_esWC0cJyIKh7SfaMZLUw/exec';

let TOKEN = localStorage.getItem('ci_token') || '';
let USER  = JSON.parse(localStorage.getItem('ci_user') || 'null');
let _cb = 0;

function api(action, data, ok, fail) {
  if (!API) { toast('GAS Web App URL is missing'); return; }

  const cb = '_gcb' + (++_cb);
  const script = document.createElement('script');

  const timer = setTimeout(() => {
    cleanup();
    fail && fail({ error: 'Request timed out' });
  }, 20000);

  function cleanup() {
    clearTimeout(timer);
    try { delete window[cb]; } catch (e) {}
    script.remove();
  }

  window[cb] = r => {
    cleanup();
    if (r && r.error === 'NOT_AUTHENTICATED') {
      toast('Session expired. Please login again.');
      logout();
      return;
    }
    ok && ok(r);
  };

  script.id = '_s_' + cb;
  script.onerror = () => { cleanup(); fail && fail({ error: 'Network error' }); };

  script.src = API +
    '?callback=' + encodeURIComponent(cb) +
    '&payload=' + encodeURIComponent(JSON.stringify({
      action: action,
      data: data || {},
      token: TOKEN || ''
    }));

  document.head.appendChild(script);
}

function setSession(user, token) {
  USER = user;
  TOKEN = token;
  localStorage.setItem('ci_user',  JSON.stringify(user));
  localStorage.setItem('ci_token', token);
}

function clearSession() {
  USER = null;
  TOKEN = '';
  localStorage.removeItem('ci_user');
  localStorage.removeItem('ci_token');
}
