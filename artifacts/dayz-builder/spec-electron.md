# Spec: DankDayz Editor — Electron Desktop App

## Problem Statement

The DayZ Builder app currently runs as a web app requiring a browser and internet connection. Users want a downloadable installer that:
- Runs fully offline after installation
- Installs like a normal desktop app (double-click installer, no terminal)
- Auto-updates silently when a new version is available and the user is online
- Works on Windows, macOS, and Linux

## Approach

Wrap the existing Vite + React app in **Electron** using **electron-builder** for packaging. The Vite build output (`dist/public/`) is loaded by Electron as a local file — no web server needed, fully offline.

Auto-updates use **electron-updater** (part of electron-builder) which checks a GitHub Releases page for new versions on launch.

---

## New Directory Structure

```
dayz-builder/
├── electron/
│   ├── main.ts          # Electron main process
│   ├── preload.ts       # Preload script (contextBridge)
│   └── updater.ts       # Auto-update logic
├── src/                 # Existing React app (unchanged)
├── dist/
│   └── public/          # Vite build output (loaded by Electron)
├── release/             # electron-builder output (installers)
├── electron-builder.yml # Packaging config
└── package.json         # Updated with electron scripts
```

---

## Requirements

### Electron Main Process (`electron/main.ts`)
- Creates a `BrowserWindow` (1280×800 default, min 900×600)
- Loads `dist/public/index.html` using `file://` protocol
- Title bar: **"DankDayz Editor"**
- App icon: use existing `public/favicon.svg` (converted to `.ico`/`.icns`/`.png` per platform)
- `nodeIntegration: false`, `contextIsolation: true` (secure defaults)
- On macOS: standard traffic-light window controls, `titleBarStyle: 'default'`
- Prevents navigation to external URLs (intercepts `will-navigate`)
- Opens DevTools only in development mode

### Preload Script (`electron/preload.ts`)
- Exposes a minimal `electronAPI` via `contextBridge`:
  - `platform: string` — so the renderer can detect OS if needed
  - `appVersion: string` — displayed in the UI footer
- No other Node.js APIs exposed (the app is self-contained)

### Auto-Updater (`electron/updater.ts`)
- Uses `electron-updater` package
- On app launch: silently checks for updates (no blocking dialog)
- If update found: downloads in background, shows a non-intrusive toast/notification: *"Update downloaded — will install on next restart"*
- Update check only runs if internet is available (catches network errors silently)
- Update feed URL: GitHub Releases on a repo to be configured (placeholder in config)
- `autoDownload: true`, `autoInstallOnAppQuit: true`

### Vite Config Changes
- Add `base: './'` when building for Electron (relative asset paths so `file://` protocol works)
- Add `build:electron` script that sets `BASE_PATH=./` before running `vite build`

### electron-builder Config (`electron-builder.yml`)
```yaml
appId: com.dankdayz.editor
productName: DankDayz Editor
copyright: DankDayz Editor

directories:
  output: release
  buildResources: build-resources

files:
  - dist/public/**
  - electron/dist/**   # compiled main/preload

extraMetadata:
  main: electron/dist/main.js

win:
  target:
    - target: nsis      # .exe installer
      arch: [x64]
  icon: build-resources/icon.ico

mac:
  target:
    - target: dmg
      arch: [x64, arm64]   # Intel + Apple Silicon
  icon: build-resources/icon.icns
  category: public.app-category.utilities

linux:
  target:
    - target: AppImage   # universal Linux, no install needed
      arch: [x64]
    - target: deb        # Debian/Ubuntu
      arch: [x64]
  icon: build-resources/icon.png
  category: Utility

publish:
  provider: github
  releaseType: release
```

### Package.json Scripts
```json
"scripts": {
  "dev": "vite --config vite.config.ts --host 0.0.0.0",
  "build": "vite build --config vite.config.ts",
  "build:electron": "BASE_PATH=./ vite build --config vite.config.ts",
  "electron:dev": "concurrently \"pnpm build:electron --watch\" \"electron .\"",
  "electron:compile": "tsc -p electron/tsconfig.json",
  "electron:pack": "pnpm build:electron && pnpm electron:compile && electron-builder",
  "electron:pack:win": "pnpm electron:pack -- --win",
  "electron:pack:mac": "pnpm electron:pack -- --mac",
  "electron:pack:linux": "pnpm electron:pack -- --linux"
}
```

