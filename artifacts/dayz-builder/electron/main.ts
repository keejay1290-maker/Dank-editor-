import { app, BrowserWindow, ipcMain, shell } from "electron";
import path from "path";
import { setupUpdater } from "./updater";

const isDev = !app.isPackaged;

function createWindow(): BrowserWindow {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: "Dank's Dayz Studio",
    backgroundColor: "#0a0804",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
    },
    // Show window once ready to avoid white flash
    show: false,
  });

  // Load the built Vite app
  if (isDev) {
    // In dev mode, load from Vite dev server if available, else built files
    const devUrl = process.env.VITE_DEV_SERVER_URL;
    if (devUrl) {
      win.loadURL(devUrl);
    } else {
      win.loadFile(path.join(__dirname, "../dist/public/index.html"));
    }
    win.webContents.openDevTools({ mode: "detach" });
  } else {
    win.loadFile(path.join(__dirname, "../dist/public/index.html"));
  }

  // Show window once DOM is ready (avoids white flash)
  win.once("ready-to-show", () => win.show());

  // Prevent navigation to external URLs — open in system browser instead
  win.webContents.on("will-navigate", (event, url) => {
    const appUrl = isDev
      ? process.env.VITE_DEV_SERVER_URL ?? ""
      : `file://${path.join(__dirname, "../dist/public/")}`;
    if (!url.startsWith(appUrl) && !url.startsWith("file://")) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Same for new windows / target="_blank"
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  return win;
}

app.whenReady().then(() => {
  const win = createWindow();

  // Set up auto-updater (only in packaged app)
  if (!isDev) {
    setupUpdater(win);
  }

  app.on("activate", () => {
    // macOS: re-create window when dock icon is clicked and no windows open
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows closed (except macOS)
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// IPC: renderer requests update install
ipcMain.on("install-update", () => {
  const { autoUpdater } = require("electron-updater");
  autoUpdater.quitAndInstall(false, true);
});
