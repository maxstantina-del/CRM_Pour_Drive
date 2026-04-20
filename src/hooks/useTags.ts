import { useCallback, useEffect, useState } from 'react';
import * as service from '../services/tagsService';
import type { Tag } from '../services/tagsService';
import { useAuth } from '../contexts/AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';

export function useTags() {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [leadTags, setLeadTags] = useState<Map<string, Tag[]>>(new Map());
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured() || !user) return;
    setLoading(true);
    try {
      const [tagsList, map] = await Promise.all([service.listTags(), service.listLeadTagsMap()]);
      setTags(tagsList);
      setLeadTags(map);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    load();
  }, [load]);

  const createTag = useCallback(
    async (name: string, color?: string) => {
      if (!user) throw new Error('Not authenticated');
      const tag = await service.createTag(user.id, name, color);
      setTags(prev => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)));
      return tag;
    },
    [user]
  );

  const deleteTag = useCallback(async (id: string) => {
    await service.deleteTag(id);
    setTags(prev => prev.filter(t => t.id !== id));
    setLeadTags(prev => {
      const next = new Map(prev);
      for (const [leadId, list] of next) next.set(leadId, list.filter(t => t.id !== id));
      return next;
    });
  }, []);

  const toggleLeadTag = useCallback(
    async (leadId: string, tag: Tag) => {
      const has = (leadTags.get(leadId) ?? []).some(t => t.id === tag.id);
      if (has) {
        await service.unassignTag(leadId, tag.id);
        setLeadTags(prev => {
          const next = new Map(prev);
          next.set(leadId, (next.get(leadId) ?? []).filter(t => t.id !== tag.id));
          return next;
        });
      } else {
        await service.assignTag(leadId, tag.id);
        setLeadTags(prev => {
          const next = new Map(prev);
          next.set(leadId, [...(next.get(leadId) ?? []), tag]);
          return next;
        });
      }
    },
    [leadTags]
  );

  const getTagsForLead = useCallback(
    (leadId: string): Tag[] => leadTags.get(leadId) ?? [],
    [leadTags]
  );

  return { tags, leadTags, loading, reload: load, createTag, deleteTag, toggleLeadTag, getTagsForLead };
}
