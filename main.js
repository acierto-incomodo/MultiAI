const { app, BrowserWindow, Menu, shell, ipcMain, dialog } = require("electron");
const path = require("path");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

// Configura electron-log
log.transports.file.level = "info";
log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";
// Captura excepciones no controladas
log.catchErrors();

// Asignar el logger a autoUpdater para ver logs detallados de actualización
autoUpdater.logger = log;

let mainWindow;

// Prevenir múltiples instancias de la aplicación
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  log.warn("Se intentó abrir una segunda instancia, cerrando...");
  app.quit();
} else {
  app.on("second-instance", () => {
    // Si el usuario intenta abrir otra instancia, traer la existente al frente
    log.info("Detectada segunda instancia. Trayendo la ventana principal al frente.");
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

function createWindow() {
  log.info("Creando la ventana principal (createWindow)...");
  // Crear la ventana principal
  mainWindow = new BrowserWindow({
    minWidth: 400,
    minHeight: 700,
    autoHideMenuBar: true, // Menú escondido por defecto, presiona Alt para mostrarlo
    // menuBarVisible: true, // Alternativa más moderna, pero autoHideMenuBar es más común
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      webSecurity: true,
    },
    icon: path.join(__dirname, "build/icon.png"),
    show: false,
  });

  // Cargar la página principal
  mainWindow.loadFile("index.html");
  log.info("Cargando index.html en la ventana principal.");

  // Mostrar ventana cuando esté lista
  mainWindow.once("ready-to-show", () => {
    log.info("La ventana está lista para mostrarse. Maximizando y mostrando.");
    mainWindow.maximize();
    mainWindow.show();
  });

  // Forzar que todos los enlaces se abran en la misma ventana
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    log.info(`Interceptada apertura de nueva ventana. Cargando en la misma ventana: ${url}`);
    mainWindow.loadURL(url);
    return { action: 'deny' };
  });

  // Crear y establecer el menú de la aplicación
  createMenu();

  // Abrir DevTools en desarrollo
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  // Manejar el cierre de la ventana
  mainWindow.on("closed", () => {
    log.info("La ventana principal ha sido cerrada.");
    mainWindow = null;
  });

  // Crear menú contextual (clic derecho)
  mainWindow.webContents.on("context-menu", (e, params) => {
    const contextMenu = Menu.buildFromTemplate([
      { role: 'undo', label: 'Deshacer' },
      { role: 'redo', label: 'Rehacer' },
      { type: 'separator' },
      { role: 'cut', label: 'Cortar' },
      { role: 'copy', label: 'Copiar' },
      { role: 'paste', label: 'Pegar' },
      { type: 'separator' },
      { role: 'reload', label: 'Recargar' },
      { role: 'toggleDevTools', label: 'Herramientas Desarrollo' },
    ]);
    contextMenu.popup(mainWindow, params.x, params.y);
  });

}

