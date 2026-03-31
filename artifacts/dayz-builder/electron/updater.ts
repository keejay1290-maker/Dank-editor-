import { BrowserWindow } from "electron";
import { autoUpdater } from "electron-updater";
import log from "electron-log";

export function setupUpdater(win: BrowserWindow): void {
  // Log to file for debugging
  autoUpdater.logger = log;
  (autoUpdater.logger as typeof log).transports.file.level = "info";

  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;

  autoUpdater.on("update-available", (info) => {
    win.webContents.send("update-available", { version: info.version });
  });

  autoUpdater.on("update-downloaded", (info) => {
    win.webContents.send("update-downloaded", { version: info.version });
  });

  autoUpdater.on("error", (err) => {
    // Silent fail — no internet or update server unreachable
    log.warn("Auto-updater error (non-fatal):", err?.message ?? err);
  });

  // Check for updates after a short delay so the window is fully loaded
  setTimeout(() => {
    autoUpdater.checkForUpdatesAndNotify().catch((err) => {
      log.warn("Update check failed (non-fatal):", err?.message ?? err);
    });
  }, 3000);
}
