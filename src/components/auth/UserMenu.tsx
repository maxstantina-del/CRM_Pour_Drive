import { useState, useRef, useEffect } from 'react';
import { LogOut, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export function UserMenu() {
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (!user) return null;
  const initial = (user.email ?? '?').charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-9 h-9 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center justify-center transition-colors"
        title={user.email ?? 'Compte'}
        aria-label="Menu utilisateur"
      >
        {initial}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white">
              <UserIcon className="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span className="text-sm font-medium truncate">{user.email}</span>
            </div>
          </div>
          <button
            onClick={async () => {
              setOpen(false);
              await signOut();
            }}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Se déconnecter
          </button>
        </div>
      )}
    </div>
  );
}