function createMenu() {
  const template = [
    {
      label: "Asistentes IA",
      submenu: [
        {
          label: "CardinalAI",
          accelerator: 'CmdOrCtrl+1',
          click: () => {
            log.info("Menu: Navegando a CardinalAI.");
            mainWindow.loadURL("https://cardinal-ai-h4rt.vercel.app/");
          },
        },
        {
          label: "ChatGPT",
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            log.info("Menu: Navegando a ChatGPT.");
            mainWindow.loadURL("https://chatgpt.com/");
          },
        },
        {
          label: "Claude",
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            log.info("Menu: Navegando a Claude.");
            mainWindow.loadURL("https://claude.ai/");
          },
        },
        {
          label: "Copilot",
          accelerator: 'CmdOrCtrl+4',
          click: () => {
            log.info("Menu: Navegando a Copilot.");
            mainWindow.loadURL("https://copilot.microsoft.com/");
          },
        },
        {
          label: "Deepseek",
          accelerator: 'CmdOrCtrl+5',
          click: () => {
            log.info("Menu: Navegando a Deepseek.");
            mainWindow.loadURL("https://chat.deepseek.com");
          },
        },
        {
          label: "Gemini",
          accelerator: 'CmdOrCtrl+6',
          click: () => {
            log.info("Menu: Navegando a Gemini.");
            mainWindow.loadURL("https://gemini.google.com/");
          },
        },
        {
          label: "Grok",
          accelerator: 'CmdOrCtrl+7',
          click: () => {
            log.info("Menu: Navegando a Grok.");
            mainWindow.loadURL("https://grok.com/");
          },
        },
        {
          label: "Mistral AI",
          accelerator: 'CmdOrCtrl+8',
          click: () => {
            log.info("Menu: Navegando a Mistral AI.");
            mainWindow.loadURL("https://chat.mistral.ai/");
          },
        },
        {
          label: "NotebookLM",
          accelerator: 'CmdOrCtrl+9',
          click: () => {
            log.info("Menu: Navegando a NotebookLM.");
            mainWindow.loadURL("https://notebooklm.google.com/");
          },
        },
        {
          label: "Perplexity AI",
          click: () => {
            log.info("Menu: Navegando a Perplexity AI.");
            mainWindow.loadURL("https://www.perplexity.ai/");
          },
        },
      ],
    },
    {
      label: "Navegación",
      submenu: [
        {
          label: "Página Principal",
          accelerator: 'CmdOrCtrl+H',
          click: () => {
            log.info("Menu: Navegando a la página principal.");
            mainWindow.loadFile("index.html");
          },
        },
        { type: "separator" },
        {
          label: "Atrás",
          accelerator: 'Alt+Left',
          click: () => {
            if (mainWindow.webContents.canGoBack()) {
              log.info("Menu: Navegando hacia atrás.");
              mainWindow.webContents.goBack();
            }
          },
        },
        {
          label: "Adelante",
          accelerator: 'Alt+Right',
          click: () => {
            if (mainWindow.webContents.canGoForward()) {
              log.info("Menu: Navegando hacia adelante.");
              mainWindow.webContents.goForward();
            }
          },
        },
        { type: "separator" },
        { role: "zoomIn", label: "Acercar", accelerator: 'CmdOrCtrl+=' },
        { role: "zoomOut", label: "Alejar" },
        { role: "resetZoom", label: "Restablecer Zoom", accelerator: 'CmdOrCtrl+0' },
        { type: "separator" },
        { role: "reload", label: "Recargar", accelerator: 'CmdOrCtrl+R' },
        { role: "forceReload", label: "Forzar Recarga", accelerator: 'CmdOrCtrl+Shift+R' },
        { role: "toggleDevTools", label: "Herramientas Desarrollo", accelerator: 'F12' },
      ],
    },
    {
      label: "Ventana",
      submenu: [
        { role: "minimize", label: "Minimizar", accelerator: 'CmdOrCtrl+M' },
        { role: "close", label: "Cerrar", accelerator: 'CmdOrCtrl+W' },
        { type: "separator" },
        { role: "front", label: "Traer al Frente" },
        { 
          label: "Toggle Full Screen", 
          accelerator: 'F11',
          click: () => {
            const isFullScreen = !mainWindow.isFullScreen();
            log.info(`Menu: Cambiando a pantalla completa: ${isFullScreen}.`);
            mainWindow.setFullScreen(isFullScreen);
          }
        },
      ],
    },
    {
      label: "Ayuda",
      submenu: [
        {
          label: "Abrir en Navegador Externo",
          accelerator: 'CmdOrCtrl+O',
          click: () => {
            const currentURL = mainWindow.webContents.getURL();
            if (currentURL && !currentURL.startsWith("file://")) {
              log.info(`Menu: Abriendo URL externa: ${currentURL}`);
              shell.openExternal(currentURL);
            } else {
              log.warn(`Menu: No se puede abrir en navegador externo. URL actual: ${currentURL}`);
            }
          },
        },
        {
          label: "Atajos de Teclado",
          accelerator: 'CmdOrCtrl+K',
          click: () => {
            log.info("Menu: Mostrando atajos de teclado.");
            mainWindow.loadFile("shortcuts.html");
          },
        },
        { type: "separator" },
        {
          label: "Verificar Actualizaciones",
          click: () => {
            log.info("Iniciada la búsqueda manual de actualizaciones desde el menú.");
            autoUpdater.checkForUpdates();
          }
        },
        { type: "separator" },
        {
          label: "Acerca de MultiAI",
          click: () => {
            log.info("Menu: Mostrando diálogo 'Acerca de'.");
            const { dialog } = require('electron');
            const packageJson = require('./package.json');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Acerca de MultiAI',
              message: `MultiAI v${packageJson.version}`,
              detail: 'Centro de asistentes de inteligencia artificial\nDesarrollado por StormGamesStudios'
            });
          }
        }
      ],
    },
  ];

  // Agregar menú específico para macOS
  if (process.platform === 'darwin') {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: 'about', label: 'Acerca de AI Hub' },
        { type: 'separator' },
        { role: 'services', label: 'Servicios' },
        { type: 'separator' },
        { role: 'hide', label: 'Ocultar AI Hub' },
        { role: 'hideothers', label: 'Ocultar Otros' },
        { role: 'unhide', label: 'Mostrar Todo' },
        { type: 'separator' },
        { role: 'quit', label: 'Salir de AI Hub' }
      ]
    });
  }

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
  
  return menu;
}

