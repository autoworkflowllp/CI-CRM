const MODULES = [
  ['dashboard','Dashboard'],['leads','Leads'],['companies','Companies'],
  ['contacts','Contacts'],['deals','Deals'],['activities','Activities'],
  ['tasks','Tasks'],['products','Products'],['templates','Templates'],
  ['notes','Notes'],['users','Users'],['websites','Websites'],['settings','Config']
];

const SHEETS = {
  leads:{sheet:'Leads',title:'Leads',key:'Lead_ID',fields:['Date_Received','Source_ID','Website_ID','Company_Name','Contact_Name','Email','Phone','City','State','Country','Industry','Requirement','Quantity','Estimated_Value','Currency','Status','Stage_ID','Assigned_To','Priority','Tags','Message','Reference_Image_Link','Catalogue_Sent','Next_Followup_Date','Created_Date','Updated_Date']},
  companies:{sheet:'Companies',title:'Companies',key:'Company_ID',fields:['Company_Name','Industry','Company_Website','GST_No','Address','City','State','Country','Phone','Email','Account_Owner','Source_ID','Website_ID','Client_Type','Created_Date']},
  contacts:{sheet:'Contacts',title:'Contacts',key:'Contact_ID',fields:['Company_ID','Full_Name','Designation','Email','Phone','Alt_Phone','Is_Primary','Created_Date']},
  deals:{sheet:'Deals',title:'Deals',key:'Deal_ID',fields:['Deal_Name','Lead_ID','Company_ID','Contact_ID','Stage_ID','Value','Currency','Probability_%','Expected_Close_Date','Actual_Close_Date','Owner','Status','Lost_Reason','Created_Date']},
  activities:{sheet:'Activities',title:'Activities',key:'Activity_ID',fields:['Related_To_Type','Related_To_ID','Activity_Type','Subject','Notes','Activity_Date','Activity_Time','Duration_Min','Outcome','Next_Action','Next_Followup_Date','Assigned_To','Status']},
  tasks:{sheet:'Tasks',title:'Tasks',key:'Task_ID',fields:['Title','Description','Related_To_Type','Related_To_ID','Due_Date','Priority','Status','Assigned_To','Created_By','Created_Date']},
  products:{sheet:'Products',title:'Products',key:'Product_ID',fields:['Product_Name','Category','Website_ID','Fabric_Spec','HSN_Code','Unit','Unit_Price','Currency','Certification','Description','Stock_Status','Image_URL']},
  templates:{sheet:'Templates',title:'Templates',key:'Template_ID',fields:['Template_Name','Channel','Website_ID','Subject','Body','Category','Created_By']},
  notes:{sheet:'Notes',title:'Notes',key:'Note_ID',fields:['Related_To_Type','Related_To_ID','Note_Text','Created_By','Created_Date']},
  // Password_Hash intentionally excluded — managed via Change Password / admin only
  users:{sheet:'Users',title:'Users',key:'User_ID',fields:['Full_Name','Email','Phone','Role','Department','Status','Date_Joined','Last_Login']},
  websites:{sheet:'Websites',title:'Websites',key:'Website_ID',fields:['Website_Name','URL','Hosting_Platform','Focus_Category','Is_Active']},
  settings:{sheet:'Config',title:'Config',key:null,fields:['Config_Type','Value','Extra_Info','Is_Active']}
};

let DATA = {};
let CURRENT = 'dashboard';
let FORM_CTX = null;

/* ---------- utilities ---------- */
function $(id){return document.getElementById(id);}
function esc(v){return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));}
function toast(m){$('toast').textContent=m;$('toast').classList.remove('hidden');setTimeout(()=>$('toast').classList.add('hidden'),2500);}
function toggleMenu(){$('sidebar').classList.toggle('open');}

/* ---------- view switches ---------- */
function showLogin(){
  $('loginView').classList.remove('hidden');
  $('appView').classList.add('hidden');
  const p = $('loginPassword'); if (p) p.value = '';
}
function showApp(){
  $('loginView').classList.add('hidden');
  $('appView').classList.remove('hidden');
  $('userInfo').textContent = (USER.name || USER.email) + ' • ' + (USER.role || '');
  renderNav();
  renderPage();
}
function logout(){ clearSession(); DATA = {}; showLogin(); }

