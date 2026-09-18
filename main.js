const { app, BrowserWindow, session } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 900,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      webviewTag: true,        // required to use <webview>
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile('index.html');
  // win.webContents.openDevTools(); // uncomment to debug
}

// Layer 2: inject permissive CORS headers on ALL responses.
// This is the fallback that makes CORS pass even when the AA server
// (e.g. app-uat.onemoney.in) sends no Access-Control-Allow-Origin.
function installCorsBypass() {
  const filter = { urls: ['*://*/*'] };

  // Pass-through hook for outgoing request headers (kept for future tweaks).
  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, cb) => {
    cb({ requestHeaders: details.requestHeaders });
  });

  session.defaultSession.webRequest.onHeadersReceived(filter, (details, cb) => {
    const headers = details.responseHeaders || {};

    // Remove any existing (possibly restrictive) CORS headers, case-insensitive.
    for (const key of Object.keys(headers)) {
      const k = key.toLowerCase();
      if (
        k === 'access-control-allow-origin' ||
        k === 'access-control-allow-headers' ||
        k === 'access-control-allow-methods' ||
        k === 'access-control-allow-credentials'
      ) {
        delete headers[key];
      }
    }

    headers['Access-Control-Allow-Origin'] = ['*'];
    headers['Access-Control-Allow-Headers'] = ['*'];
    headers['Access-Control-Allow-Methods'] = ['GET, POST, PUT, DELETE, OPTIONS, PATCH'];

    cb({ responseHeaders: headers });
  });
}

app.whenReady().then(() => {
  installCorsBypass();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
