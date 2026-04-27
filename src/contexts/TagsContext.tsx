/**
 * Global tags state — single source of truth shared across all views.
 * Fixes the bug where useTags() copies diverged (deleting a tag only cleared
 * it from the instance that called deleteTag, not from LeadForm pickers etc).
 */

import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as service from '../services/tagsService';
import type { Tag } from '../services/tagsService';
import { useAuth } from './AuthContext';
import { isSupabaseConfigured } from '../lib/supabase';
import { getSupabaseClient } from '../lib/supabaseClient';

interface TagsContextValue {
  tags: Tag[];
  leadTags: Map<string, Tag[]>;
  loading: boolean;
  reload: () => Promise<void>;
  createTag: (name: string, color?: string) => Promise<Tag>;
  deleteTag: (id: string) => Promise<void>;
  toggleLeadTag: (leadId: string, tag: Tag) => Promise<void>;
  getTagsForLead: (leadId: string) => Tag[];
}

const TagsContext = createContext<TagsContextValue | null>(null);

export function TagsProvider({ children }: { children: React.ReactNode }) {
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
    if (!isSupabaseConfigured() || !user) return;
    const client = getSupabaseClient();
    const channel = client
      .channel('tags_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tags' }, () => load())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lead_tags' }, () => load())
      .subscribe();
    return () => {
      client.removeChannel(channel);
    };
  }, [load, user]);

  const createTag = useCallback(
    async (name: string, color?: string) => {
      if (!user) throw new Error('Not authenticated');
      const tag = await service.createTag(user.id, name, color);
      setTags((prev) => [...prev, tag].sort((a, b) => a.name.localeCompare(b.name)));
      return tag;
    },
    [user]
  );

  const deleteTag = useCallback(async (id: string) => {
    await service.deleteTag(id);
    setTags((prev) => prev.filter((t) => t.id !== id));
    setLeadTags((prev) => {
      const next = new Map(prev);
      for (const [leadId, list] of next) next.set(leadId, list.filter((t) => t.id !== id));
      return next;
    });
  }, []);

  const toggleLeadTag = useCallback(
    async (leadId: string, tag: Tag) => {
      const current = leadTags.get(leadId) ?? [];
      const has = current.some((t) => t.id === tag.id);
      if (has) {
        await service.unassignTag(leadId, tag.id);
        setLeadTags((prev) => {
          const next = new Map(prev);
          next.set(leadId, (next.get(leadId) ?? []).filter((t) => t.id !== tag.id));
          return next;
        });
      } else {
        await service.assignTag(leadId, tag.id);
        setLeadTags((prev) => {
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

  return (
    <TagsContext.Provider
      value={{ tags, leadTags, loading, reload: load, createTag, deleteTag, toggleLeadTag, getTagsForLead }}
    >
      {children}
    </TagsContext.Provider>
  );
}

export function useTagsContext(): TagsContextValue {
  const ctx = useContext(TagsContext);
  if (!ctx) throw new Error('useTagsContext must be used within TagsProvider');
  return ctx;
}
