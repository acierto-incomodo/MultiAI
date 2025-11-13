const { contextBridge, ipcRenderer } = require('electron');

// Exponer APIs seguras al proceso de renderizado
contextBridge.exposeInMainWorld('electronAPI', {
  navigateToUrl: (url) => ipcRenderer.invoke('navigate-to-url', url),
  goHome: () => ipcRenderer.invoke('go-home'),
  windowControl: (action) => ipcRenderer.invoke('window-control', action),
  
  // Información de la plataforma
  platform: process.platform,
  
  // Versión de la aplicación
  appVersion: process.env.npm_package_version || '1.0.0',
  
  // Eventos del menú
  onMenuAction: (callback) => ipcRenderer.on('menu-action', callback)
});