/**
 * Activity service: per-lead timeline (call/email/meeting/note/stage_change/task).
 */

import { getSupabaseClient } from '../lib/supabaseClient';

export type ActivityType = 'call' | 'email' | 'meeting' | 'note' | 'stage_change' | 'task';

export interface Activity {
  id: string;
  leadId: string;
  ownerId: string | null;
  type: ActivityType;
  payload: Record<string, unknown>;
  occurredAt: string;
  createdAt: string;
}

interface DbActivityRow {
  id: string;
  lead_id: string;
  owner_id: string | null;
  type: string;
  payload: Record<string, unknown>;
  occurred_at: string;
  created_at: string;
}

function rowToActivity(r: DbActivityRow): Activity {
  return {
    id: r.id,
    leadId: r.lead_id,
    ownerId: r.owner_id,
    type: r.type as ActivityType,
    payload: r.payload ?? {},
    occurredAt: r.occurred_at,
    createdAt: r.created_at,
  };
}

export async function listActivitiesForLead(leadId: string, limit = 50): Promise<Activity[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('activities')
    .select('*')
    .eq('lead_id', leadId)
    .order('occurred_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(r => rowToActivity(r as DbActivityRow));
}

export async function createActivity(
  leadId: string,
  ownerId: string,
  type: ActivityType,
  payload: Record<string, unknown> = {},
  occurredAt?: string
): Promise<Activity> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('activities')
    .insert({
      lead_id: leadId,
      owner_id: ownerId,
      type,
      payload,
      occurred_at: occurredAt ?? new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;
  return rowToActivity(data as DbActivityRow);
}

export async function deleteActivity(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('activities').delete().eq('id', id);
  if (error) throw error;
}
