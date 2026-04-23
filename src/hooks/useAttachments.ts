/**
 * Per-lead attachments state with realtime sync so a devis uploaded by a
 * pipeline member pops up instantly on the owner's screen.
 */

import { useCallback, useEffect, useState } from 'react';
import {
  listAttachmentsForLead,
  uploadAttachment,
  deleteAttachment as deleteAttachmentService,
  type Attachment,
} from '../services/attachmentsService';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { getSupabaseClient } from '../lib/supabaseClient';

export function useAttachments(leadId: string | null) {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!leadId || !isSupabaseConfigured()) return;
    setLoading(true);
    try {
      setAttachments(await listAttachmentsForLead(leadId));
    } catch (err) {
      console.error('Load attachments error', err);
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    if (leadId) load();
    else setAttachments([]);
  }, [leadId, load]);

  // Realtime : INSERT/DELETE on attachments for this lead → re-sync list.
  useEffect(() => {
    if (!leadId || !isSupabaseConfigured()) return;
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel(`attachments-${leadId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'attachments', filter: `lead_id=eq.${leadId}` },
        () => {
          void load();
        }
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [leadId, load]);

  const upload = useCallback(
    async (file: File) => {
      if (!leadId || !user) return;
      const created = await uploadAttachment(leadId, user.id, file);
      setAttachments((prev) => [created, ...prev]);
      return created;
    },
    [leadId, user]
  );

  const remove = useCallback(async (attachment: Attachment) => {
    const snapshot = attachments;
    setAttachments((prev) => prev.filter((a) => a.id !== attachment.id));
    try {
      await deleteAttachmentService(attachment);
    } catch (err) {
      setAttachments(snapshot);
      throw err;
    }
  }, [attachments]);

  return { attachments, loading, reload: load, upload, remove };
}
