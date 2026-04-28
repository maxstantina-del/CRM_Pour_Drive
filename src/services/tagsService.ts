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
  // Pagination défensive : aujourd'hui <100 tags, mais un import massif
  // pourrait dépasser le cap PostgREST 1000 sans signal.
  const supabase = getSupabaseClient();
  const PAGE = 1000;
  const out: DbTagRow[] = [];
  let from = 0;
  while (from < 50000) {
    const { data, error } = await supabase
      .from('tags')
      .select('*')
      .order('name')
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const rows = (data ?? []) as DbTagRow[];
    out.push(...rows);
    if (rows.length < PAGE) break;
    from += PAGE;
  }
  return out.map(r => rowToTag(r));
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
  // Pagination explicite : pivot many-to-many qui peut excéder 1000 lignes
  // (1700 leads × ~3 tags = ~5000). Sans range, PostgREST tronque silencieusement.
  const supabase = getSupabaseClient();
  const PAGE = 1000;
  const map = new Map<string, Tag[]>();
  let from = 0;
  while (from < 100000) {
    const { data, error } = await supabase
      .from('lead_tags')
      .select('lead_id, tags(*)')
      .range(from, from + PAGE - 1);
    if (error) throw error;
    const rows = (data as unknown as LeadTagWithTag[]) ?? [];
    for (const row of rows) {
      if (!row.tags) continue;
      const arr = map.get(row.lead_id) ?? [];
      arr.push(rowToTag(row.tags));
      map.set(row.lead_id, arr);
    }
    if (rows.length < PAGE) break;
    from += PAGE;
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
