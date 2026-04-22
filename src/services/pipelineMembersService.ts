/**
 * Pipeline membership service: list/invite/remove collaborators.
 * Uses an RPC (resolve_user_by_email) to translate email → user_id.
 */

import { getSupabaseClient } from '../lib/supabaseClient';
import type { Database } from '../types/database';

export type PipelineRole = 'owner' | 'admin' | 'member' | 'viewer';

type PipelineMemberRow = Database['public']['Tables']['pipeline_members']['Row'];

export interface PipelineMember {
  pipelineId: string;
  userId: string;
  email: string | null;
  role: PipelineRole;
  createdAt: string;
}

export async function listMembers(pipelineId: string): Promise<PipelineMember[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('pipeline_members')
    .select('pipeline_id, user_id, role, created_at')
    .eq('pipeline_id', pipelineId);
  if (error) throw error;

  const rows = (data ?? []) as PipelineMemberRow[];
  const userIds = rows.map(r => r.user_id);
  const emails = await fetchEmails(userIds);

  return rows.map(r => ({
    pipelineId: r.pipeline_id,
    userId: r.user_id,
    role: r.role as PipelineRole,
    createdAt: r.created_at,
    email: emails.get(r.user_id) ?? null,
  }));
}

async function fetchEmails(userIds: string[]): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (userIds.length === 0) return map;
  const supabase = getSupabaseClient();
  const { data } = await supabase.rpc('resolve_user_emails', { p_user_ids: userIds });
  if (Array.isArray(data)) {
    for (const row of data) map.set(row.id as string, row.email as string);
  }
  return map;
}

export async function resolveEmailToUserId(email: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.rpc('resolve_user_by_email', { p_email: email });
  if (error) throw error;
  return (data as string) ?? null;
}

export async function inviteMember(
  pipelineId: string,
  email: string,
  role: PipelineRole = 'member'
): Promise<{ ok: true; userId: string } | { ok: false; reason: 'user_not_found' | 'already_member' }> {
  const userId = await resolveEmailToUserId(email);
  if (!userId) return { ok: false, reason: 'user_not_found' };

  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('pipeline_members')
    .insert({ pipeline_id: pipelineId, user_id: userId, role });
  if (error) {
    if (error.code === '23505') return { ok: false, reason: 'already_member' };
    throw error;
  }
  return { ok: true, userId };
}

export async function updateMemberRole(
  pipelineId: string,
  userId: string,
  role: PipelineRole
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('pipeline_members')
    .update({ role })
    .eq('pipeline_id', pipelineId)
    .eq('user_id', userId);
  if (error) throw error;
}

export async function removeMember(pipelineId: string, userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('pipeline_members')
    .delete()
    .eq('pipeline_id', pipelineId)
    .eq('user_id', userId);
  if (error) throw error;
}
