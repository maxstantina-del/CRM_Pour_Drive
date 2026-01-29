/**
 * LocalStorage abstraction layer with error handling
 */

/**
 * Storage keys used in the application
 */
export const STORAGE_KEYS = {
  PIPELINES: 'crm_pipelines',
  LEADS: 'crm_leads',
  CURRENT_PIPELINE: 'crm_current_pipeline',
  USER_PROFILE: 'crm_user_profile',
  USER_PREFERENCES: 'crm_user_preferences',
  EMAIL_TEMPLATES: 'crm_email_templates',
  CUSTOM_ACTIONS: 'crm_custom_actions',
  ONBOARDING_COMPLETE: 'crm_onboarding_complete',
  LICENSE_INFO: 'crm_license_info',
} as const;

/**
 * Get item from localStorage
 */
export function getItem<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return defaultValue;
    }
    return JSON.parse(item) as T;
  } catch (error) {
    console.error(`Error reading from localStorage (key: ${key}):`, error);
    return defaultValue;
  }
}

/**
 * Set item in localStorage
 */
export function setItem<T>(key: string, value: T): boolean {
  try {
    const serialized = JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.error('LocalStorage quota exceeded. Unable to save data.');
      // You might want to show a toast or alert to the user here
      return false;
    }
    console.error(`Error writing to localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * Remove item from localStorage
 */
export function removeItem(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing from localStorage (key: ${key}):`, error);
  }
}

/**
 * Clear all application data from localStorage
 */
export function clearAll(): void {
  try {
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}

/**
 * Check if localStorage is available
 */
export function isStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, 'test');
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get localStorage usage information
 */
export function getStorageInfo(): {
  used: number;
  available: boolean;
  percentUsed: number;
} {
  if (!isStorageAvailable()) {
    return { used: 0, available: false, percentUsed: 0 };
  }

  try {
    let used = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }

    // Most browsers have a 5-10MB limit, we'll use 5MB as a safe estimate
    const limit = 5 * 1024 * 1024; // 5MB in bytes
    const percentUsed = (used / limit) * 100;

    return {
      used,
      available: true,
      percentUsed: Math.min(percentUsed, 100)
    };
  } catch (error) {
    console.error('Error getting storage info:', error);
    return { used: 0, available: false, percentUsed: 0 };
  }
}

/**
 * Export all localStorage data
 */
export function exportAllData(): Record<string, any> {
  const data: Record<string, any> = {};

  Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
    const value = getItem(key, null);
    if (value !== null) {
      data[name] = value;
    }
  });

  return data;
}

/**
 * Import data to localStorage
 */
export function importAllData(data: Record<string, any>): boolean {
  try {
    Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
      if (data[name] !== undefined) {
        setItem(key, data[name]);
      }
    });
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    return false;
  }
}

/**
 * Migrate data from old keys to new keys
 */
export function migrateData(oldKey: string, newKey: string): void {
  try {
    const data = localStorage.getItem(oldKey);
    if (data !== null) {
      localStorage.setItem(newKey, data);
      localStorage.removeItem(oldKey);
      console.log(`Migrated data from ${oldKey} to ${newKey}`);
    }
  } catch (error) {
    console.error(`Error migrating data from ${oldKey} to ${newKey}:`, error);
  }
}
