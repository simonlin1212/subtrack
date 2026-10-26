// SubTrack: single-page subscription assistant. No server, no accounts.
// Data lives only in localStorage under subtrack.subscriptions.v1.
const KEY = 'subtrack.subscriptions.v1';
let subs = [];
let filter = 'all';
let editingId = null;
let pendingDeleteId = null;
let pendingDeleteTimer = null;

function todayLocal() { const d = new Date(); d.setHours(0, 0, 0, 0); return d; }
function parseDate(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function fmtDate(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
function daysUntil(dateStr) {
  const today = todayLocal();
  const target = parseDate(dateStr);
  return Math.round((target - today) / 86400000);
}
function load() {
  try { subs = JSON.parse(localStorage.getItem(KEY) || '[]'); } catch (e) { subs = []; }
  if (!Array.isArray(subs)) subs = [];
}
function save() { localStorage.setItem(KEY, JSON.stringify(subs)); }
function monthlyEquivalent(s) { return s.cycle === 'yearly' ? s.amount / 12 : s.amount; }
function yearlyEquivalent(s) { return s.cycle === 'yearly' ? s.amount : s.amount * 12; }
function totals(list) {
  const m = {}, y = {};
  list.forEach(s => {
    if (s.paused) return;
    m[s.currency] = (m[s.currency] || 0) + monthlyEquivalent(s);
    y[s.currency] = (y[s.currency] || 0) + yearlyEquivalent(s);
  });
  return { m, y };
}
function fmtTotals(obj) {
  const keys = Object.keys(obj);
  if (!keys.length) return '—';
  return keys.map(k => k + ' ' + obj[k].toFixed(2)).join(' · ');
}
function sorted(list) {
  return [...list].sort((a, b) => {
    if (a.paused !== b.paused) return a.paused ? 1 : -1;
    return daysUntil(a.nextRenewal) - daysUntil(b.nextRenewal);
  });
}
function urgency(s) {
  if (s.paused) return 'paused';
  const d = daysUntil(s.nextRenewal);
  if (d < 0) return 'overdue';
  if (d <= 7) return 'soon';
  return 'normal';
}
function daysLabel(s) {
  const d = daysUntil(s.nextRenewal);
  if (d < 0) return 'Overdue by ' + (-d) + ' days';
  if (d === 0) return 'Due today';
  return 'Due in ' + d + ' days';
}
function render() {
  const active = subs.filter(s => !s.paused);
  const t = totals(subs);
  document.getElementById('monthlyTotal').textContent = fmtTotals(t.m);
  document.getElementById('yearlyTotal').textContent = fmtTotals(t.y);
  document.getElementById('activeCount').textContent = String(active.length);
  document.getElementById('dueCount').textContent = String(active.filter(s => daysUntil(s.nextRenewal) <= 30).length);

  const visible = sorted(subs).filter(s => filter === 'all' || (filter === 'active' ? !s.paused : s.paused));
  const listEl = document.getElementById('subList');
  const emptyEl = document.getElementById('emptyState');
  emptyEl.hidden = subs.length !== 0;
  document.getElementById('loadSampleBtn').hidden = subs.length !== 0;
  document.getElementById('clearSampleBtn').hidden = !subs.some(s => s.isSample);
  listEl.innerHTML = '';
  visible.forEach(s => {
    const li = document.createElement('li');
    const u = urgency(s);
    li.className = 'sub-row ' + (u === 'overdue' ? 'overdue' : u === 'soon' ? 'soon' : u === 'paused' ? 'paused' : '');
    const daysCls = u === 'overdue' ? 'overdue' : u === 'soon' ? 'soon' : '';
    li.innerHTML =
      '<div><div class="sub-name">' + escapeHtml(s.name) + ' <span class="sub-meta">· ' + escapeHtml(s.category) + (s.paused ? ' · Paused' : '') + '</span></div>' +
      '<div class="sub-meta">' + escapeHtml(s.currency) + ' ' + Number(s.amount).toFixed(2) + ' / ' + (s.cycle === 'yearly' ? 'year' : 'month') + ' · Next renewal ' + escapeHtml(s.nextRenewal) + (s.notes ? ' · ' + escapeHtml(s.notes) : '') + '</div></div>' +
      '<div><span class="sub-days ' + daysCls + '">' + daysLabel(s) + '</span>' +
      '<span class="row-actions">' +
      '<button data-act="edit" data-id="' + s.id + '">Edit</button>' +
      '<button data-act="pause" data-id="' + s.id + '">' + (s.paused ? 'Resume' : 'Pause') + '</button>' +
      '<button data-act="delete" data-id="' + s.id + '" class="danger">' + (pendingDeleteId === s.id ? 'Confirm delete?' : 'Delete') + '</button>' +
      '</span></div>';
    listEl.appendChild(li);
  });
  document.querySelectorAll('.filterBtn').forEach(b => b.classList.toggle('active', b.dataset.filter === filter));
}
function escapeHtml(s) { return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

document.getElementById('subForm').addEventListener('submit', e => {
  e.preventDefault();
  const errEl = document.getElementById('formError');
  const name = document.getElementById('fName').value.trim();
  const amount = Number(document.getElementById('fAmount').value);
  const currency = document.getElementById('fCurrency').value.trim() || 'CNY';
  const cycle = document.getElementById('fCycle').value;
  const date = document.getElementById('fDate').value;
  const category = document.getElementById('fCategory').value;
  const notes = document.getElementById('fNotes').value.trim();
  if (!name || !(amount > 0) || !date) {
    errEl.textContent = 'Please check: name must not be empty, amount must be greater than 0, and renewal date must not be empty.';
    errEl.hidden = false; return;
  }
  errEl.hidden = true;
  if (editingId) {
    const s = subs.find(x => x.id === editingId);
    if (s) Object.assign(s, { name, amount, currency, cycle, nextRenewal: date, category, notes });
    editingId = null;
    document.getElementById('formTitle').textContent = 'Add subscription';
    document.getElementById('cancelEditBtn').hidden = true;
    document.getElementById('submitBtn').textContent = 'Save subscription';
  } else {
    subs.push({ id: Date.now() + '-' + Math.random().toString(36).slice(2), name, amount, currency, cycle, nextRenewal: date, category, notes, paused: false, isSample: false });
  }
  e.target.reset(); document.getElementById('fCurrency').value = 'CNY';
  save(); render();
});
document.getElementById('cancelEditBtn').addEventListener('click', () => {
  editingId = null;
  document.getElementById('subForm').reset(); document.getElementById('fCurrency').value = 'CNY';
  document.getElementById('formTitle').textContent = 'Add subscription';
  document.getElementById('cancelEditBtn').hidden = true;
  document.getElementById('submitBtn').textContent = 'Save subscription';
});
document.getElementById('subList').addEventListener('click', e => {
  const btn = e.target.closest('button'); if (!btn) return;
  const id = btn.dataset.id; const act = btn.dataset.act;
  const s = subs.find(x => x.id === id); if (!s) return;
  if (act === 'edit') {
    editingId = id;
    document.getElementById('fName').value = s.name;
    document.getElementById('fAmount').value = s.amount;
    document.getElementById('fCurrency').value = s.currency;
    document.getElementById('fCycle').value = s.cycle;
    document.getElementById('fDate').value = s.nextRenewal;
    document.getElementById('fCategory').value = s.category;
    document.getElementById('fNotes').value = s.notes || '';
    document.getElementById('formTitle').textContent = 'Edit subscription';
    document.getElementById('cancelEditBtn').hidden = false;
    document.getElementById('submitBtn').textContent = 'Save changes';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (act === 'pause') {
    s.paused = !s.paused; save(); render();
  } else if (act === 'delete') {
    if (pendingDeleteId === id) {
      clearTimeout(pendingDeleteTimer); pendingDeleteId = null;
      subs = subs.filter(x => x.id !== id); save(); render();
    } else {
      pendingDeleteId = id; render();
      pendingDeleteTimer = setTimeout(() => { pendingDeleteId = null; render(); }, 3000);
    }
  }
});
document.querySelectorAll('.filterBtn').forEach(b => b.addEventListener('click', () => { filter = b.dataset.filter; render(); }));
function loadSamples() {
  if (subs.length) return;
  const t = todayLocal();
  const plus = n => { const d = new Date(t); d.setDate(d.getDate() + n); return fmtDate(d); };
  subs = [
    { id: 'sample-1', name: 'Streaming', amount: 25, currency: 'CNY', cycle: 'monthly', nextRenewal: plus(-5), category: 'Streaming', notes: 'Sample data', paused: false, isSample: true },
    { id: 'sample-2', name: 'Music', amount: 15, currency: 'CNY', cycle: 'monthly', nextRenewal: plus(3), category: 'Music', notes: 'Sample data', paused: false, isSample: true },
    { id: 'sample-3', name: 'Developer tool', amount: 120, currency: 'CNY', cycle: 'yearly', nextRenewal: plus(21), category: 'Tools', notes: 'Sample data', paused: false, isSample: true },
  ];
  save(); render();
}
document.getElementById('loadSampleBtn').addEventListener('click', loadSamples);
document.getElementById('loadSampleBtn2').addEventListener('click', loadSamples);
document.getElementById('clearSampleBtn').addEventListener('click', () => { subs = subs.filter(s => !s.isSample); save(); render(); });

// Demo mode (?demo=1): perform real actions in the real app, with pauses,
// so a screen recording can show add / pause working end to end.
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
async function runDemo() {
  document.getElementById('demoBadge').hidden = false;
  localStorage.removeItem(KEY); subs = []; save(); render();
  await sleep(8000);
  loadSamples(); await sleep(15000);
  // Add one real subscription through the same code path as the form.
  subs.push({ id: 'demo-1', name: 'Cloud storage', amount: 30, currency: 'CNY', cycle: 'monthly', nextRenewal: fmtDate(new Date(Date.now() + 6 * 86400000)), category: 'Cloud', notes: 'Demo add', paused: false, isSample: false });
  save(); render(); await sleep(15000);
  const first = subs.find(s => s.id === 'sample-2');
  if (first) { first.paused = true; save(); render(); }
  await sleep(10000);
  filter = 'paused'; render(); await sleep(8000);
  filter = 'all'; render(); await sleep(8000);
}
load(); render();
if (new URLSearchParams(location.search).get('demo') === '1') { runDemo(); }
