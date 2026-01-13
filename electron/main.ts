import { app, BrowserWindow, ipcMain, shell } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';
import { initDatabase, closeDatabase, dbHelpers } from './database.js';
import type { UpdateInfo, ProgressInfo } from 'electron-updater';

// Use createRequire to import CommonJS modules in ESM context
const require = createRequire(import.meta.url);
const { autoUpdater } = require('electron-updater');

// Pour ESM compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Mode development ou production
const isDev = process.env.NODE_ENV === 'development';

// Configure auto-updater
autoUpdater.autoDownload = false; // Ne télécharge pas automatiquement
autoUpdater.autoInstallOnAppQuit = true; // Installe à la fermeture

let mainWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 700,
    backgroundColor: '#0f172a', // Couleur de fond du CRM
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true, // Garde la sécurité mais autorise les API externes
    },
    icon: path.join(__dirname, '../public/logo.jpg'),
    show: true, // Afficher immédiatement
    frame: true,
    titleBarStyle: 'default',
  });

  // Forcer l'affichage au premier plan
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
  });

  // Charge l'URL selon le mode
  if (isDev) {
    // En dev, charge depuis Vite dev server
    mainWindow.loadURL('http://localhost:5179');
    mainWindow.webContents.openDevTools();
  } else {
    // En prod, charge depuis les fichiers buildés
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Ouvre les liens externes dans le navigateur par défaut
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
      return { action: 'deny' };
    }
    return { action: 'allow' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ===== AUTO-UPDATER =====

function setupAutoUpdater() {
  // Log pour debug
  autoUpdater.logger = console;

  // Événements auto-updater
  autoUpdater.on('checking-for-update', () => {
    console.log('🔍 Checking for updates...');
    mainWindow?.webContents.send('update-checking');
  });

  autoUpdater.on('update-available', (info: UpdateInfo) => {
    console.log('✅ Update available:', info.version);
    mainWindow?.webContents.send('update-available', info);
  });

  autoUpdater.on('update-not-available', (info: UpdateInfo) => {
    console.log('✅ App is up to date:', info.version);
    mainWindow?.webContents.send('update-not-available', info);
  });

  autoUpdater.on('error', (err: Error) => {
    console.error('❌ Update error:', err);
    mainWindow?.webContents.send('update-error', err.message);
  });

  autoUpdater.on('download-progress', (progress: ProgressInfo) => {
    console.log(`📥 Download progress: ${progress.percent}%`);
    mainWindow?.webContents.send('update-download-progress', progress);
  });

  autoUpdater.on('update-downloaded', (info: UpdateInfo) => {
    console.log('✅ Update downloaded:', info.version);
    mainWindow?.webContents.send('update-downloaded', info);
  });
}

function checkForUpdates() {
  if (!isDev) {
    autoUpdater.checkForUpdates();
  }
}

// Crée la fenêtre quand Electron est prêt
app.whenReady().then(() => {
  // Initialise la base de données
  initDatabase();

  createWindow();

  // Configure et vérifie les mises à jour (seulement en prod)
  setupAutoUpdater();
  setTimeout(() => {
    checkForUpdates();
  }, 3000); // Vérifie 3 secondes après le démarrage

  // Sur macOS, recrée la fenêtre si l'icône dock est cliquée
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quitte l'app quand toutes les fenêtres sont fermées (sauf sur macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    closeDatabase();
    app.quit();
  }
});

// Ferme la DB avant de quitter
app.on('before-quit', () => {
  closeDatabase();
});

// Handlers IPC pour communication renderer <-> main

// Obtenir le chemin des données utilisateur
ipcMain.handle('get-user-data-path', () => {
  return app.getPath('userData');
});

// Obtenir la version de l'app
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

// Ouvrir un lien externe
ipcMain.handle('open-external', (_, url: string) => {
  return shell.openExternal(url);
});

// Redémarrer l'application (pour auto-update)
ipcMain.handle('restart-app', () => {
  app.relaunch();
  app.quit();
});

// ===== DATABASE IPC HANDLERS =====

// Generic query handlers
ipcMain.handle('db-query', (_, sql: string, params?: any[]) => {
  try {
    return { success: true, data: dbHelpers.query(sql, params) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-all', (_, sql: string, params?: any[]) => {
  try {
    return { success: true, data: dbHelpers.query(sql, params) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-get', (_, sql: string, params?: any[]) => {
  try {
    return { success: true, data: dbHelpers.get(sql, params) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-run', (_, sql: string, params?: any[]) => {
  try {
    return { success: true, data: dbHelpers.run(sql, params) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-exec', (_, sql: string) => {
  try {
    return { success: true, data: dbHelpers.exec(sql) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Pipelines
ipcMain.handle('db-get-all-pipelines', () => {
  try {
    return { success: true, data: dbHelpers.getAllPipelines() };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-create-pipeline', (_, pipeline: any) => {
  try {
    return { success: true, data: dbHelpers.createPipeline(pipeline) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-update-pipeline', (_, id: string, name: string) => {
  try {
    return { success: true, data: dbHelpers.updatePipeline(id, name) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-delete-pipeline', (_, id: string) => {
  try {
    return { success: true, data: dbHelpers.deletePipeline(id) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Leads
ipcMain.handle('db-get-all-leads', (_, pipelineId?: string) => {
  try {
    return { success: true, data: dbHelpers.getAllLeads(pipelineId) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-create-lead', (_, lead: any) => {
  try {
    return { success: true, data: dbHelpers.createLead(lead) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-update-lead', (_, id: string, updates: any) => {
  try {
    return { success: true, data: dbHelpers.updateLead(id, updates) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-delete-lead', (_, id: string) => {
  try {
    return { success: true, data: dbHelpers.deleteLead(id) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-delete-multiple-leads', (_, ids: string[]) => {
  try {
    return { success: true, data: dbHelpers.deleteMultipleLeads(ids) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// Settings
ipcMain.handle('db-get-setting', (_, key: string) => {
  try {
    return { success: true, data: dbHelpers.getSetting(key) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('db-set-setting', (_, key: string, value: string) => {
  try {
    return { success: true, data: dbHelpers.setSetting(key, value) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
});

// ===== AUTO-UPDATER IPC HANDLERS =====

// Vérifier les mises à jour manuellement
ipcMain.handle('check-for-updates', () => {
  if (!isDev) {
    autoUpdater.checkForUpdates();
  }
  return { success: true };
});

// Télécharger la mise à jour
ipcMain.handle('download-update', () => {
  if (!isDev) {
    autoUpdater.downloadUpdate();
  }
  return { success: true };
});

// Installer et redémarrer
ipcMain.handle('install-update', () => {
  if (!isDev) {
    autoUpdater.quitAndInstall(false, true);
  }
  return { success: true };
});

// Handler pour les erreurs non gérées
process.on('uncaughtException', (error) => {
  console.error('Uncaught exception:', error);
});
