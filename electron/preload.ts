import { contextBridge, ipcRenderer } from 'electron';

/**
 * Preload script - Pont sécurisé entre Electron et le renderer
 *
 * Ce script s'exécute avant le chargement de l'application web et expose
 * des APIs sécurisées au renderer via contextBridge.
 */

// API exposée au renderer (accessible via window.electronAPI)
const electronAPI = {
  // Informations système
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Utilitaires
  openExternal: (url: string) => ipcRenderer.invoke('open-external', url),
  restartApp: () => ipcRenderer.invoke('restart-app'),

  // Database (SQLite - à implémenter)
  db: {
    query: (sql: string, params?: any[]) => ipcRenderer.invoke('db-query', sql, params),
    exec: (sql: string) => ipcRenderer.invoke('db-exec', sql),
    all: (sql: string, params?: any[]) => ipcRenderer.invoke('db-all', sql, params),
    get: (sql: string, params?: any[]) => ipcRenderer.invoke('db-get', sql, params),
    run: (sql: string, params?: any[]) => ipcRenderer.invoke('db-run', sql, params),
  },

  // Auto-updater
  updater: {
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    downloadUpdate: () => ipcRenderer.invoke('download-update'),
    installUpdate: () => ipcRenderer.invoke('install-update'),
    onUpdateAvailable: (callback: (info: any) => void) => {
      ipcRenderer.on('update-available', (_, info) => callback(info));
    },
    onUpdateDownloaded: (callback: () => void) => {
      ipcRenderer.on('update-downloaded', () => callback());
    },
    onDownloadProgress: (callback: (progress: number) => void) => {
      ipcRenderer.on('download-progress', (_, progress) => callback(progress));
    },
  },

  // Détection environnement
  isElectron: true,
  platform: process.platform,
};

// Expose l'API de manière sécurisée
contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// Types pour TypeScript (à ajouter dans global.d.ts)
export type ElectronAPI = typeof electronAPI;
