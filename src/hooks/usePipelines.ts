/**
 * Pipelines management hook
 * Handles multiple sales pipelines with localStorage and optional Supabase sync
 */

import { useState, useEffect, useCallback } from 'react';
import type { Pipeline, Lead } from '../lib/types';
import { generateId } from '../lib/utils';
import { getItem, setItem, STORAGE_KEYS } from '../lib/storage';
import { isSupabaseConfigured } from '../lib/supabase';
import { supabase } from '../lib/supabaseClient';
import { DEFAULT_STAGES } from './usePipelineStages';

/**
 * Create a default pipeline
 */
function createDefaultPipeline(): Pipeline {
  return {
    id: 'default',
    name: 'Pipeline Principal',
    stages: DEFAULT_STAGES,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Hook to manage pipelines and their leads
 */
export function usePipelines() {
  const isSupabase = isSupabaseConfigured();

  // Pipelines state
  const [pipelines, setPipelines] = useState<Pipeline[]>(() => {
    const stored = getItem<Pipeline[]>(STORAGE_KEYS.PIPELINES, []);
    return stored.length > 0 ? stored : [createDefaultPipeline()];
  });

  // Current pipeline ID state
  const [currentPipelineId, setCurrentPipelineId] = useState<string>(() => {
    const stored = getItem<string>(STORAGE_KEYS.CURRENT_PIPELINE, '');
    return stored || pipelines[0]?.id || 'default';
  });

  // Leads state (organized by pipeline)
  const [leadsByPipeline, setLeadsByPipeline] = useState<Record<string, Lead[]>>(() => {
    return getItem<Record<string, Lead[]>>(STORAGE_KEYS.LEADS, {});
  });

  // Current pipeline
  const currentPipeline = pipelines.find(p => p.id === currentPipelineId) || pipelines[0];

  // Persist pipelines to localStorage
  useEffect(() => {
    setItem(STORAGE_KEYS.PIPELINES, pipelines);
  }, [pipelines]);

  // Persist current pipeline ID to localStorage
  useEffect(() => {
    setItem(STORAGE_KEYS.CURRENT_PIPELINE, currentPipelineId);
  }, [currentPipelineId]);

  // Persist leads to localStorage
  useEffect(() => {
    setItem(STORAGE_KEYS.LEADS, leadsByPipeline);
  }, [leadsByPipeline]);

  // Sync with Supabase if configured
  useEffect(() => {
    if (!isSupabase || !supabase) return;

    // Load pipelines from Supabase
    const loadPipelines = async () => {
      try {
        const { data, error } = await supabase
          .from('pipelines')
          .select('*')
          .order('created_at', { ascending: true });

        if (error) throw error;

        if (data && data.length > 0) {
          const supabasePipelines: Pipeline[] = data.map(p => ({
            id: p.id,
            name: p.name,
            stages: p.stages || DEFAULT_STAGES,
            createdAt: p.created_at,
            updatedAt: p.updated_at
          }));
          setPipelines(supabasePipelines);
        }
      } catch (error) {
        console.error('Error loading pipelines from Supabase:', error);
      }
    };

    // Load leads from Supabase
    const loadLeads = async () => {
      try {
        const { data, error } = await supabase
          .from('leads')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        if (data) {
          const leadsMap: Record<string, Lead[]> = {};
          data.forEach((lead: any) => {
            const pipelineId = lead.pipeline_id || 'default';
            if (!leadsMap[pipelineId]) {
              leadsMap[pipelineId] = [];
            }
            leadsMap[pipelineId].push({
              id: lead.id,
              name: lead.name,
              contactName: lead.contact_name,
              email: lead.email,
              phone: lead.phone,
              company: lead.company,
              siret: lead.siret,
              address: lead.address,
              city: lead.city,
              zipCode: lead.zip_code,
              country: lead.country,
              stage: lead.stage,
              value: lead.value,
              probability: lead.probability,
              closedDate: lead.closed_date,
              notes: lead.notes,
              nextActions: lead.next_actions || [],
              createdAt: lead.created_at,
              updatedAt: lead.updated_at,
              pipelineId: lead.pipeline_id
            });
          });
          setLeadsByPipeline(leadsMap);
        }
      } catch (error) {
        console.error('Error loading leads from Supabase:', error);
      }
    };

    loadPipelines();
    loadLeads();

    // Subscribe to real-time changes
    const pipelinesSubscription = supabase
      .channel('pipelines_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pipelines' }, () => {
        loadPipelines();
      })
      .subscribe();

    const leadsSubscription = supabase
      .channel('leads_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        loadLeads();
      })
      .subscribe();

    return () => {
      if (supabase) {
        supabase.removeChannel(pipelinesSubscription);
        supabase.removeChannel(leadsSubscription);
      }
    };
  }, [isSupabase]);

  /**
   * Add a new pipeline
   */
  const addPipeline = useCallback(async (name: string) => {
    const newPipeline: Pipeline = {
      id: generateId(),
      name,
      stages: DEFAULT_STAGES,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setPipelines(prev => [...prev, newPipeline]);

    // Sync with Supabase
    if (isSupabase && supabase) {
      try {
        await supabase.from('pipelines').insert({
          id: newPipeline.id,
          name: newPipeline.name,
          stages: newPipeline.stages,
          created_at: newPipeline.createdAt,
          updated_at: newPipeline.updatedAt
        });
      } catch (error) {
        console.error('Error adding pipeline to Supabase:', error);
      }
    }

    return newPipeline;
  }, [isSupabase]);

  /**
   * Rename a pipeline
   */
  const renamePipeline = useCallback(async (pipelineId: string, newName: string) => {
    setPipelines(prev =>
      prev.map(p =>
        p.id === pipelineId
          ? { ...p, name: newName, updatedAt: new Date().toISOString() }
          : p
      )
    );

    // Sync with Supabase
    if (isSupabase && supabase) {
      try {
        await supabase
          .from('pipelines')
          .update({ name: newName, updated_at: new Date().toISOString() })
          .eq('id', pipelineId);
      } catch (error) {
        console.error('Error renaming pipeline in Supabase:', error);
      }
    }
  }, [isSupabase]);

  /**
   * Delete a pipeline
   */
  const deletePipeline = useCallback(async (pipelineId: string) => {
    // Don't delete if it's the last pipeline
    if (pipelines.length === 1) {
      console.warn('Cannot delete the last pipeline');
      return false;
    }

    setPipelines(prev => prev.filter(p => p.id !== pipelineId));

    // Delete leads associated with this pipeline
    setLeadsByPipeline(prev => {
      const { [pipelineId]: _, ...rest } = prev;
      return rest;
    });

    // Switch to first remaining pipeline if current was deleted
    if (currentPipelineId === pipelineId) {
      const remaining = pipelines.filter(p => p.id !== pipelineId);
      setCurrentPipelineId(remaining[0]?.id || 'default');
    }

    // Sync with Supabase
    if (isSupabase && supabase) {
      try {
        await supabase.from('pipelines').delete().eq('id', pipelineId);
        await supabase.from('leads').delete().eq('pipeline_id', pipelineId);
      } catch (error) {
        console.error('Error deleting pipeline from Supabase:', error);
      }
    }

    return true;
  }, [pipelines, currentPipelineId, isSupabase]);

  /**
   * Get leads for a specific pipeline
   */
  const getPipelineLeads = useCallback((pipelineId: string): Lead[] => {
    return leadsByPipeline[pipelineId] || [];
  }, [leadsByPipeline]);

  /**
   * Update leads for a specific pipeline
   */
  const updatePipelineLeads = useCallback(
    async (pipelineId: string, leads: Lead[], skipPersist = false) => {
      setLeadsByPipeline(prev => ({
        ...prev,
        [pipelineId]: leads
      }));

      // Sync with Supabase (unless skipped for batch operations)
      if (!skipPersist && isSupabase && supabase) {
        try {
          // Delete all existing leads for this pipeline
          await supabase.from('leads').delete().eq('pipeline_id', pipelineId);

          // Insert updated leads
          if (leads.length > 0) {
            const supabaseLeads = leads.map(lead => ({
              id: lead.id,
              name: lead.name,
              contact_name: lead.contactName,
              email: lead.email,
              phone: lead.phone,
              company: lead.company,
              siret: lead.siret,
              address: lead.address,
              city: lead.city,
              zip_code: lead.zipCode,
              country: lead.country,
              stage: lead.stage,
              value: lead.value,
              probability: lead.probability,
              closed_date: lead.closedDate,
              notes: lead.notes,
              next_actions: lead.nextActions || [],
              created_at: lead.createdAt,
              updated_at: lead.updatedAt,
              pipeline_id: pipelineId
            }));

            await supabase.from('leads').insert(supabaseLeads);
          }
        } catch (error) {
          console.error('Error updating leads in Supabase:', error);
        }
      }
    },
    [isSupabase]
  );

  return {
    pipelines,
    currentPipelineId,
    currentPipeline,
    setCurrentPipelineId,
    addPipeline,
    renamePipeline,
    deletePipeline,
    getPipelineLeads,
    updatePipelineLeads
  };
}