// Manejar la comunicación desde el renderer process
ipcMain.handle("navigate-to-url", (event, url) => {
  log.info(`IPC: Navegando a la URL: ${url}`);
  if (mainWindow) {
    mainWindow.loadURL(url);
    return true;
  }
  return false;
});

ipcMain.handle("go-back", () => {
  if (mainWindow && mainWindow.webContents.canGoBack()) {
    log.info("IPC: Navegando hacia atrás.");
    mainWindow.webContents.goBack();
    return true;
  }
  log.warn("IPC: Intento de ir hacia atrás fallido (no se puede retroceder).");
  return false;
});

ipcMain.handle("go-home", () => {
  if (mainWindow) {
    log.info("IPC: Navegando a la página de inicio (index.html).");
    mainWindow.loadFile("index.html");
    return true;
  }
  return false;
});

ipcMain.handle("window-control", (event, action) => {
  if (mainWindow) {
    if (action === 'close') {
      log.info("IPC: Recibida acción de cerrar ventana.");
      mainWindow.close();
      return true;
    }
  }
  return false;
});

ipcMain.handle("get-app-version", () => {
  return app.getVersion();
});

ipcMain.on('check-for-updates', () => {
  log.info('IPC: Recibida solicitud para buscar actualizaciones desde la página de actualizaciones.');
  if (app.isPackaged) {
    autoUpdater.checkForUpdates().catch(err => {
      log.error("Error al buscar actualizaciones (manual):", err);
      if (mainWindow) {
        mainWindow.webContents.send('update-state', 'error', { message: err.message });
      }
    });
  } else {
    log.warn('IPC: Omitiendo búsqueda de actualizaciones en modo de desarrollo.');
    if (mainWindow) {
      // Simula un evento para una experiencia de UI consistente en desarrollo
      setTimeout(() => {
        mainWindow.webContents.send('update-state', 'update-not-available', { version: app.getVersion() });
      }, 1500);
    }
  }
});

ipcMain.on('quit-and-install-update', () => {
  log.info('IPC: Recibida solicitud para salir e instalar la actualización.');
  if (app.isPackaged) {
    autoUpdater.quitAndInstall();
  }
});

// Configuración del actualizador automático
let autoUpdaterSetupDone = false;

