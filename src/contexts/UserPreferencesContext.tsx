/**
 * User preferences context — charge les préférences de l'utilisateur connecté
 * (preset email notamment) et expose une fonction de mise à jour. Realtime
 * synchronise les changements entre appareils.
 */

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  getUserPreferences,
  upsertUserPreferences,
  type UserPreferences,
} from '../services/userPreferencesService';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { getSupabaseClient } from '../lib/supabaseClient';

interface Ctx {
  prefs: UserPreferences | null;
  loading: boolean;
  update: (updates: Partial<Pick<UserPreferences, 'emailSubject' | 'emailBody' | 'emailAttachmentUrl'>>) => Promise<void>;
  reload: () => Promise<void>;
}

const UserPreferencesContext = createContext<Ctx | null>(null);

export function UserPreferencesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<UserPreferences | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!user || !isSupabaseConfigured()) return;
    setLoading(true);
    try {
      setPrefs(await getUserPreferences(user.id));
    } catch (err) {
      console.error('Load user preferences failed', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) load();
    else setPrefs(null);
  }, [user, load]);

  // Realtime : changements d'une session → sync sur les autres
  useEffect(() => {
    if (!user || !isSupabaseConfigured()) return;
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`user-prefs-${user.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'user_preferences', filter: `user_id=eq.${user.id}` },
        () => { void load(); }
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  }, [user, load]);

  const update = useCallback(
    async (updates: Partial<Pick<UserPreferences, 'emailSubject' | 'emailBody' | 'emailAttachmentUrl'>>) => {
      if (!user) return;
      const prev = prefs;
      // Optimistic : applique tout de suite
      setPrefs((p) => ({
        userId: user.id,
        emailSubject: updates.emailSubject !== undefined ? updates.emailSubject : p?.emailSubject ?? null,
        emailBody: updates.emailBody !== undefined ? updates.emailBody : p?.emailBody ?? null,
        emailAttachmentUrl: updates.emailAttachmentUrl !== undefined ? updates.emailAttachmentUrl : p?.emailAttachmentUrl ?? null,
        updatedAt: new Date().toISOString(),
      }));
      try {
        const saved = await upsertUserPreferences(user.id, {
          emailSubject: updates.emailSubject !== undefined ? updates.emailSubject : prev?.emailSubject ?? null,
          emailBody: updates.emailBody !== undefined ? updates.emailBody : prev?.emailBody ?? null,
          emailAttachmentUrl: updates.emailAttachmentUrl !== undefined ? updates.emailAttachmentUrl : prev?.emailAttachmentUrl ?? null,
        });
        setPrefs(saved);
      } catch (err) {
        setPrefs(prev);
        throw err;
      }
    },
    [user, prefs]
  );

  const value = useMemo<Ctx>(() => ({ prefs, loading, update, reload: load }), [prefs, loading, update, load]);

  return <UserPreferencesContext.Provider value={value}>{children}</UserPreferencesContext.Provider>;
}

export function useUserPreferences(): Ctx {
  const ctx = useContext(UserPreferencesContext);
  if (!ctx) throw new Error('useUserPreferences must be used inside UserPreferencesProvider');
  return ctx;
}
