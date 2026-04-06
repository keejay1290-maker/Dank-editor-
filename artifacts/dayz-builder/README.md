# Dank's Dayz Studio

DayZ server tools, base builder and structure generator. Works fully offline after install.

**[⬇ Download latest release](https://github.com/danksdayzstudio/danksdayzstudio/releases/latest)**

---

## Downloads

| Platform | File | Notes |
|----------|------|-------|
| Windows | `.exe` NSIS installer | x64, wizard install |
| macOS | `.dmg` disk image | Intel + Apple Silicon |
| Linux | `.AppImage` | No install — just run |
| Android | `.apk` sideload | Android 7+ |
| iOS | TestFlight | Coming soon |

---

## Development

```bash
pnpm install
pnpm dev          # web dev server at localhost:5173
```

---

## Desktop (Electron)

```bash
# Build for current platform
pnpm electron:pack

# Build for specific platform
pnpm electron:pack:win
pnpm electron:pack:mac
pnpm electron:pack:linux

# Output → release/
```

> Windows `.exe` must be built on Windows, macOS `.dmg` on macOS, Linux `.AppImage` on Linux or Ubuntu CI.

---

## Mobile (Capacitor)

### Setup (first time)
```bash
pnpm build:electron        # build web assets → dist/public/
npx cap sync               # copy assets into ios/ and android/
```

### Android
```bash
pnpm cap:android           # open in Android Studio
# or build APK directly:
cd android && ./gradlew assembleRelease
# APK → android/app/build/outputs/apk/release/app-release-unsigned.apk
```

### iOS
```bash
pnpm cap:ios               # open in Xcode (Mac only)
```
Requires Mac + Xcode 15+ and an Apple Developer account.  
Archive → Distribute → TestFlight or App Store.

### After changing web code
```bash
pnpm cap:sync              # rebuilds web assets and syncs to both platforms
```

---

## Releases (GitHub Actions CI)

Releases are built automatically when you push a version tag:

```bash
git tag v1.0.1
git push origin v1.0.1
```

This triggers `.github/workflows/release.yml` which builds:
- Linux `.AppImage` on `ubuntu-latest`
- Windows `.exe` on `windows-latest`
- macOS `.dmg` on `macos-latest`
- Android `.apk` on `ubuntu-latest` with Android SDK

All files are uploaded to the GitHub Release automatically.

### Required secret

Add `GH_TOKEN` to your repository secrets (Settings → Secrets → Actions):
- Go to GitHub → Settings → Developer settings → Personal access tokens
- Create a token with `repo` scope
- Add it as `GH_TOKEN` in your repo secrets

### macOS code signing (optional)

To avoid the "unidentified developer" warning on macOS, add these secrets:
- `MAC_CERT_P12_BASE64` — base64-encoded `.p12` certificate from Apple Developer
- `MAC_CERT_PASSWORD` — certificate password

Then uncomment the `CSC_LINK` / `CSC_KEY_PASSWORD` lines in `release.yml`.

---

## Auto-update

The desktop app checks for updates silently on launch (requires internet).  
When an update is downloaded, a banner appears in the app with a "Restart now" button.  
Updates are hosted on GitHub Releases.

To publish an update:
1. Bump `version` in `package.json`
2. `git tag v<new-version> && git push origin v<new-version>`
3. CI builds and publishes automatically

---

## Project structure

```
dayz-builder/
├── src/                    # React app (Vite)
├── electron/               # Electron main process
│   ├── main.ts
│   ├── preload.ts
│   └── updater.ts
├── ios/                    # Capacitor iOS project (open in Xcode)
├── android/                # Capacitor Android project (open in Android Studio)
├── public/
│   ├── download.html       # Download landing page
│   └── Dank-s-Dayz-Studio-*.AppImage
├── build-resources/        # App icons (ico, icns, png)
├── .github/workflows/
│   └── release.yml         # CI — builds all platforms on tag push
├── capacitor.config.ts
├── electron-builder.yml
└── package.json
```
