/**
 * Storage adapter - automatically uses SQLite in Electron or localStorage in browser
 */

interface ElectronAPI {
  db: {
    query: (sql: string, params?: any[]) => Promise<{ success: boolean; data?: any; error?: string }>;
    get: (sql: string, params?: any[]) => Promise<{ success: boolean; data?: any; error?: string }>;
    run: (sql: string, params?: any[]) => Promise<{ success: boolean; data?: any; error?: string }>;
  };
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI?.isElectron === true;
};

export const storage = {
  /**
   * Get item from storage
   */
  async getItem(key: string): Promise<string | null> {
    if (isElectron()) {
      try {
        const result = await window.electronAPI!.db.get(
          'SELECT value FROM settings WHERE key = ?',
          [key]
        );
        if (result.success && result.data) {
          return result.data.value;
        }
        return null;
      } catch (error) {
        console.error('Error getting item from SQLite:', error);
        return null;
      }
    } else {
      return localStorage.getItem(key);
    }
  },

  /**
   * Set item in storage
   */
  async setItem(key: string, value: string): Promise<void> {
    if (isElectron()) {
      try {
        await window.electronAPI!.db.run(
          'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
          [key, value]
        );
      } catch (error) {
        console.error('Error setting item in SQLite:', error);
        throw error;
      }
    } else {
      localStorage.setItem(key, value);
    }
  },

  /**
   * Remove item from storage
   */
  async removeItem(key: string): Promise<void> {
    if (isElectron()) {
      try {
        await window.electronAPI!.db.run(
          'DELETE FROM settings WHERE key = ?',
          [key]
        );
      } catch (error) {
        console.error('Error removing item from SQLite:', error);
        throw error;
      }
    } else {
      localStorage.removeItem(key);
    }
  },

  /**
   * Check if we're in Electron environment
   */
  isElectron,
};