/* ---------- login ---------- */
$('loginForm').addEventListener('submit', e => {
  e.preventDefault();
  const errEl = $('loginError');
  errEl.style.color = '';
  errEl.textContent = 'Signing in...';

  api('login', {
    email: $('loginEmail').value,
    password: $('loginPassword').value
  }, r => {
    if (r && r.firstLogin) {
      errEl.style.color = '#16a34a';
      errEl.textContent = r.message || 'Password set. Please login again with the same password.';
      $('loginPassword').value = '';
      $('loginPassword').focus();
      return;
    }
    if (!r || !r.success) {
      errEl.style.color = '#dc2626';
      errEl.textContent = (r && r.error) || 'Login failed';
      return;
    }
    errEl.style.color = '';
    errEl.textContent = '';
    setSession(r.user, r.token);
    showApp();
    loadData();
  }, err => {
    errEl.style.color = '#dc2626';
    errEl.textContent = (err && err.error) || 'Network error';
  });
});

/* ---------- data ---------- */
function loadData(){
  api('getAllData', {}, r => {
    if (!r || !r.success) { toast((r && r.error) || 'Data load failed'); return; }
    DATA = r.data || {};
    renderPage();
  }, e => toast((e && e.error) || 'Data load failed'));
}

/* ---------- navigation ---------- */
function renderNav(){
  const role = String((USER && USER.role) || '').toLowerCase();
  const visible = MODULES.filter(m =>
    role === 'admin' || (m[0] !== 'users' && m[0] !== 'settings')
  );
  $('nav').innerHTML = visible.map(x =>
    `<button class="${CURRENT === x[0] ? 'active' : ''}" onclick="go('${x[0]}')">${x[1]}</button>`
  ).join('');
}

function go(v){ CURRENT = v; $('sidebar').classList.remove('open'); renderNav(); renderPage(); }
function rowsFor(k){ return DATA[SHEETS[k] && SHEETS[k].sheet] || []; }

function renderPage(){
  if (CURRENT === 'dashboard') return dashboard();
  tablePage(CURRENT);
}

/* ---------- dashboard ---------- */
function dashboard(){
  const leads = rowsFor('leads');
  const deals = rowsFor('deals');
  const tasks = rowsFor('tasks');
  const companies = rowsFor('companies');

  const openDeals = deals.filter(x => String(x.Status).toLowerCase() === 'open');
  const pipeline = openDeals.reduce((a, x) => a + Number(x.Value || 0), 0);
  const due = tasks.filter(x => {
    const s = String(x.Status).toLowerCase();
    return s !== 'completed' && s !== 'done';
  }).length;

  $('content').innerHTML = `
    <div class="page-title">
      <div><h1>Dashboard</h1><div class="sub">Chaitanya Impex CRM</div></div>
      <div class="actions">
        <button class="btn btn-secondary" onclick="loadData()">Refresh</button>
        <button class="btn btn-secondary" onclick="openChangePassword()">Change Password</button>
      </div>
    </div>
    <div class="stats">
      <div class="stat"><div class="l">Total Leads</div><div class="n">${leads.length}</div></div>
      <div class="stat"><div class="l">Companies</div><div class="n">${companies.length}</div></div>
      <div class="stat"><div class="l">Open Deals</div><div class="n">${openDeals.length}</div></div>
      <div class="stat"><div class="l">Open Tasks</div><div class="n">${due}</div></div>
    </div>
    <div class="card">
      <div class="card-head">
        <div class="card-title">Open Pipeline</div>
        <strong>₹ ${pipeline.toLocaleString('en-IN')}</strong>
      </div>
      <div class="empty">Use Leads, Deals, Activities and Tasks to manage the sales process.</div>
    </div>`;
}

