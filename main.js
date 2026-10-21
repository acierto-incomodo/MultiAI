const {
  app,
  BrowserWindow,
  Menu,
  shell,
  ipcMain,
  dialog,
} = require("electron");
const path = require("path");
const fs = require("fs");
const { autoUpdater } = require("electron-updater");
const log = require("electron-log");

// Configura electron-log
log.transports.file.level = "info";
log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";
// Captura excepciones no controladas
log.catchErrors();

autoUpdater.logger = log;

// Configuración centralizada de asistentes
const ASSISTANTS = [
  {
    id: "cardinal",
    name: "CardinalAI",
    url: "https://cardinal-ai-h4rt.vercel.app/",
    acc: "1",
    blocked: true,
  },
  { id: "chatgpt", name: "ChatGPT", url: "https://chatgpt.com/", acc: "2" },
  { id: "claude", name: "Claude", url: "https://claude.ai/", acc: "3" },
  {
    id: "copilot",
    name: "Copilot",
    url: "https://copilot.microsoft.com/",
    acc: "4",
  },
  {
    id: "deepseek",
    name: "Deepseek",
    url: "https://chat.deepseek.com",
    acc: "5",
  },
  { id: "gemini", name: "Gemini", url: "https://gemini.google.com/", acc: "6" },
  { id: "grok", name: "Grok", url: "https://grok.com/", acc: "7" },
  { id: "kimi", name: "Kimi", url: "https://www.kimi.ai/" },
  {
    id: "mistral",
    name: "Mistral AI",
    url: "https://chat.mistral.ai/",
    acc: "8",
  },
  {
    id: "notebooklm",
    name: "NotebookLM",
    url: "https://notebooklm.google.com/",
    acc: "9",
  },
  {
    id: "perplexity",
    name: "Perplexity AI",
    url: "https://www.perplexity.ai/",
    acc: "0",
  },
];

const DEFAULT_SHORTCUTS = {
  ...Object.fromEntries(
    ASSISTANTS.map((assistant) => [
      `assistant_${assistant.id}`,
      assistant.acc ? `CmdOrCtrl+${assistant.acc}` : "",
    ]),
  ),
  assistant_kimi: "",
  home: "CmdOrCtrl+H",
  homeEscape: "Esc",
  back: "Alt+Left",
  forward: "Alt+Right",
  zoomIn: "CmdOrCtrl+=",
  zoomOut: "CmdOrCtrl+-",
  resetZoom: "CmdOrCtrl+Shift+0",
  reload: "CmdOrCtrl+R",
  forceReload: "CmdOrCtrl+Shift+R",
  minimize: "CmdOrCtrl+M",
  close: "CmdOrCtrl+W",
  fullscreen: "F11",
  devTools: "F12",
  openExternal: "CmdOrCtrl+O",
  shortcuts: "CmdOrCtrl+K",
};
const SHORTCUT_KEY_PATTERN =
  /^(?:(?:CmdOrCtrl|Ctrl|Alt|Shift|Super)\+)*(?:[A-Z0-9]|F(?:[1-9]|1[0-9]|2[0-4])|Esc|Space|Tab|Backspace|Delete|Insert|Home|End|PageUp|PageDown|Up|Down|Left|Right|Plus|Minus|=|,|\.|\/|\\|;|'|\[|\]|`|\-)$/i;
let shortcutSettings = { ...DEFAULT_SHORTCUTS };
let appLanguage = null;

function normalizeShortcut(value) {
  const parts = value.toLowerCase().split("+");
  const key = parts.pop();
  const modifiers = [
    ...new Set(
      parts.map((modifier) =>
        ["cmdorctrl", "super"].includes(modifier) ? "ctrl" : modifier,
      ),
    ),
  ].sort();
  return [...modifiers, key].join("+");
}

function validateShortcutSettings(settings) {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    throw new Error("La configuración de atajos no es válida.");
  }

  const normalized = { ...DEFAULT_SHORTCUTS };
  for (const [key, value] of Object.entries(settings)) {
    if (!Object.hasOwn(DEFAULT_SHORTCUTS, key)) continue;
    if (typeof value !== "string") {
      throw new Error(`El atajo "${key}" debe ser una cadena.`);
    }
    if (value && !SHORTCUT_KEY_PATTERN.test(value)) {
      throw new Error(`El formato del atajo "${key}" no es válido.`);
    }
    normalized[key] = value;
  }

  const usedShortcuts = new Set();
  for (const [key, value] of Object.entries(normalized)) {
    if (!value) continue;
    const canonical = normalizeShortcut(value);
    if (usedShortcuts.has(canonical)) {
      throw new Error(`El atajo "${value}" está asignado más de una vez.`);
    }
    usedShortcuts.add(canonical);
  }
  return normalized;
}

