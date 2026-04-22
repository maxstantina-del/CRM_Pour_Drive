/**
 * Tag service: per-owner tags and per-lead assignments.
 */

import { getSupabaseClient } from '../lib/supabaseClient';
import type { Database } from '../types/database';

export interface Tag {
  id: string;
  name: string;
  color: string;
  ownerId: string | null;
  createdAt: string;
}

type DbTagRow = Database['public']['Tables']['tags']['Row'];

interface LeadTagWithTag {
  lead_id: string;
  tag_id?: string;
  tags: DbTagRow | null;
}

function rowToTag(r: DbTagRow): Tag {
  return {
    id: r.id,
    name: r.name,
    color: r.color,
    ownerId: r.owner_id,
    createdAt: r.created_at,
  };
}

export async function listTags(): Promise<Tag[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('tags').select('*').order('name');
  if (error) throw error;
  return (data ?? []).map(r => rowToTag(r as DbTagRow));
}

export async function createTag(ownerId: string, name: string, color = '#6366f1'): Promise<Tag> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('tags')
    .insert({ owner_id: ownerId, name, color })
    .select()
    .single();
  if (error) throw error;
  return rowToTag(data as DbTagRow);
}

export async function deleteTag(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('tags').delete().eq('id', id);
  if (error) throw error;
}

export async function listTagsForLead(leadId: string): Promise<Tag[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('lead_tags')
    .select('tag_id, tags(*)')
    .eq('lead_id', leadId);
  if (error) throw error;
  return (data as unknown as LeadTagWithTag[] ?? [])
    .map(row => row.tags)
    .filter((t): t is DbTagRow => t !== null)
    .map(rowToTag);
}

export async function listLeadTagsMap(): Promise<Map<string, Tag[]>> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('lead_tags').select('lead_id, tags(*)');
  if (error) throw error;
  const map = new Map<string, Tag[]>();
  for (const row of (data as unknown as LeadTagWithTag[]) ?? []) {
    if (!row.tags) continue;
    const arr = map.get(row.lead_id) ?? [];
    arr.push(rowToTag(row.tags));
    map.set(row.lead_id, arr);
  }
  return map;
}

export async function assignTag(leadId: string, tagId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('lead_tags').insert({ lead_id: leadId, tag_id: tagId });
  if (error && error.code !== '23505') throw error; // 23505 = unique violation (already assigned)
}

export async function unassignTag(leadId: string, tagId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('lead_tags')
    .delete()
    .eq('lead_id', leadId)
    .eq('tag_id', tagId);
  if (error) throw error;
}