/* ---------- table page ---------- */
function tablePage(k){
  const cfg = SHEETS[k];
  if (!cfg) { dashboard(); return; }
  const rows = rowsFor(k);
  const cols = cfg.fields.slice(0, 8);

  $('content').innerHTML = `
    <div class="page-title">
      <div><h1>${cfg.title}</h1><div class="sub">${rows.length} records</div></div>
      <div class="actions">
        <button class="btn btn-primary" onclick="openForm('${k}')">+ Add</button>
        <button class="btn btn-secondary" onclick="loadData()">Refresh</button>
        <button class="btn btn-secondary" onclick="openChangePassword()">Change Password</button>
      </div>
    </div>
    <div class="card"><div class="table-wrap">
      ${rows.length ? `
        <table>
          <thead><tr>
            <th>Actions</th>
            ${cols.map(c => `<th>${esc(c.replaceAll('_',' '))}</th>`).join('')}
          </tr></thead>
          <tbody>
            ${rows.map((r, idx) => `
              <tr>
                <td><button class="btn btn-secondary" onclick="editRow('${k}', ${idx})">Edit</button></td>
                ${cols.map(c => `<td>${esc(r[c])}</td>`).join('')}
              </tr>`).join('')}
          </tbody>
        </table>` : `<div class="empty">No records found.</div>`}
    </div></div>`;
}

function editRow(k, idx){
  const rows = rowsFor(k);
  openForm(k, rows[idx]);
}

/* ---------- form ---------- */
function openForm(k, row){
  row = row || null;
  const cfg = SHEETS[k];
  FORM_CTX = { k: k, row: row };

  $('modalTitle').textContent = (row ? 'Edit ' : 'Add ') + cfg.title;

  $('modalBody').innerHTML = `<div class="grid2">${cfg.fields.map(f => {
    const val = row ? (row[f] != null ? row[f] : '') : '';
    const type = /date/i.test(f) ? 'date'
               : /value|qty|quantity|probability|duration|price/i.test(f) ? 'number'
               : 'text';
    const isLong = ['Body','Description','Notes','Note_Text','Message','Requirement'].includes(f);
    const input = isLong
      ? `<textarea id="f_${f}" rows="4">${esc(val)}</textarea>`
      : `<input id="f_${f}" type="${type}" value="${esc(val)}">`;
    return `<div class="field"><label>${esc(f.replaceAll('_',' '))}</label>${input}</div>`;
  }).join('')}</div>`;

  $('modalSave').onclick = () => saveForm(k, row);
  $('modal').classList.remove('hidden');
}

function closeModal(){
  $('modal').classList.add('hidden');
  FORM_CTX = null;
}

function saveForm(k, row){
  const cfg = SHEETS[k];
  const data = {};
  cfg.fields.forEach(f => {
    const el = $('f_' + f);
    data[f] = el ? el.value : '';
  });
  if (row && cfg.key) data[cfg.key] = row[cfg.key];

  api(row ? 'updateRecord' : 'createRecord', {
    sheet: cfg.sheet,
    key: cfg.key,
    keyValue: row && cfg.key ? row[cfg.key] : '',
    data: data
  }, r => {
    if (!r || !r.success) { toast((r && r.error) || 'Save failed'); return; }
    closeModal();
    toast('Saved');
    loadData();
  }, e => toast((e && e.error) || 'Save failed'));
}

/* ---------- change password ---------- */
function openChangePassword(){
  $('modalTitle').textContent = 'Change Password';
  $('modalBody').innerHTML = `
    <div class="field"><label>Current Password</label>
      <input id="cp_old" type="password" autocomplete="current-password"></div>
    <div class="field"><label>New Password (min 6 chars)</label>
      <input id="cp_new" type="password" autocomplete="new-password"></div>
    <div class="field"><label>Confirm New Password</label>
      <input id="cp_confirm" type="password" autocomplete="new-password"></div>`;
  $('modalSave').onclick = submitChangePassword;
  $('modal').classList.remove('hidden');
}

function submitChangePassword(){
  const oldP  = $('cp_old').value;
  const newP  = $('cp_new').value;
  const confP = $('cp_confirm').value;

  if (!oldP || !newP || !confP) { toast('All fields are required'); return; }
  if (newP.length < 6)          { toast('New password must be at least 6 characters'); return; }
  if (newP !== confP)           { toast('New passwords do not match'); return; }

  api('changePassword', { oldPassword: oldP, newPassword: newP }, r => {
    if (!r || !r.success) { toast((r && r.error) || 'Failed'); return; }
    closeModal();
    toast('Password changed successfully');
  }, e => toast((e && e.error) || 'Failed'));
}

/* ---------- boot ---------- */
if (USER && TOKEN) { showApp(); loadData(); } else showLogin();
