import { useCallback, useEffect, useState } from 'react';
import * as service from '../services/fichesService';
import type { Fiche, FicheInput } from '../services/fichesService';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

export function useFiches(leadId: string | null) {
  const { user } = useAuth();
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!leadId || !isSupabaseConfigured()) return;
    setLoading(true);
    try {
      setFiches(await service.listFichesForLead(leadId));
    } catch (error) {
      console.error('Load fiches error', error);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    if (leadId) load();
    else setFiches([]);
  }, [leadId, load]);

  const addFiche = useCallback(
    async (input: FicheInput) => {
      if (!leadId || !user) return;
      const created = await service.createFiche(leadId, user.id, input);
      setFiches((prev) => [created, ...prev]);
      return created;
    },
    [leadId, user]
  );

  const editFiche = useCallback(
    async (id: string, input: FicheInput) => {
      const snapshot = fiches;
      setFiches((prev) => prev.map((f) => (f.id === id ? { ...f, ...input } as Fiche : f)));
      try {
        const updated = await service.updateFiche(id, input);
        setFiches((prev) => prev.map((f) => (f.id === id ? updated : f)));
        return updated;
      } catch (error) {
        setFiches(snapshot);
        throw error;
      }
    },
    [fiches]
  );

  const removeFiche = useCallback(
    async (id: string) => {
      const snapshot = fiches;
      setFiches((prev) => prev.filter((f) => f.id !== id));
      try {
        await service.deleteFiche(id);
      } catch (error) {
        setFiches(snapshot);
        throw error;
      }
    },
    [fiches]
  );

  return { fiches, loading, reload: load, addFiche, editFiche, removeFiche };
}
