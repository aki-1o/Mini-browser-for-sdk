const { contextBridge } = require('electron');

// Minimal, safe bridge. The renderer uses localStorage for "remember last URL",
// so no IPC is strictly required — we expose a tiny namespace for clarity/future use.
contextBridge.exposeInMainWorld('miniBrowser', {
  version: '1.0.0',
});