### New Dependencies
```json
"devDependencies": {
  "electron": "^41.0.0",
  "electron-builder": "^26.0.0",
  "concurrently": "^9.0.0"
},
"dependencies": {
  "electron-updater": "^6.0.0"
}
```

### Icon Assets (`build-resources/`)
- `icon.ico` — Windows (256×256 multi-size ICO)
- `icon.icns` — macOS
- `icon.png` — Linux (512×512 PNG)
- Generated from the existing `favicon.svg` using a script or manually

### TypeScript Config for Electron (`electron/tsconfig.json`)
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["./**/*.ts"]
}
```

---

## Vite Config Adjustment

The existing `vite.config.ts` uses `base: basePath` where `basePath = process.env.BASE_PATH ?? "/"`. This already supports `BASE_PATH=./` for Electron builds — **no change needed** to the existing config.

The Replit-specific plugins (`cartographer`, `devBanner`) are already guarded by `process.env.REPL_ID !== undefined` so they won't be included in the Electron build.

---

## Auto-Update Flow

```
App launches
  └─ updater.ts: checkForUpdatesAndNotify()
       ├─ No internet → silent fail, app loads normally
       ├─ No update → app loads normally
       └─ Update available → download in background
            └─ Download complete → show in-app notification
                 └─ User quits → new version installs automatically
```

The in-app notification is a simple banner injected via `ipcRenderer` → renderer process, styled to match the existing dark theme.

---

## Platform-Specific Notes

| Platform | Installer | Auto-update mechanism |
|----------|-----------|----------------------|
| Windows | NSIS `.exe` (wizard installer) | Squirrel via electron-updater |
| macOS | `.dmg` (drag to Applications) | Sparkle via electron-updater |
| Linux | `.AppImage` (portable, no install) + `.deb` | AppImage self-update / manual |

> **Linux note:** AppImage auto-update requires `AppImageUpdater`. For simplicity, Linux will show a notification with a download link rather than auto-installing. The `.deb` package does not auto-update.

---

## Acceptance Criteria

1. `pnpm electron:pack` produces installers in `release/` for the current platform
2. `pnpm electron:pack:win` produces a `.exe` NSIS installer
3. `pnpm electron:pack:mac` produces a `.dmg` for x64 and arm64
4. `pnpm electron:pack:linux` produces an `.AppImage` and `.deb`
5. Installing and launching the app on any platform opens the full DankDayz Editor UI
6. The app works with no internet connection after installation
7. All existing features work identically to the web version (all 9 tabs)
8. On launch with internet: update check runs silently, no blocking dialog
9. If an update is available: a non-intrusive notification appears in the app
10. Title bar shows "DankDayz Editor"
11. App version is visible somewhere in the UI (footer or about section)
12. TypeScript compiles clean for both renderer and main process

---

## Implementation Order

1. Install `electron`, `electron-builder`, `electron-updater`, `concurrently` via pnpm
2. Create `electron/tsconfig.json`
3. Create `electron/preload.ts` — contextBridge with `platform` + `appVersion`
4. Create `electron/main.ts` — BrowserWindow, file:// loader, security settings
5. Create `electron/updater.ts` — electron-updater integration + IPC notification
6. Add IPC listener in renderer (`src/main.tsx`) for update notification banner
7. Create `build-resources/` with icon files (PNG → ICO/ICNS conversion)
8. Create `electron-builder.yml`
9. Update `package.json` scripts and dependencies
10. Test `pnpm build:electron` — verify `dist/public/index.html` loads correctly with `file://`
11. Test `pnpm electron:dev` — verify app opens in Electron window
12. Test `pnpm electron:pack:linux` — verify AppImage builds (Linux CI environment)
13. Verify all tabs work offline in the packaged app
