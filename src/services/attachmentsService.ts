/**
 * Attachments service : upload / list / delete / generate signed URLs for the
 * lead-attachments bucket. The metadata lives in the `attachments` table; the
 * file bytes live in Supabase Storage. Both are RLS-protected identically.
 */

import { getSupabaseClient } from '../lib/supabaseClient';

const BUCKET = 'lead-attachments';
const SIGNED_URL_TTL = 3600; // 1h — refreshed on each download

export interface Attachment {
  id: string;
  leadId: string;
  ownerId: string;
  filename: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
}

interface DbRow {
  id: string;
  lead_id: string;
  owner_id: string;
  filename: string;
  storage_path: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

function rowToAttachment(r: DbRow): Attachment {
  return {
    id: r.id,
    leadId: r.lead_id,
    ownerId: r.owner_id,
    filename: r.filename,
    storagePath: r.storage_path,
    mimeType: r.mime_type,
    sizeBytes: r.size_bytes,
    createdAt: r.created_at,
  };
}

function makeStoragePath(leadId: string, filename: string): string {
  // `<lead_id>/<timestamp>-<random>-<safeFilename>` — unique and traceable.
  const safe = filename.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80);
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${leadId}/${unique}-${safe}`;
}

export async function listAttachmentsForLead(leadId: string): Promise<Attachment[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('attachments')
    .select('*')
    .eq('lead_id', leadId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => rowToAttachment(r as DbRow));
}

export async function uploadAttachment(
  leadId: string,
  ownerId: string,
  file: File
): Promise<Attachment> {
  const supabase = getSupabaseClient();
  const path = makeStoragePath(leadId, file.name);

  const { error: uploadErr } = await supabase.storage.from(BUCKET).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
  });
  if (uploadErr) throw uploadErr;

  const { data, error } = await supabase
    .from('attachments')
    .insert({
      lead_id: leadId,
      owner_id: ownerId,
      filename: file.name,
      storage_path: path,
      mime_type: file.type || 'application/octet-stream',
      size_bytes: file.size,
    })
    .select()
    .single();
  if (error) {
    // Best effort rollback so we don't leak orphan bytes in storage.
    await supabase.storage.from(BUCKET).remove([path]).catch(() => undefined);
    throw error;
  }
  return rowToAttachment(data as DbRow);
}

export async function deleteAttachment(attachment: Attachment): Promise<void> {
  const supabase = getSupabaseClient();
  // Delete storage first; if it fails we keep the DB row (visible → user can retry).
  const { error: storageErr } = await supabase.storage
    .from(BUCKET)
    .remove([attachment.storagePath]);
  if (storageErr && storageErr.message && !storageErr.message.toLowerCase().includes('not found')) {
    throw storageErr;
  }
  const { error } = await supabase.from('attachments').delete().eq('id', attachment.id);
  if (error) throw error;
}

export async function getAttachmentSignedUrl(attachment: Attachment): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(attachment.storagePath, SIGNED_URL_TTL, {
      download: attachment.filename,
    });
  if (error || !data?.signedUrl) throw error ?? new Error('No signed URL returned');
  return data.signedUrl;
}

/**
 * Like getAttachmentSignedUrl but without the download disposition — used for
 * inline preview (iframe for PDF, <img> for images).
 */
export async function getAttachmentPreviewUrl(attachment: Attachment): Promise<string> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(attachment.storagePath, SIGNED_URL_TTL);
  if (error || !data?.signedUrl) throw error ?? new Error('No signed URL returned');
  return data.signedUrl;
}
