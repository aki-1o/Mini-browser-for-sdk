# AA Mini Browser

A minimal Electron desktop "browser" for testing Account Aggregator (AA) consent
journeys against a local dev server (`localhost:3000`).

It renders a consent-journey URL **with web security / CORS disabled inside this app
only**, so cross-origin API calls to AA UAT hosts (e.g. `app-uat.onemoney.in`) are not
blocked — without touching your system Chrome or needing
`chrome.exe --disable-web-security`.

> This app intentionally disables a browser security feature. It is for **local
> testing only** and must never be used for real end users.

---

## Features

- URL bar with **Go**, **Back**, **Reload**, and **DevTools** buttons.
- Renders any pasted consent-journey URL (long query strings supported).
- **Web security / CORS disabled** internally so AA API calls succeed.
- **Docked DevTools** (bottom) — press **F12** or click the 🔧 button.
- **Right-click → Inspect Element** jumps to the exact element (HTML + CSS), like Chrome.
- Remembers the last URL you loaded.
- Shows page load errors in a status bar.

---

## Prerequisites

Install these first:

- **[Node.js](https://nodejs.org/)** (LTS) — provides `npm`.
- **[Git](https://git-scm.com/)** — to clone the repo.

Check they're installed:

```powershell
node -v
npm -v
git --version
```

---

## Clone & Run

```powershell
git clone https://github.com/YOUR_USERNAME/aa-mini-browser.git
cd aa-mini-browser
npm install
npm start
```

> Replace the URL with this repository's actual **`< > Code` → HTTPS** link.

`npm install` downloads Electron (one-time). `npm start` launches the app.

---

## How to Use

1. Make sure your AA SDK dev server is running on `http://localhost:3000`.
2. Generate your short link, follow the redirect to the long consent-journey URL,
   and swap the host to `localhost:3000` (keep **all** query params).
3. Paste that full URL into the top bar and press **Go** (or hit **Enter**).
4. The journey renders inside the app; its cross-origin API calls work despite CORS.

### Debugging

- Press **F12** or click **🔧** to toggle DevTools (docked at the bottom).
- **Right-click** any element → **Inspect Element** to see its HTML/classes/CSS.
- Use the **Network** tab to confirm AA API calls succeed.

---

## Build a Windows `.exe` (optional)

To produce a distributable executable (for people without Node.js):

```powershell
npm run dist
```

Output lands in the **`release/`** folder:

- `AA Mini Browser Setup 1.0.0.exe` — installer.
- `AA Mini Browser 1.0.0.exe` — portable (double-click, no install).

For a quick unpacked build (no installer): `npm run pack`.

---

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

---

## License

MIT
