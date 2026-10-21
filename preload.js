const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Navigation
  navigateToUrl: (url) => ipcRenderer.invoke("navigate-to-url", url),
  goBack: () => ipcRenderer.invoke("go-back"),
  goHome: () => ipcRenderer.invoke("go-home"),

  // Window controls
  windowControl: (action) => ipcRenderer.invoke("window-control", action),

  // App info
  getAppVersion: () => ipcRenderer.invoke("get-app-version"),
  getAppLanguage: () => ipcRenderer.invoke("get-app-language"),
  saveAppLanguage: (language) =>
    ipcRenderer.invoke("save-app-language", language),
  getShortcutSettings: () => ipcRenderer.invoke("get-shortcut-settings"),
  saveShortcutSettings: (settings) =>
    ipcRenderer.invoke("save-shortcut-settings", settings),

  // Updater API
  // El proceso principal envía eventos con este nombre
  onUpdateState: (callback) => ipcRenderer.on("update-state", callback),
  // El renderer llama a estas funciones para interactuar con el actualizador
  checkForUpdates: () => ipcRenderer.send("check-for-updates"),
  quitAndInstallUpdate: () => ipcRenderer.send("quit-and-install-update"),

  // Nuevo: Escuchar cuando el proceso principal quiere mostrar la alerta de bloqueo
  onShowBlockedAlert: (callback) =>
    ipcRenderer.on("show-blocked-alert", callback),

  // Informar si la app es de la Windows Store (AppX)
  isWindowsStore: !!process.windowsStore,
});
