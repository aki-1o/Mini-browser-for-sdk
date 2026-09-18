const {
  app,
  BrowserWindow,
  WebContentsView,
  session,
  ipcMain,
  Menu,
} = require('electron');
const path = require('path');

const TOP_BAR_HEIGHT = 84; // px reserved at top for URL bar + status line

let win;        // the shell BrowserWindow (hosts the URL bar UI)
let pageView;   // WebContentsView that renders the consent journey

function layoutPageView() {
  if (!win || !pageView) return;
  const { width, height } = win.getContentBounds();
  pageView.setBounds({
    x: 0,
    y: TOP_BAR_HEIGHT,
    width,
    height: Math.max(0, height - TOP_BAR_HEIGHT),
  });
}

function normalizeUrl(raw) {
  let u = (raw || '').trim();
  if (!u) return '';
  if (!/^https?:\/\//i.test(u)) u = 'http://' + u;
  return u;
}

function wirePageContextMenu(contents) {
  // Right-click anywhere in the page -> "Inspect Element" that opens
  // DEVTOOLS DOCKED and jumps to the exact node under the cursor.
  contents.on('context-menu', (event, params) => {
    const menu = Menu.buildFromTemplate([
      { role: 'copy', enabled: params.editFlags.canCopy },
      { role: 'paste', enabled: params.editFlags.canPaste },
      { type: 'separator' },
      { label: 'Reload', click: () => contents.reload() },
      { label: 'Back', enabled: contents.canGoBack(), click: () => contents.goBack() },
      { type: 'separator' },
      {
        label: 'Inspect Element',
        click: () => {
          // Ensure DevTools is docked to the bottom of the window.
          if (!contents.isDevToolsOpened()) {
            contents.openDevTools({ mode: 'bottom' });
          }
          contents.inspectElement(params.x, params.y);
        },
      },
    ]);
    menu.popup({ window: win });
  });
}

function createPageView() {
  pageView = new WebContentsView({
    webPreferences: {
      webSecurity: false,                 // <-- disable same-origin/CORS enforcement
      allowRunningInsecureContent: true,  // allow mixed http/https content
      contextIsolation: false,
    },
  });

  win.contentView.addChildView(pageView);
  layoutPageView();

  const contents = pageView.webContents;
  wirePageContextMenu(contents);

  // Forward load state / errors to the URL-bar renderer.
  contents.on('did-start-loading', () => win.webContents.send('page-loading'));
  contents.on('did-stop-loading', () => win.webContents.send('page-loaded'));
  contents.on('did-fail-load', (e, errorCode, errorDescription, validatedURL) => {
    if (errorCode === -3) return; // ERR_ABORTED (benign)
    win.webContents.send('page-error', { errorCode, errorDescription, validatedURL });
  });
  contents.on('did-navigate', (e, url) => win.webContents.send('page-navigated', url));
}

function createWindow() {
  win = new BrowserWindow({
    width: 1280,
    height: 900,
    icon: path.join(__dirname, 'assets', 'favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  win.loadFile('index.html');
  createPageView();

  win.on('resize', layoutPageView);
  // win.webContents.openDevTools({ mode: 'detach' }); // shell UI debug, if ever needed
}

// Inject permissive CORS headers on ALL responses so calls succeed even when
// the AA server (e.g. app-uat.onemoney.in) sends no Access-Control-Allow-Origin.
function installCorsBypass() {
  const filter = { urls: ['*://*/*'] };

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, cb) => {
    cb({ requestHeaders: details.requestHeaders });
  });

  session.defaultSession.webRequest.onHeadersReceived(filter, (details, cb) => {
    const headers = details.responseHeaders || {};
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

// ---- IPC from the URL-bar renderer ----
ipcMain.handle('nav:go', (e, rawUrl) => {
  const u = normalizeUrl(rawUrl);
  if (u && pageView) pageView.webContents.loadURL(u);
  return u;
});
ipcMain.handle('nav:back', () => {
  if (pageView && pageView.webContents.canGoBack()) pageView.webContents.goBack();
});
ipcMain.handle('nav:reload', () => {
  if (pageView) pageView.webContents.reload();
});
ipcMain.handle('nav:devtools', () => {
  if (!pageView) return;
  const c = pageView.webContents;
  if (c.isDevToolsOpened()) c.closeDevTools();
  else c.openDevTools({ mode: 'bottom' }); // DOCKED at the bottom
});

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
