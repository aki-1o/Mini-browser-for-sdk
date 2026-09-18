const { contextBridge, ipcRenderer } = require('electron');

// Safe bridge: the URL-bar UI calls these to drive the page WebContentsView
// living in the main process.
contextBridge.exposeInMainWorld('miniBrowser', {
  version: '2.0.0',
  go:       (url) => ipcRenderer.invoke('nav:go', url),
  back:     ()    => ipcRenderer.invoke('nav:back'),
  reload:   ()    => ipcRenderer.invoke('nav:reload'),
  devtools: ()    => ipcRenderer.invoke('nav:devtools'),

  // Events pushed from main -> UI.
  onLoading:   (cb) => ipcRenderer.on('page-loading', () => cb()),
  onLoaded:    (cb) => ipcRenderer.on('page-loaded', () => cb()),
  onNavigated: (cb) => ipcRenderer.on('page-navigated', (e, url) => cb(url)),
  onError:     (cb) => ipcRenderer.on('page-error', (e, info) => cb(info)),
});
