const urlInput  = document.getElementById('url');
const goBtn     = document.getElementById('go');
const backBtn   = document.getElementById('back');
const reloadBtn = document.getElementById('reload');
const view      = document.getElementById('view');
const statusEl  = document.getElementById('status');

const LAST_URL_KEY = 'aa_last_url';

function showStatus(msg) {
  statusEl.textContent = msg;
  statusEl.classList.add('show');
}
function clearStatus() {
  statusEl.textContent = '';
  statusEl.classList.remove('show');
}

function normalize(raw) {
  let u = raw.trim();
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) u = 'http://' + u; // default to http for localhost
  return u;
}

function navigate() {
  const u = normalize(urlInput.value);
  if (!u) return;
  clearStatus();
  localStorage.setItem(LAST_URL_KEY, u);
  view.src = u;
}

goBtn.addEventListener('click', navigate);
urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') navigate(); });
reloadBtn.addEventListener('click', () => view.reload());
backBtn.addEventListener('click', () => { if (view.canGoBack()) view.goBack(); });

// Load errors surfaced to the status bar.
view.addEventListener('did-fail-load', (e) => {
  // -3 = ERR_ABORTED (benign, e.g. redirects) — ignore.
  if (e.errorCode === -3) return;
  showStatus(`Load failed (${e.errorCode}): ${e.errorDescription} — ${e.validatedURL}`);
});
view.addEventListener('did-start-loading', clearStatus);

// Restore last URL on startup.
window.addEventListener('DOMContentLoaded', () => {
  const last = localStorage.getItem(LAST_URL_KEY);
  if (last) urlInput.value = last;
});
