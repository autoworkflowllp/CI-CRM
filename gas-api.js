/* Chaitanya Impex CRM — GAS JSONP API client (COMPLETE FIX) */

const GAS_URL = 'https://script.google.com/macros/s/AKfycbwPKol-u_CEg3dPUl2OigmqHCxq8d9Cg2NnC5BnVaKDtoAdlaTAxFRcMysjDs82JGgg_Q/exec';

let TOKEN = localStorage.getItem('ci_token') || '';
let USER  = JSON.parse(localStorage.getItem('ci_user') || 'null');
let _cb = 0;
let _sessionExpiredHandler = null;

/* ---------- Low-level JSONP caller ---------- */
function apiCall(action, data, onSuccess, onError) {
  const cb = '_gcb' + (++_cb) + '_' + Date.now();
  const script = document.createElement('script');

  const timer = setTimeout(() => {
    cleanup();
    onError && onError({ error: 'Request timed out' });
  }, 25000);

  function cleanup() {
    clearTimeout(timer);
    try { delete window[cb]; } catch (e) {}
    script.remove();
  }

  window[cb] = r => {
    cleanup();
    if (r && r.error === 'NOT_AUTHENTICATED') {
      clearSession();
      if (_sessionExpiredHandler) _sessionExpiredHandler();
      else if (typeof toast === 'function') toast('Session expired', 'Please login again', 'warning');
      return;
    }
    onSuccess && onSuccess(r);
  };

  script.id = '_s_' + cb;
  script.onerror = () => { cleanup(); onError && onError({ error: 'Network error - backend unreachable' }); };

  const payload = encodeURIComponent(JSON.stringify({
    action: action,
    data: data || {},
    token: TOKEN || ''
  }));

  script.src = GAS_URL + '?callback=' + encodeURIComponent(cb) + '&payload=' + payload;
  document.head.appendChild(script);
}

/* ---------- Promise wrapper ---------- */
function apiPromise(action, data) {
  return new Promise((resolve, reject) => apiCall(action, data, resolve, reject));
}

/* ---------- The API object app.js expects ---------- */
const API = {
  login(email, password)        { return apiPromise('login', { email, password }); },
  logout()                      { return apiPromise('logout', {}).finally(clearSession); },
  getAllData()                  { return apiPromise('getAllData', {}); },
  getSheet(sheet)               { return apiPromise('getSheetData', { sheet }); },
  create(sheet, key, data)      { return apiPromise('createRecord', { sheet, key, data }); },
  update(sheet, key, keyValue, data) { return apiPromise('updateRecord', { sheet, key, keyValue, data }); },
  remove(sheet, key, keyValue)  { return apiPromise('deleteRecord', { sheet, key, keyValue }); },
  changePassword(oldPassword, newPassword) { return apiPromise('changePassword', { oldPassword, newPassword }); },
  whoAmI()                      { return apiPromise('whoAmI', {}); }
};

/* ---------- Session helpers ---------- */
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

function isLoggedIn() { return !!(TOKEN && USER); }

function onSessionExpired(handler) { _sessionExpiredHandler = handler; }

/* ---------- Backend ping ---------- */
function probeBackend() {
  return new Promise(resolve => {
    const cb = '_gprobe_' + Date.now();
    const script = document.createElement('script');
    const timer = setTimeout(() => { cleanup(); resolve({ online: false, error: 'Timeout' }); }, 12000);

    function cleanup() {
      clearTimeout(timer);
      try { delete window[cb]; } catch (e) {}
      script.remove();
    }

    window[cb] = r => { cleanup(); resolve({ online: !!(r && r.success), data: r }); };
    script.onerror = () => { cleanup(); resolve({ online: false, error: 'Network error' }); };
    script.src = GAS_URL + '?callback=' + encodeURIComponent(cb) + '&_=' + Date.now();
    document.head.appendChild(script);
  });
}

/* ---------- Error describer ---------- */
function describeApiError(err) {
  if (!err) return 'Unknown error';
  if (typeof err === 'string') return err;
  return err.error || err.message || 'Something went wrong';
}

/* ---------- Data transformer ---------- */
const DataXform = {
  fullDataset(r) {
    if (!r || !r.data) return {};
    const out = {};
    Object.keys(r.data).forEach(sheet => {
      out[sheet] = (r.data[sheet] || []).map(row => DataXform.row(row));
    });
    return out;
  },
  row(row) {
    if (!row || typeof row !== 'object') return row;
    const out = {};
    Object.keys(row).forEach(k => {
      let v = row[k];
      if (v instanceof Date) v = v.toISOString().slice(0, 10);
      out[k] = v;
    });
    return out;
  }
};