function loadShortcutSettings() {
  const settingsPath = path.join(app.getPath("userData"), "shortcuts.json");
  try {
    shortcutSettings = validateShortcutSettings(
      JSON.parse(fs.readFileSync(settingsPath, "utf8")),
    );
  } catch (error) {
    if (error.code !== "ENOENT") {
      log.error("No se pudieron cargar los atajos configurados:", error);
    }
  }
}

function loadAppLanguage() {
  const settingsPath = path.join(app.getPath("userData"), "settings.json");
  try {
    const settings = JSON.parse(fs.readFileSync(settingsPath, "utf8"));
    if (settings.language === "es" || settings.language === "en") {
      appLanguage = settings.language;
    }
  } catch (error) {
    if (error.code !== "ENOENT") {
      log.error("No se pudo cargar el idioma configurado:", error);
    }
  }
}

function getShortcut(key) {
  return shortcutSettings[key] || undefined;
}

function getUrlFromArgs(argv) {
  const arg = argv.find((a) => a.startsWith("--"));
  if (!arg) return null;
  const key = arg.replace("--", "");
  const assistant = ASSISTANTS.find((a) => a.id === key);
  return assistant ? assistant.url : null;
}

let mainWindow;

// Prevenir múltiples instancias de la aplicación
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  log.warn("Se intentó abrir una segunda instancia, cerrando...");
  app.quit();
} else {
  app.on("second-instance", (event, commandLine, workingDirectory) => {
    // Si el usuario intenta abrir otra instancia, traer la existente al frente
    log.info(
      "Detectada segunda instancia. Trayendo la ventana principal al frente.",
    );
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();

      // Manejar argumentos en segunda instancia
      const newUrl = getUrlFromArgs(commandLine);
      if (newUrl) {
        mainWindow.loadURL(newUrl);
        log.info(
          `Navegando a URL por argumento (segunda instancia): ${newUrl}`,
        );
      }
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
    icon: path.join(__dirname, "assets/icons/icon.png"),
    show: false,
  });

  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (
      input.type !== "keyDown" ||
      !getShortcut("homeEscape") ||
      mainWindow.webContents.getURL().endsWith("/settings.html")
    ) {
      return;
    }

    const keyAliases = {
      Escape: "Esc",
      ArrowLeft: "Left",
      ArrowRight: "Right",
      ArrowUp: "Up",
      ArrowDown: "Down",
    };
    const key = keyAliases[input.key] || input.key;
    const parts = [];
    if (input.meta || input.control) parts.push("CmdOrCtrl");
    if (input.alt) parts.push("Alt");
    if (input.shift) parts.push("Shift");
    parts.push(key);

    if (
      normalizeShortcut(parts.join("+")) ===
      normalizeShortcut(getShortcut("homeEscape"))
    ) {
      event.preventDefault();
      mainWindow.loadFile("index.html");
    }
  });

  // Verificar argumentos de línea de comandos para carga inicial
  const startUrl = getUrlFromArgs(process.argv);
  if (startUrl) {
    mainWindow.loadURL(startUrl);
    log.info(`Cargando URL por argumento: ${startUrl}`);
  } else {
    // Cargar la página principal
    mainWindow.loadFile("index.html");
    log.info("Cargando index.html en la ventana principal.");
  }

  // Mostrar ventana cuando esté lista
  mainWindow.once("ready-to-show", () => {
    log.info("La ventana está lista para mostrarse. Maximizando y mostrando.");
    mainWindow.maximize();
    mainWindow.show();
  });

  // Forzar que todos los enlaces se abran en la misma ventana
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    log.info(
      `Interceptada apertura de nueva ventana. Cargando en la misma ventana: ${url}`,
    );
    mainWindow.loadURL(url);
    return { action: "deny" };
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
      { role: "undo", label: "Deshacer" },
      { role: "redo", label: "Rehacer" },
      { type: "separator" },
      { role: "cut", label: "Cortar" },
      { role: "copy", label: "Copiar" },
      { role: "paste", label: "Pegar" },
      { type: "separator" },
      { role: "reload", label: "Recargar" },
      { role: "toggleDevTools", label: "Herramientas Desarrollo" },
    ]);
    contextMenu.popup(mainWindow, params.x, params.y);
  });
}

