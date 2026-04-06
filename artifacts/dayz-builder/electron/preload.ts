import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
  platform: process.platform,
  appVersion: process.env.npm_package_version ?? "1.0.0",

  // Listen for update notifications from main process
  onUpdateAvailable: (cb: (info: { version: string }) => void) => {
    ipcRenderer.on("update-available", (_event, info) => cb(info));
  },
  onUpdateDownloaded: (cb: (info: { version: string }) => void) => {
    ipcRenderer.on("update-downloaded", (_event, info) => cb(info));
  },
  // Trigger install-on-quit
  installUpdate: () => ipcRenderer.send("install-update"),
});
