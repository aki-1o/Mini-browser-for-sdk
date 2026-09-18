const urlInput    = document.getElementById('url');
const goBtn       = document.getElementById('go');
const backBtn     = document.getElementById('back');
const reloadBtn   = document.getElementById('reload');
const devtoolsBtn = document.getElementById('devtools');
const statusEl    = document.getElementById('status');

const LAST_URL_KEY = 'aa_last_url';
const mb = window.miniBrowser;

function showStatus(msg) {
  statusEl.textContent = msg;
  statusEl.classList.add('show');
}
function clearStatus() {
  statusEl.textContent = '';
  statusEl.classList.remove('show');
}

async function navigate() {
  const raw = urlInput.value;
  if (!raw.trim()) return;
  clearStatus();
  const applied = await mb.go(raw);       // main normalizes + loads
  if (applied) {
    urlInput.value = applied;
    localStorage.setItem(LAST_URL_KEY, applied);
  }
}

goBtn.addEventListener('click', navigate);
urlInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') navigate(); });
reloadBtn.addEventListener('click', () => mb.reload());
backBtn.addEventListener('click', () => mb.back());
devtoolsBtn.addEventListener('click', () => mb.devtools());

// F12 toggles DevTools (docked) for the loaded page.
window.addEventListener('keydown', (e) => {
  if (e.key === 'F12') mb.devtools();
});

// Events from main process.
mb.onLoading(() => clearStatus());
mb.onNavigated((url) => {
  if (url && !url.startsWith('devtools://')) {
    urlInput.value = url;
    localStorage.setItem(LAST_URL_KEY, url);
  }
});
mb.onError((info) => {
  showStatus(`Load failed (${info.errorCode}): ${info.errorDescription} — ${info.validatedURL}`);
});

// Restore last URL on startup.
window.addEventListener('DOMContentLoaded', () => {
  const last = localStorage.getItem(LAST_URL_KEY);
  if (last) urlInput.value = last;
});