function setupAutoUpdater() {
  // Solo buscar actualizaciones si la app está empaquetada (producción)
  if (!app.isPackaged || autoUpdaterSetupDone) {
    return;
  }
  autoUpdaterSetupDone = true;

  log.info("AutoUpdater: Configurando el actualizador automático.");
  
  // Limpiar listeners previos para evitar duplicados
  autoUpdater.removeAllListeners();

  autoUpdater.on('checking-for-update', () => {
    log.info('AutoUpdater: Buscando actualizaciones...');
    if (mainWindow) {
      mainWindow.webContents.send('update-state', 'checking-for-update');
    }
  });

  // Inicia la primera búsqueda al arrancar
  autoUpdater.checkForUpdates().catch(err => {
    log.error("Error en la búsqueda inicial:", err);
  });
  
  // Verificar actualizaciones cada 30 minutos
  setInterval(() => {
    log.info("AutoUpdater: Buscando actualizaciones (intervalo de 30 min).");
    autoUpdater.checkForUpdates().catch(err => log.error("Error en intervalo:", err));
  }, 30 * 60 * 1000);

  // Evento cuando hay una actualización disponible
  autoUpdater.on('update-available', (info) => {
    log.info(`AutoUpdater: Actualización disponible: ${info.version}`);
    if (mainWindow) {
      mainWindow.webContents.send('update-state', 'update-available', info);
    }
  });

  // Evento cuando no hay actualización disponible
  autoUpdater.on('update-not-available', (info) => {
    log.info(`AutoUpdater: No hay actualizaciones disponibles. Remota: ${info.version}, Actual: ${app.getVersion()}`);
    if (mainWindow) {
      mainWindow.webContents.send('update-state', 'update-not-available', info);
    }
  });

  // Evento cuando ha fallado la búsqueda
  autoUpdater.on('error', (error) => {
    log.error("Error en autoUpdater:", error);
    if (mainWindow) {
      mainWindow.webContents.send('update-state', 'error', error);
    }
  });

  // Evento de progreso de descarga
  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = `Velocidad de descarga: ${progressObj.bytesPerSecond} - Descargado ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
    log.info(`AutoUpdater: ${log_message}`);
    if (mainWindow) {
      mainWindow.webContents.send('update-state', 'download-progress', progressObj);
    }
  });

  // Evento cuando la actualización se ha descargado
  autoUpdater.on('update-downloaded', (info) => {
    log.info(`AutoUpdater: Actualización v${info.version} descargada. Notificando al renderer y mostrando diálogo.`);
    if (mainWindow) {
        mainWindow.webContents.send('update-state', 'update-downloaded', info);
    }
    dialog.showMessageBox(mainWindow, {
      type: 'info',
      title: 'Actualización disponible',
      message: `MultiAI v${info.version} está lista para instalar`,
      detail: 'Se descargó la actualización. ¿Quieres instalarla ahora?',
      buttons: ['Instalar ahora', 'Más tarde']
    }).then((result) => {
      if (result.response === 0) {
        // Instalar actualización inmediatamente
        log.info("AutoUpdater: El usuario eligió instalar ahora. Saliendo e instalando...");
        autoUpdater.quitAndInstall();
      } else {
        log.info("AutoUpdater: El usuario eligió instalar más tarde.");
      }
    });
  });
}

// Forzar que el menú siempre esté disponible
app.on('browser-window-focus', () => {
  if (mainWindow && Menu.getApplicationMenu() === null) {
    createMenu();
  }
});

// Eventos de la aplicación
app.whenReady().then(() => {
  log.info('Evento "ready" de la aplicación. Creando ventana...');
  createWindow();
  setupAutoUpdater();
});

app.on("window-all-closed", () => {
  log.info("Todas las ventanas han sido cerradas.");
  if (process.platform !== "darwin") {
    log.info("Saliendo de la aplicación (no es macOS).");
    app.quit();
  }
});

app.on("activate", () => {
  log.info('Evento "activate" de la aplicación (macOS).');
  if (BrowserWindow.getAllWindows().length === 0) {
    log.info("No hay ventanas abiertas, creando una nueva.");
    createWindow();
  }
});

// Prevenir que el menú se oculte
app.on('ready', () => {
  if (process.platform === 'darwin') {
    // En macOS, mantener el menú visible incluso cuando no hay ventanas
    app.dock.setMenu(createMenu());
  }
});