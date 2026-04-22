/**
 * Live notifications hook. Loads the last 30, subscribes to Realtime INSERTs
 * for the current user, exposes unread count, mark-as-read helpers, and a
 * callback invoked on each new notification (for toast display).
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import * as service from '../services/notificationsService';
import type { Notification } from '../services/notificationsService';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

export type OnNotificationArrival = (notif: Notification) => void;

export function useNotifications(onArrival?: OnNotificationArrival) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const onArrivalRef = useRef(onArrival);

  // keep the latest callback without resubscribing
  useEffect(() => {
    onArrivalRef.current = onArrival;
  }, [onArrival]);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured() || !user) return;
    setLoading(true);
    try {
      const list = await service.listNotifications();
      setNotifications(list);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!isSupabaseConfigured() || !user || !supabase) return;
    const client = supabase;
    const channel = client
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const row = payload.new as {
            id: string;
            user_id: string;
            kind: string;
            payload: Record<string, unknown>;
            read_at: string | null;
            created_at: string;
          };
          const notif: Notification = {
            id: row.id,
            userId: row.user_id,
            kind: row.kind,
            payload: row.payload,
            readAt: row.read_at,
            createdAt: row.created_at,
          };
          setNotifications((prev) => [notif, ...prev].slice(0, 30));
          onArrivalRef.current?.(notif);
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [user]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id && !n.readAt ? { ...n, readAt: new Date().toISOString() } : n))
    );
    try {
      await service.markAsRead(id);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const markAllRead = useCallback(async () => {
    const now = new Date().toISOString();
    setNotifications((prev) => prev.map((n) => (n.readAt ? n : { ...n, readAt: now })));
    try {
      await service.markAllRead();
    } catch (err) {
      console.error(err);
    }
  }, []);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return { notifications, unreadCount, loading, reload: load, markAsRead, markAllRead };
}
