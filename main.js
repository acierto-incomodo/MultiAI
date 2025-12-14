const { app, BrowserWindow, Menu, shell, ipcMain } = require("electron");
const path = require("path");

let mainWindow;

function createWindow() {
  // Crear la ventana principal
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    autoHideMenuBar: false, // Asegura que la barra de menú sea visible en Linux/Windows
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

  // Mostrar ventana cuando esté lista
  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    mainWindow.maximize();
  });

  // Crear y establecer el menú de la aplicación
  createMenu();

  // Abrir DevTools en desarrollo
  if (process.env.NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  // Manejar el cierre de la ventana
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Crear menú contextual (clic derecho)
  mainWindow.webContents.on('context-menu', (e, params) => {
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
            mainWindow.loadURL("https://cardinal-ai-h4rt.vercel.app/");
          },
        },
        {
          label: "ChatGPT",
          accelerator: 'CmdOrCtrl+2',
          click: () => {
            mainWindow.loadURL("https://chatgpt.com/");
          },
        },
        {
          label: "Copilot",
          accelerator: 'CmdOrCtrl+3',
          click: () => {
            mainWindow.loadURL("https://copilot.microsoft.com/");
          },
        },
        {
          label: "Deepseek",
          accelerator: 'CmdOrCtrl+4',
          click: () => {
            mainWindow.loadURL("https://chat.deepseek.com");
          },
        },
        {
          label: "Perplexity AI",
          accelerator: 'CmdOrCtrl+5',
          click: () => {
            mainWindow.loadURL("https://www.perplexity.ai/");
          },
        },
        {
          label: "Claude",
          accelerator: 'CmdOrCtrl+6',
          click: () => {
            mainWindow.loadURL("https://claude.ai/");
          },
        },
        {
          label: "Gemini",
          accelerator: 'CmdOrCtrl+7',
          click: () => {
            mainWindow.loadURL("https://gemini.google.com/");
          },
        },
        {
          label: "Mistral AI",
          accelerator: 'CmdOrCtrl+8',
          click: () => {
            mainWindow.loadURL("https://chat.mistral.ai/");
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
            mainWindow.loadFile("index.html");
          },
        },
        { type: "separator" },
        {
          label: "Atrás",
          accelerator: 'Alt+Left',
          click: () => {
            if (mainWindow.webContents.canGoBack()) {
              mainWindow.webContents.goBack();
            }
          },
        },
        {
          label: "Adelante",
          accelerator: 'Alt+Right',
          click: () => {
            if (mainWindow.webContents.canGoForward()) {
              mainWindow.webContents.goForward();
            }
          },
        },
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
            mainWindow.setFullScreen(!mainWindow.isFullScreen());
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
              shell.openExternal(currentURL);
            }
          },
        },
        {
          label: "Atajos de Teclado",
          accelerator: 'CmdOrCtrl+K',
          click: () => {
            mainWindow.loadFile("shortcuts.html");
          },
        },
        { type: "separator" },
        {
          label: "Acerca de MultiAI",
          click: () => {
            const { dialog } = require('electron');
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: 'Acerca de MultiAI',
              message: 'MultiAI v1.1.1',
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
  if (mainWindow) {
    mainWindow.loadURL(url);
    return true;
  }
  return false;
});

ipcMain.handle("go-back", () => {
  if (mainWindow && mainWindow.webContents.canGoBack()) {
    mainWindow.webContents.goBack();
    return true;
  }
  return false;
});

ipcMain.handle("go-home", () => {
  if (mainWindow) {
    mainWindow.loadFile("index.html");
    return true;
  }
  return false;
});

ipcMain.handle("window-control", (event, action) => {
  if (mainWindow) {
    if (action === 'close') {
      mainWindow.close();
      return true;
    }
  }
  return false;
});

// Forzar que el menú siempre esté disponible
app.on('browser-window-focus', () => {
  if (mainWindow && Menu.getApplicationMenu() === null) {
    createMenu();
  }
});

// Eventos de la aplicación
app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
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