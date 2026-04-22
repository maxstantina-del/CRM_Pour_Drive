/**
 * Global fiches state — loads all fiches the current user can see (their own
 * + those on shared pipelines) and keeps them in a Map<leadId, Fiche[]>. This
 * lets every view (Pipeline cards, Table, Today…) surface appointment info
 * without per-card queries. Kept fresh via Supabase Realtime.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { listAllFiches } from '../services/fichesService';
import type { Fiche } from '../services/fichesService';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { getSupabaseClient } from '../lib/supabaseClient';

interface FichesContextValue {
  fichesByLead: Map<string, Fiche[]>;
  loading: boolean;
  reload: () => Promise<void>;
}

const FichesContext = createContext<FichesContextValue | null>(null);

function groupByLead(all: Fiche[]): Map<string, Fiche[]> {
  const m = new Map<string, Fiche[]>();
  for (const f of all) {
    const arr = m.get(f.leadId) ?? [];
    arr.push(f);
    m.set(f.leadId, arr);
  }
  return m;
}

export function FichesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [all, setAll] = useState<Fiche[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured() || !user) return;
    setLoading(true);
    try {
      setAll(await listAllFiches());
    } catch (err) {
      console.error('Load fiches error', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  // Realtime: new/updated/deleted fiches instantly reflect across all views.
  useEffect(() => {
    if (!isSupabaseConfigured() || !user) return;
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel('fiches-global')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'fiches' },
        () => {
          void load();
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [user, load]);

  const fichesByLead = useMemo(() => groupByLead(all), [all]);

  const value = useMemo(
    () => ({ fichesByLead, loading, reload: load }),
    [fichesByLead, loading, load]
  );

  return <FichesContext.Provider value={value}>{children}</FichesContext.Provider>;
}

export function useAllFiches(): FichesContextValue {
  const ctx = useContext(FichesContext);
  if (!ctx) throw new Error('useAllFiches must be used inside FichesProvider');
  return ctx;
}
