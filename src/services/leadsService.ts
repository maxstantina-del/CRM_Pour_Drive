/**
 * Lead service: single source of truth for all lead Supabase operations.
 * Handles camelCase <-> snake_case mapping, owner_id injection, batch chunking with retry.
 */

import { getSupabaseClient } from '../lib/supabaseClient';
import type { Lead, LeadStage, NextAction } from '../lib/types';
import { captureException, captureFeatureException } from '../lib/sentry';

const BATCH_SIZE = 500;
const MAX_RETRIES = 3;

interface DbLeadRow {
  id: string;
  pipeline_id: string | null;
  owner_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  contact_name: string | null;
  siret: string | null;
  address: string | null;
  city: string | null;
  zip_code: string | null;
  country: string | null;
  stage: string;
  value: number | null;
  probability: number | null;
  closed_date: string | null;
  notes: string | null;
  next_actions: NextAction[] | null;
  created_at: string;
  updated_at: string;
}

function rowToLead(r: DbLeadRow): Lead {
  return {
    id: r.id,
    name: r.name,
    contactName: r.contact_name ?? undefined,
    email: r.email ?? undefined,
    phone: r.phone ?? undefined,
    company: r.company ?? undefined,
    siret: r.siret ?? undefined,
    address: r.address ?? undefined,
    city: r.city ?? undefined,
    zipCode: r.zip_code ?? undefined,
    country: r.country ?? undefined,
    stage: r.stage as LeadStage,
    value: r.value ?? undefined,
    probability: r.probability ?? undefined,
    closedDate: r.closed_date ?? undefined,
    notes: r.notes ?? undefined,
    nextActions: r.next_actions ?? [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
    pipelineId: r.pipeline_id ?? undefined,
  };
}

function leadToRow(lead: Lead, ownerId: string | null): Omit<DbLeadRow, 'created_at' | 'updated_at'> & { created_at?: string; updated_at?: string } {
  return {
    id: lead.id,
    pipeline_id: lead.pipelineId ?? null,
    owner_id: ownerId,
    name: lead.name,
    email: lead.email ?? null,
    phone: lead.phone ?? null,
    company: lead.company ?? null,
    contact_name: lead.contactName ?? null,
    siret: lead.siret ?? null,
    address: lead.address ?? null,
    city: lead.city ?? null,
    zip_code: lead.zipCode ?? null,
    country: lead.country ?? null,
    stage: lead.stage,
    value: lead.value ?? null,
    probability: lead.probability ?? null,
    closed_date: lead.closedDate ?? null,
    notes: lead.notes ?? null,
    next_actions: lead.nextActions ?? [],
    created_at: lead.createdAt,
    updated_at: lead.updatedAt,
  };
}

function partialLeadToRow(updates: Partial<Lead>): Record<string, unknown> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (updates.name !== undefined)         row.name = updates.name;
  if (updates.email !== undefined)        row.email = updates.email;
  if (updates.phone !== undefined)        row.phone = updates.phone;
  if (updates.company !== undefined)      row.company = updates.company;
  if (updates.contactName !== undefined)  row.contact_name = updates.contactName;
  if (updates.siret !== undefined)        row.siret = updates.siret;
  if (updates.address !== undefined)      row.address = updates.address;
  if (updates.city !== undefined)         row.city = updates.city;
  if (updates.zipCode !== undefined)      row.zip_code = updates.zipCode;
  if (updates.country !== undefined)      row.country = updates.country;
  if (updates.stage !== undefined)        row.stage = updates.stage;
  if (updates.value !== undefined)        row.value = updates.value;
  if (updates.probability !== undefined)  row.probability = updates.probability;
  if (updates.closedDate !== undefined)   row.closed_date = updates.closedDate;
  if (updates.notes !== undefined)        row.notes = updates.notes;
  if (updates.nextActions !== undefined)  row.next_actions = updates.nextActions;
  if (updates.pipelineId !== undefined)   row.pipeline_id = updates.pipelineId;
  return row;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface BatchProgress {
  processed: number;
  total: number;
  errors: Array<{ index: number; message: string }>;
}

export interface BulkInsertResult {
  inserted: Lead[];
  errors: Array<{ index: number; message: string }>;
}

export async function listLeads(): Promise<Lead[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10000);
  if (error) throw error;
  return (data ?? []).map(rowToLead);
}

export async function createLead(lead: Lead, ownerId: string): Promise<Lead> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('leads')
    .insert(leadToRow(lead, ownerId))
    .select()
    .single();
  if (error) throw error;
  return rowToLead(data as DbLeadRow);
}

export async function updateLead(leadId: string, updates: Partial<Lead>): Promise<Lead> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('leads')
    .update(partialLeadToRow(updates))
    .eq('id', leadId)
    .select()
    .single();
  if (error) throw error;
  return rowToLead(data as DbLeadRow);
}

export async function deleteLead(leadId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('leads').delete().eq('id', leadId);
  if (error) throw error;
}

export async function deletePipelineLeads(pipelineId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('leads').delete().eq('pipeline_id', pipelineId);
  if (error) throw error;
}

const BULK_CHUNK = 500;

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export async function bulkDeleteLeads(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const supabase = getSupabaseClient();
  for (const batch of chunk(ids, BULK_CHUNK)) {
    const { error } = await supabase.from('leads').delete().in('id', batch);
    if (error) throw error;
  }
}

export async function bulkUpdateLeads(
  ids: string[],
  updates: Partial<Lead>
): Promise<Lead[]> {
  if (ids.length === 0) return [];
  const supabase = getSupabaseClient();
  const row = partialLeadToRow(updates);
  const rows: DbLeadRow[] = [];
  for (const batch of chunk(ids, BULK_CHUNK)) {
    const { data, error } = await supabase
      .from('leads')
      .update(row)
      .in('id', batch)
      .select();
    if (error) throw error;
    rows.push(...((data ?? []) as DbLeadRow[]));
  }
  return rows.map(rowToLead);
}

/**
 * Bulk insert with chunks, retry on transient failures, progress callback.
 * Returns rows that succeeded (authoritative) plus a per-row error list.
 */
export async function bulkInsertLeads(
  leads: Lead[],
  ownerId: string,
  onProgress?: (p: BatchProgress) => void
): Promise<BulkInsertResult> {
  const supabase = getSupabaseClient();
  const inserted: Lead[] = [];
  const errors: BulkInsertResult['errors'] = [];

  const total = leads.length;
  let processed = 0;

  for (let start = 0; start < leads.length; start += BATCH_SIZE) {
    const batch = leads.slice(start, start + BATCH_SIZE);
    const rows = batch.map((l) => leadToRow(l, ownerId));

    let attempt = 0;
    let ok = false;
    while (attempt < MAX_RETRIES && !ok) {
      attempt++;
      const { data, error } = await supabase.from('leads').insert(rows).select();
      if (!error) {
        inserted.push(...((data ?? []) as DbLeadRow[]).map(rowToLead));
        ok = true;
      } else if (attempt >= MAX_RETRIES) {
        captureFeatureException('import', error as Error, {
          batchStart: start,
          batchSize: batch.length,
          totalRows: total,
        });
        batch.forEach((_, i) =>
          errors.push({ index: start + i, message: error.message })
        );
      } else {
        await sleep(2 ** attempt * 200);
      }
    }

    processed += batch.length;
    onProgress?.({ processed, total, errors });
  }

  return { inserted, errors };
}
