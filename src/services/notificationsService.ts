/**
 * Notifications service — single source of truth for reading/marking
 * the current user's in-app notifications.
 */

import { getSupabaseClient } from '../lib/supabaseClient';

export type NotificationKind = 'lead_won';

export interface Notification {
  id: string;
  userId: string;
  kind: NotificationKind | string;
  payload: Record<string, unknown>;
  readAt: string | null;
  createdAt: string;
}

interface DbNotificationRow {
  id: string;
  user_id: string;
  kind: string;
  payload: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

function rowToNotification(r: DbNotificationRow): Notification {
  return {
    id: r.id,
    userId: r.user_id,
    kind: r.kind,
    payload: r.payload,
    readAt: r.read_at,
    createdAt: r.created_at,
  };
}

export async function listNotifications(limit = 30): Promise<Notification[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map((r) => rowToNotification(r as DbNotificationRow));
}

export async function markAsRead(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', id)
    .is('read_at', null);
  if (error) throw error;
}

export async function markAllRead(): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('notifications')
    .update({ read_at: new Date().toISOString() })
    .is('read_at', null);
  if (error) throw error;
}
