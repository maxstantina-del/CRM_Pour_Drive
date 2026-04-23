/**
 * User preferences service — pour l'instant un seul usage : le preset
 * email (objet + corps + lien PJ) utilisé quand on clique sur l'email
 * d'un lead. Un row par utilisateur.
 */

import { getSupabaseClient } from '../lib/supabaseClient';

export interface UserPreferences {
  userId: string;
  emailSubject: string | null;
  emailBody: string | null;
  emailAttachmentUrl: string | null;
  updatedAt: string;
}

interface DbRow {
  user_id: string;
  email_subject: string | null;
  email_body: string | null;
  email_attachment_url: string | null;
  updated_at: string;
}

function rowToPrefs(r: DbRow): UserPreferences {
  return {
    userId: r.user_id,
    emailSubject: r.email_subject,
    emailBody: r.email_body,
    emailAttachmentUrl: r.email_attachment_url,
    updatedAt: r.updated_at,
  };
}

export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return rowToPrefs(data as DbRow);
}

export async function upsertUserPreferences(
  userId: string,
  updates: Partial<Omit<UserPreferences, 'userId' | 'updatedAt'>>
): Promise<UserPreferences> {
  const supabase = getSupabaseClient();
  const payload = {
    user_id: userId,
    email_subject: updates.emailSubject ?? null,
    email_body: updates.emailBody ?? null,
    email_attachment_url: updates.emailAttachmentUrl ?? null,
    updated_at: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert(payload, { onConflict: 'user_id' })
    .select()
    .single();
  if (error) throw error;
  return rowToPrefs(data as DbRow);
}