function createMenu() {
  const template = [
    {
      label: "Asistentes IA",
      submenu: ASSISTANTS.map((a) => ({
        label: a.name,
        accelerator: getShortcut(`assistant_${a.id}`),
        click: () => {
          if (a.blocked) {
            log.info(`Menu: Intento de acceder a ${a.name} bloqueado.`);
            if (mainWindow) {
              mainWindow.webContents.send("show-blocked-alert");
            }
          } else {
            log.info(`Menu: Navegando a ${a.name}.`);
            mainWindow.loadURL(a.url);
          }
        },
      })),
    },
    {
      label: "Navegación",
      submenu: [
        {
          label: "Página Principal",
          accelerator: getShortcut("home"),
          click: () => {
            log.info("Menu: Navegando a la página principal.");
            mainWindow.loadFile("index.html");
          },
        },
        { type: "separator" },
        {
          label: "Atrás",
          accelerator: getShortcut("back"),
          click: () => {
            if (mainWindow.webContents.canGoBack()) {
              log.info("Menu: Navegando hacia atrás.");
              mainWindow.webContents.goBack();
            }
          },
        },
        {
          label: "Adelante",
          accelerator: getShortcut("forward"),
          click: () => {
            if (mainWindow.webContents.canGoForward()) {
              log.info("Menu: Navegando hacia adelante.");
              mainWindow.webContents.goForward();
            }
          },
        },
        { type: "separator" },
        {
          role: "zoomIn",
          label: "Acercar",
          accelerator: getShortcut("zoomIn"),
        },
        {
          role: "zoomOut",
          label: "Alejar",
          accelerator: getShortcut("zoomOut"),
        },
        {
          role: "resetZoom",
          label: "Restablecer Zoom",
          accelerator: getShortcut("resetZoom"),
        },
        { type: "separator" },
        {
          role: "reload",
          label: "Recargar",
          accelerator: getShortcut("reload"),
        },
        {
          role: "forceReload",
          label: "Forzar Recarga",
          accelerator: getShortcut("forceReload"),
        },
        {
          role: "toggleDevTools",
          label: "Herramientas Desarrollo",
          accelerator: getShortcut("devTools"),
        },
      ],
    },
    {
      label: "Ventana",
      submenu: [
        {
          role: "minimize",
          label: "Minimizar",
          accelerator: getShortcut("minimize"),
        },
        {
          role: "close",
          label: "Cerrar",
          accelerator: getShortcut("close"),
        },
        { type: "separator" },
        { role: "front", label: "Traer al Frente" },
        {
          label: "Toggle Full Screen",
          accelerator: getShortcut("fullscreen"),
          click: () => {
            const isFullScreen = !mainWindow.isFullScreen();
            log.info(`Menu: Cambiando a pantalla completa: ${isFullScreen}.`);
            mainWindow.setFullScreen(isFullScreen);
          },
        },
      ],
    },
    {
      label: "Ayuda",
      submenu: [
        {
          label: "Abrir en Navegador Externo",
          accelerator: getShortcut("openExternal"),
          click: () => {
            const currentURL = mainWindow.webContents.getURL();
            if (currentURL && !currentURL.startsWith("file://")) {
              log.info(`Menu: Abriendo URL externa: ${currentURL}`);
              shell.openExternal(currentURL);
            } else {
              log.warn(
                `Menu: No se puede abrir en navegador externo. URL actual: ${currentURL}`,
              );
            }
          },
        },
        {
          label: "Atajos de Teclado",
          accelerator: getShortcut("shortcuts"),
          click: () => {
            log.info("Menu: Mostrando atajos de teclado.");
            mainWindow.loadFile("shortcuts.html");
          },
        },
        { type: "separator" },
        {
          label: "Verificar Actualizaciones",
          visible: !process.windowsStore,
          click: () => {
            log.info(
              "Iniciada la búsqueda manual de actualizaciones desde el menú.",
            );
            autoUpdater.checkForUpdates();
          },
        },
        { type: "separator" },
        {
          label: "Acerca de MultiAI",
          click: () => {
            log.info("Menu: Mostrando diálogo 'Acerca de'.");
            const { dialog } = require("electron");
            const packageJson = require("./package.json");
            dialog.showMessageBox(mainWindow, {
              type: "info",
              title: "Acerca de MultiAI",
              message: `MultiAI v${packageJson.version}`,
              detail:
                "Centro de asistentes de inteligencia artificial\nDesarrollado por StormGamesStudios",
            });
          },
        },
      ],
    },
  ];

  // Agregar menú específico para macOS
  if (process.platform === "darwin") {
    template.unshift({
      label: app.getName(),
      submenu: [
        { role: "about", label: "Acerca de AI Hub" },
        { type: "separator" },
        { role: "services", label: "Servicios" },
        { type: "separator" },
        { role: "hide", label: "Ocultar AI Hub" },
        { role: "hideothers", label: "Ocultar Otros" },
        { role: "unhide", label: "Mostrar Todo" },
        { type: "separator" },
        { role: "quit", label: "Salir de AI Hub" },
      ],
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
    if (action === "close") {
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

ipcMain.handle("get-shortcut-settings", () => ({ ...shortcutSettings }));

ipcMain.handle("save-shortcut-settings", async (event, settings) => {
  if (!event.senderFrame || !event.senderFrame.url.startsWith("file://")) {
    throw new Error("No se permite cambiar atajos desde esta página.");
  }

  const validatedSettings = validateShortcutSettings(settings);
  const settingsPath = path.join(app.getPath("userData"), "shortcuts.json");
  await fs.promises.writeFile(
    settingsPath,
    JSON.stringify(validatedSettings, null, 2),
    "utf8",
  );
  shortcutSettings = validatedSettings;
  createMenu();
  return { ...shortcutSettings };
});

ipcMain.handle("get-app-language", () => appLanguage);

ipcMain.handle("save-app-language", async (event, language) => {
  if (!event.senderFrame || !event.senderFrame.url.startsWith("file://")) {
    throw new Error("No se permite cambiar el idioma desde esta página.");
  }
  if (language !== "es" && language !== "en") {
    throw new Error("El idioma seleccionado no es válido.");
  }

  const settingsPath = path.join(app.getPath("userData"), "settings.json");
  await fs.promises.writeFile(
    settingsPath,
    JSON.stringify({ language }, null, 2),
    "utf8",
  );
  appLanguage = language;
  return appLanguage;
});

ipcMain.on("check-for-updates", () => {
  log.info(
    "IPC: Recibida solicitud para buscar actualizaciones desde la página de actualizaciones.",
  );
  if (app.isPackaged) {
    autoUpdater.checkForUpdates().catch((err) => {
      log.error("Error al buscar actualizaciones (manual):", err);
      if (mainWindow) {
        mainWindow.webContents.send("update-state", "error", {
          message: err.message,
        });
      }
    });
  } else {
    log.warn(
      "IPC: Omitiendo búsqueda de actualizaciones en modo de desarrollo.",
    );
    if (mainWindow) {
      // Simula un evento para una experiencia de UI consistente en desarrollo
      setTimeout(() => {
        mainWindow.webContents.send("update-state", "update-not-available", {
          version: app.getVersion(),
        });
      }, 1500);
    }
  }
});

ipcMain.on("quit-and-install-update", () => {
  log.info("IPC: Recibida solicitud para salir e instalar la actualización.");
  if (app.isPackaged) {
    autoUpdater.quitAndInstall();
  }
});

// Configuración del actualizador automático
let autoUpdaterSetupDone = false;

function setupAutoUpdater() {
  // Solo buscar actualizaciones si la app está empaquetada (producción)
  if (!app.isPackaged || autoUpdaterSetupDone || process.windowsStore) {
    return;
  }
  autoUpdaterSetupDone = true;

  log.info("AutoUpdater: Configurando el actualizador automático.");

  // Limpiar listeners previos para evitar duplicados
  autoUpdater.removeAllListeners();

  autoUpdater.on("checking-for-update", () => {
    log.info("AutoUpdater: Buscando actualizaciones...");
    if (mainWindow) {
      mainWindow.setProgressBar(2); // Estado indeterminado
      mainWindow.webContents.send("update-state", "checking-for-update");
    }
  });

  // Inicia la primera búsqueda al arrancar
  autoUpdater.checkForUpdates().catch((err) => {
    log.error("Error en la búsqueda inicial:", err);
  });

  // Verificar actualizaciones cada 30 minutos
  setInterval(
    () => {
      log.info("AutoUpdater: Buscando actualizaciones (intervalo de 30 min).");
      autoUpdater
        .checkForUpdates()
        .catch((err) => log.error("Error en intervalo:", err));
    },
    30 * 60 * 1000,
  );

  // Evento cuando hay una actualización disponible
  autoUpdater.on("update-available", (info) => {
    log.info(`AutoUpdater: Actualización disponible: ${info.version}`);
    if (mainWindow) {
      mainWindow.webContents.send("update-state", "update-available", info);
    }
  });

  // Evento cuando no hay actualización disponible
  autoUpdater.on("update-not-available", (info) => {
    log.info(
      `AutoUpdater: No hay actualizaciones disponibles. Remota: ${info.version}, Actual: ${app.getVersion()}`,
    );
    if (mainWindow) {
      mainWindow.setProgressBar(-1); // Limpiar barra de progreso
      mainWindow.webContents.send("update-state", "update-not-available", info);
    }
  });

  // Evento cuando ha fallado la búsqueda
  autoUpdater.on("error", (error) => {
    log.error("Error en autoUpdater:", error);
    if (mainWindow) {
      mainWindow.setProgressBar(-1); // Limpiar barra de progreso en error
      mainWindow.webContents.send("update-state", "error", error);
    }
  });

  // Evento de progreso de descarga
  autoUpdater.on("download-progress", (progressObj) => {
    let log_message = `Velocidad de descarga: ${progressObj.bytesPerSecond} - Descargado ${progressObj.percent}% (${progressObj.transferred}/${progressObj.total})`;
    log.info(`AutoUpdater: ${log_message}`);
    if (mainWindow) {
      mainWindow.setProgressBar(progressObj.percent / 100);
      mainWindow.webContents.send(
        "update-state",
        "download-progress",
        progressObj,
      );
    }
  });

  // Evento cuando la actualización se ha descargado
  autoUpdater.on("update-downloaded", (info) => {
    log.info(
      `AutoUpdater: Actualización v${info.version} descargada. Notificando al renderer y mostrando diálogo.`,
    );
    if (mainWindow) {
      mainWindow.setProgressBar(-1); // Limpiar barra de progreso
      mainWindow.webContents.send("update-state", "update-downloaded", info);
    }
    dialog
      .showMessageBox(mainWindow, {
        type: "info",
        title: "Actualización disponible",
        message: `MultiAI v${info.version} está lista para instalar`,
        detail: "Se descargó la actualización. ¿Quieres instalarla ahora?",
        buttons: ["Instalar ahora", "Más tarde"],
      })
      .then((result) => {
        if (result.response === 0) {
          // Instalar actualización inmediatamente
          log.info(
            "AutoUpdater: El usuario eligió instalar ahora. Saliendo e instalando...",
          );
          autoUpdater.quitAndInstall();
        } else {
          log.info("AutoUpdater: El usuario eligió instalar más tarde.");
        }
      });
  });
}

// Forzar que el menú siempre esté disponible
app.on("browser-window-focus", () => {
  if (mainWindow && Menu.getApplicationMenu() === null) {
    createMenu();
  }
});

// Eventos de la aplicación
app.whenReady().then(() => {
  log.info('Evento "ready" de la aplicación. Creando ventana...');
  loadShortcutSettings();
  loadAppLanguage();
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
app.on("ready", () => {
  if (process.platform === "darwin") {
    // En macOS, mantener el menú visible incluso cuando no hay ventanas
    app.dock.setMenu(createMenu());
  }
});
