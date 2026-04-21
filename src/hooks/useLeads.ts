/**
 * Lead state hook. Delegates Supabase I/O to leadsService.
 * Owner ID is injected from AuthContext.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Lead } from '../lib/types';
import { isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import * as leadsService from '../services/leadsService';
import type { BatchProgress, BulkInsertResult } from '../services/leadsService';

export function useLeads() {
  const isSupabase = isSupabaseConfigured();
  const { user } = useAuth();
  const [leadsByPipeline, setLeadsByPipeline] = useState<Record<string, Lead[]>>({});

  const loadLeads = useCallback(async () => {
    if (!isSupabase || !user) return;
    try {
      const data = await leadsService.listLeads();
      const map: Record<string, Lead[]> = {};
      for (const lead of data) {
        const pid = lead.pipelineId || 'default';
        (map[pid] ||= []).push(lead);
      }
      setLeadsByPipeline(map);
    } catch (error) {
      console.error('Error loading leads:', error);
    }
  }, [isSupabase, user]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const getPipelineLeads = useCallback(
    (pipelineId: string): Lead[] => leadsByPipeline[pipelineId] || [],
    [leadsByPipeline]
  );

  const addLead = useCallback(
    async (pipelineId: string, lead: Lead) => {
      if (!user) throw new Error('Not authenticated');
      const localLead = { ...lead, pipelineId };

      // optimistic
      setLeadsByPipeline((prev) => ({
        ...prev,
        [pipelineId]: [...(prev[pipelineId] || []), localLead],
      }));

      if (!isSupabase) return;
      try {
        const created = await leadsService.createLead(localLead, user.id);
        // replace with authoritative row
        setLeadsByPipeline((prev) => ({
          ...prev,
          [pipelineId]: (prev[pipelineId] || []).map((l) => (l.id === created.id ? created : l)),
        }));
      } catch (error) {
        // rollback
        setLeadsByPipeline((prev) => ({
          ...prev,
          [pipelineId]: (prev[pipelineId] || []).filter((l) => l.id !== localLead.id),
        }));
        throw error;
      }
    },
    [isSupabase, user]
  );

  const updateLead = useCallback(
    async (pipelineId: string, leadId: string, updates: Partial<Lead>) => {
      const previous = leadsByPipeline[pipelineId]?.find((l) => l.id === leadId);
      // optimistic
      setLeadsByPipeline((prev) => ({
        ...prev,
        [pipelineId]: (prev[pipelineId] || []).map((l) =>
          l.id === leadId ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
        ),
      }));

      if (!isSupabase) return;
      try {
        const fresh = await leadsService.updateLead(leadId, updates);
        setLeadsByPipeline((prev) => ({
          ...prev,
          [pipelineId]: (prev[pipelineId] || []).map((l) => (l.id === leadId ? fresh : l)),
        }));
      } catch (error) {
        // rollback to previous
        if (previous) {
          setLeadsByPipeline((prev) => ({
            ...prev,
            [pipelineId]: (prev[pipelineId] || []).map((l) => (l.id === leadId ? previous : l)),
          }));
        }
        throw error;
      }
    },
    [isSupabase, leadsByPipeline]
  );

  const deleteLead = useCallback(
    async (pipelineId: string, leadId: string) => {
      const previous = leadsByPipeline[pipelineId]?.find((l) => l.id === leadId);
      setLeadsByPipeline((prev) => ({
        ...prev,
        [pipelineId]: (prev[pipelineId] || []).filter((l) => l.id !== leadId),
      }));

      if (!isSupabase) return;
      try {
        await leadsService.deleteLead(leadId);
      } catch (error) {
        if (previous) {
          setLeadsByPipeline((prev) => ({
            ...prev,
            [pipelineId]: [...(prev[pipelineId] || []), previous],
          }));
        }
        throw error;
      }
    },
    [isSupabase, leadsByPipeline]
  );

  const addBatchLeads = useCallback(
    async (
      pipelineId: string,
      leads: Lead[],
      onProgress?: (p: BatchProgress) => void
    ): Promise<BulkInsertResult> => {
      if (!user) throw new Error('Not authenticated');
      if (!pipelineId) throw new Error('pipelineId cannot be empty');

      // ensure all leads target the right pipeline
      const scoped = leads.map((l) => ({ ...l, pipelineId }));

      if (!isSupabase) {
        setLeadsByPipeline((prev) => ({
          ...prev,
          [pipelineId]: [...(prev[pipelineId] || []), ...scoped],
        }));
        return { inserted: scoped, errors: [] };
      }

      const result = await leadsService.bulkInsertLeads(scoped, user.id, onProgress);
      // commit only what Supabase confirmed
      if (result.inserted.length > 0) {
        setLeadsByPipeline((prev) => ({
          ...prev,
          [pipelineId]: [...(prev[pipelineId] || []), ...result.inserted],
        }));
      }
      return result;
    },
    [isSupabase, user]
  );

  const bulkDelete = useCallback(
    async (pipelineId: string, ids: string[]) => {
      if (ids.length === 0) return;
      const idSet = new Set(ids);
      const previous = leadsByPipeline[pipelineId] || [];
      // optimistic remove
      setLeadsByPipeline((prev) => ({
        ...prev,
        [pipelineId]: (prev[pipelineId] || []).filter((l) => !idSet.has(l.id)),
      }));
      if (!isSupabase) return;
      try {
        await leadsService.bulkDeleteLeads(ids);
      } catch (error) {
        // rollback full list
        setLeadsByPipeline((prev) => ({ ...prev, [pipelineId]: previous }));
        throw error;
      }
    },
    [isSupabase, leadsByPipeline]
  );

  const bulkUpdate = useCallback(
    async (pipelineId: string, ids: string[], updates: Partial<Lead>) => {
      if (ids.length === 0) return;
      const idSet = new Set(ids);
      const previous = leadsByPipeline[pipelineId] || [];
      const now = new Date().toISOString();
      // optimistic
      setLeadsByPipeline((prev) => ({
        ...prev,
        [pipelineId]: (prev[pipelineId] || []).map((l) =>
          idSet.has(l.id) ? { ...l, ...updates, updatedAt: now } : l
        ),
      }));
      if (!isSupabase) return;
      try {
        const fresh = await leadsService.bulkUpdateLeads(ids, updates);
        const freshById = new Map(fresh.map((l) => [l.id, l]));
        setLeadsByPipeline((prev) => ({
          ...prev,
          [pipelineId]: (prev[pipelineId] || []).map((l) => freshById.get(l.id) ?? l),
        }));
      } catch (error) {
        setLeadsByPipeline((prev) => ({ ...prev, [pipelineId]: previous }));
        throw error;
      }
    },
    [isSupabase, leadsByPipeline]
  );

  const deletePipelineLeads = useCallback(
    async (pipelineId: string) => {
      setLeadsByPipeline((prev) => {
        const { [pipelineId]: _, ...rest } = prev;
        return rest;
      });
      if (isSupabase) {
        try {
          await leadsService.deletePipelineLeads(pipelineId);
        } catch (error) {
          console.error('Error deleting pipeline leads:', error);
        }
      }
    },
    [isSupabase]
  );

  return {
    leadsByPipeline,
    getPipelineLeads,
    addLead,
    updateLead,
    deleteLead,
    addBatchLeads,
    bulkDelete,
    bulkUpdate,
    deletePipelineLeads,
    reloadLeads: loadLeads,
  };
}
