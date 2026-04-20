/**
 * Tag service: per-owner tags and per-lead assignments.
 */

import { getSupabaseClient } from '../lib/supabaseClient';

export interface Tag {
  id: string;
  name: string;
  color: string;
  ownerId: string | null;
  createdAt: string;
}

interface DbTagRow {
  id: string;
  name: string;
  color: string;
  owner_id: string | null;
  created_at: string;
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
  return (data ?? [])
    .map((row: any) => row.tags as DbTagRow)
    .filter(Boolean)
    .map(rowToTag);
}

export async function listLeadTagsMap(): Promise<Map<string, Tag[]>> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from('lead_tags').select('lead_id, tags(*)');
  if (error) throw error;
  const map = new Map<string, Tag[]>();
  for (const row of data ?? []) {
    const tag = (row as any).tags as DbTagRow | null;
    if (!tag) continue;
    const arr = map.get((row as any).lead_id) ?? [];
    arr.push(rowToTag(tag));
    map.set((row as any).lead_id, arr);
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
