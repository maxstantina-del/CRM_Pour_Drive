/**
 * Segmented control to switch between light / dark / system theme.
 */

import React from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme, type ThemeMode } from '../../contexts/ThemeContext';

const OPTIONS: Array<{ id: ThemeMode; label: string; Icon: typeof Sun }> = [
  { id: 'light', label: 'Clair', Icon: Sun },
  { id: 'dark', label: 'Sombre', Icon: Moon },
  { id: 'system', label: 'Système', Icon: Monitor },
];

export function ThemeToggle() {
  const { mode, setMode, effective } = useTheme();

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100">Apparence</h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Effectif : {effective === 'dark' ? '🌙 Sombre' : '☀️ Clair'}
        </span>
      </div>
      <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-0.5">
        {OPTIONS.map(({ id, label, Icon }) => {
          const active = mode === id;
          return (
            <button
              key={id}
              onClick={() => setMode(id)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded transition-colors ${
                active
                  ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 shadow-sm font-medium'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
