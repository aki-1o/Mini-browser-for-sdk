# AA Mini Browser

A minimal Electron desktop "browser" 

> This app intentionally disables a browser security feature. It is for **local
> testing only** and must never be used for real end users.

## Prerequisites

Install these first:

- **[Node.js](https://nodejs.org/)** (LTS) — provides `npm`.
- **[Git](https://git-scm.com/)** — to clone the repo.

## Clone & Run

```powershell
git clone https://github.com/YOUR_USERNAME/aa-mini-browser.git
cd aa-mini-browser
npm install
npm start
```

`npm install` downloads Electron (one-time). `npm start` launches the app.

---

## How to Use

1. Make sure your AA SDK dev server is running on `http://localhost:3000`.
2. Generate your short link, follow the redirect to the long consent-journey URL,
   and swap the host to `localhost:3000` (keep **all** query params).
3. Paste that full URL into the top bar and press **Go** (or hit **Enter**).
4. The journey renders inside the app; its cross-origin API calls work despite CORS.

## Project Structure

| File           | Purpose                                                        |
|----------------|----------------------------------------------------------------|
| `main.js`      | Electron main process: window, `WebContentsView`, CORS bypass, DevTools, IPC. |
| `preload.js`   | Safe IPC bridge between the URL-bar UI and the main process.   |
| `index.html`   | The top bar UI (URL input + buttons).                          |
| `renderer.js`  | URL-bar logic: navigation, DevTools toggle, remember-last-URL. |
| `package.json` | Dependencies, scripts, and electron-builder config.            |

---

## Notes / Troubleshooting

- **`Autofill.enable ... wasn't found`** messages in the terminal are a harmless
  Electron/DevTools quirk — safe to ignore.
- **URL bar looks clipped/overlapped?** Adjust `TOP_BAR_HEIGHT` in `main.js`.
- Requires **Electron 30+** (uses `WebContentsView`). This repo pins Electron 31.
- Everything is contained to this app — your system Chrome is unaffected.
