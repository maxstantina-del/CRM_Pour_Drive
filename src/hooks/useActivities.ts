import { useCallback, useEffect, useState } from 'react';
import * as service from '../services/activitiesService';
import type { Activity, ActivityType } from '../services/activitiesService';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { getSupabaseClient } from '../lib/supabaseClient';

export function useActivities(leadId: string | null) {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!leadId || !isSupabaseConfigured()) return;
    setLoading(true);
    try {
      setActivities(await service.listActivitiesForLead(leadId));
    } catch (error) {
      console.error('Load activities error', error);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    if (leadId) load();
    else setActivities([]);
  }, [leadId, load]);

  // Realtime : INSERT/UPDATE/DELETE on activities for this lead → re-sync.
  // Sans ça, quand Nicolas log un appel sur un lead que Max a ouvert, Max ne
  // voit rien tant qu'il ne F5 pas. Pattern miroir de useAttachments.
  useEffect(() => {
    if (!leadId || !isSupabaseConfigured() || !user) return;
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`activities-${leadId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'activities', filter: `lead_id=eq.${leadId}` },
        () => {
          void load();
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [leadId, user, load]);

  const addActivity = useCallback(
    async (type: ActivityType, payload: Record<string, unknown> = {}) => {
      if (!leadId || !user) return;
      const created = await service.createActivity(leadId, user.id, type, payload);
      setActivities(prev => [created, ...prev]);
      return created;
    },
    [leadId, user]
  );

  const removeActivity = useCallback(
    async (id: string) => {
      const snapshot = activities;
      setActivities(prev => prev.filter(a => a.id !== id));
      try {
        await service.deleteActivity(id);
      } catch (error) {
        setActivities(snapshot);
        throw error;
      }
    },
    [activities]
  );

  return { activities, loading, reload: load, addActivity, removeActivity };
}
