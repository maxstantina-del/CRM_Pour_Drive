/**
 * Theme context: light / dark / system, persisted in localStorage.
 * Toggles the `dark` class on <html> for Tailwind's class-based darkMode.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextValue {
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
  /** Resolved light/dark after applying 'system' */
  effective: 'light' | 'dark';
}

const STORAGE_KEY = 'crm_theme_mode';
const ThemeContext = createContext<ThemeContextValue | null>(null);

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function readMode(): ThemeMode {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  } catch { /* ignore */ }
  return 'system';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => readMode());
  const [effective, setEffective] = useState<'light' | 'dark'>(() =>
    readMode() === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : (readMode() as 'light' | 'dark')
  );

  useEffect(() => {
    const resolve = () => (mode === 'system' ? (systemPrefersDark() ? 'dark' : 'light') : mode);
    const v = resolve();
    setEffective(v);
    const root = document.documentElement;
    if (v === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');

    try { localStorage.setItem(STORAGE_KEY, mode); } catch { /* ignore */ }

    if (mode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const onChange = () => {
        const next: 'light' | 'dark' = mq.matches ? 'dark' : 'light';
        setEffective(next);
        if (next === 'dark') root.classList.add('dark');
        else root.classList.remove('dark');
      };
      mq.addEventListener('change', onChange);
      return () => mq.removeEventListener('change', onChange);
    }
  }, [mode]);

  const setMode = (m: ThemeMode) => setModeState(m);

  return <ThemeContext.Provider value={{ mode, setMode, effective }}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
