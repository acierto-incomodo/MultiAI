const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al proceso de renderizado
contextBridge.exposeInMainWorld('electronAPI', {
  navigateToUrl: (url) => ipcRenderer.invoke('navigate-to-url', url),
  goBack: () => ipcRenderer.invoke('go-back'),
  goHome: () => ipcRenderer.invoke('go-home'),
  windowControl: (action) => ipcRenderer.invoke('window-control', action),
  
  // Información de la plataforma
  platform: process.platform,
  
  // Versión de la aplicación
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Eventos del menú
  onMenuAction: (callback) => ipcRenderer.on('menu-action', callback)
});