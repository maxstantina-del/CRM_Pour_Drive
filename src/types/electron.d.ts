/**
 * Types TypeScript pour l'API Electron exposée via le preload
 */

interface ElectronAPI {
  // Informations système
  getUserDataPath: () => Promise<string>;
  getAppVersion: () => Promise<string>;

  // Utilitaires
  openExternal: (url: string) => Promise<void>;
  restartApp: () => Promise<void>;

  // Database SQLite
  db: {
    query: (sql: string, params?: any[]) => Promise<any[]>;
    exec: (sql: string) => Promise<void>;
    all: (sql: string, params?: any[]) => Promise<any[]>;
    get: (sql: string, params?: any[]) => Promise<any>;
    run: (sql: string, params?: any[]) => Promise<{ lastID: number; changes: number }>;
  };

  // Auto-updater
  updater: {
    checkForUpdates: () => Promise<void>;
    downloadUpdate: () => Promise<void>;
    installUpdate: () => Promise<void>;
    onUpdateAvailable: (callback: (info: any) => void) => void;
    onUpdateDownloaded: (callback: () => void) => void;
    onDownloadProgress: (callback: (progress: number) => void) => void;
  };

  // Détection
  isElectron: boolean;
  platform: string;
}

interface Window {
  electronAPI?: ElectronAPI;
}
