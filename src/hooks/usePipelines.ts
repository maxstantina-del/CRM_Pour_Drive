/**
 * Pipelines management hook
 *
 * ✅ ARCHITECTURE PROPRE:
 * - Source de vérité: SUPABASE UNIQUEMENT
 * - localStorage: Seulement pour currentPipelineId (préférence UI)
 * - Pas de double sync localStorage/Supabase
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

  // Pipelines state - loaded from Supabase
  const [pipelines, setPipelines] = useState<Pipeline[]>([createDefaultPipeline()]);

  // Current pipeline ID state - saved to localStorage (UI preference only)
  const [currentPipelineId, setCurrentPipelineId] = useState<string>(() => {
    const stored = getItem<string>(STORAGE_KEYS.CURRENT_PIPELINE, '');
    return stored || 'default';
  });

  // Leads state - loaded from Supabase ONLY (no localStorage)
  const [leadsByPipeline, setLeadsByPipeline] = useState<Record<string, Lead[]>>({});

  // Current pipeline
  const currentPipeline = pipelines.find(p => p.id === currentPipelineId) || pipelines[0];

  // Persist current pipeline ID to localStorage (UI preference only)
  useEffect(() => {
    setItem(STORAGE_KEYS.CURRENT_PIPELINE, currentPipelineId);
  }, [currentPipelineId]);

  // Sync with Supabase if configured
  useEffect(() => {
    if (!isSupabase || !supabase) return;

    const supabaseClient = supabase;

    // Load pipelines from Supabase
    const loadPipelines = async () => {
      try {
        const { data, error } = await supabaseClient
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
        const { data, error } = await supabaseClient
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

    // Subscribe to real-time changes with optimized updates
    const pipelinesSubscription = supabaseClient
      .channel('pipelines_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pipelines' }, () => {
        // For pipelines, reload is acceptable since they change rarely
        loadPipelines();
      })
      .subscribe();

    const leadsSubscription = supabaseClient
      .channel('leads_changes')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'leads'
      }, (payload: any) => {
        // Add new lead to local state
        const newLead: Lead = {
          id: payload.new.id,
          name: payload.new.name,
          contactName: payload.new.contact_name,
          email: payload.new.email,
          phone: payload.new.phone,
          company: payload.new.company,
          siret: payload.new.siret,
          address: payload.new.address,
          city: payload.new.city,
          zipCode: payload.new.zip_code,
          country: payload.new.country,
          stage: payload.new.stage,
          value: payload.new.value,
          probability: payload.new.probability,
          closedDate: payload.new.closed_date,
          notes: payload.new.notes,
          nextActions: payload.new.next_actions || [],
          createdAt: payload.new.created_at,
          updatedAt: payload.new.updated_at,
          pipelineId: payload.new.pipeline_id
        };

        setLeadsByPipeline(prev => ({
          ...prev,
          [newLead.pipelineId || 'default']: [
            ...(prev[newLead.pipelineId || 'default'] || []),
            newLead
          ]
        }));
      })
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'leads'
      }, (payload: any) => {
        // Update specific lead in local state
        const updatedLead: Lead = {
          id: payload.new.id,
          name: payload.new.name,
          contactName: payload.new.contact_name,
          email: payload.new.email,
          phone: payload.new.phone,
          company: payload.new.company,
          siret: payload.new.siret,
          address: payload.new.address,
          city: payload.new.city,
          zipCode: payload.new.zip_code,
          country: payload.new.country,
          stage: payload.new.stage,
          value: payload.new.value,
          probability: payload.new.probability,
          closedDate: payload.new.closed_date,
          notes: payload.new.notes,
          nextActions: payload.new.next_actions || [],
          createdAt: payload.new.created_at,
          updatedAt: payload.new.updated_at,
          pipelineId: payload.new.pipeline_id
        };

        setLeadsByPipeline(prev => {
          const pipelineId = updatedLead.pipelineId || 'default';
          return {
            ...prev,
            [pipelineId]: (prev[pipelineId] || []).map(lead =>
              lead.id === updatedLead.id ? updatedLead : lead
            )
          };
        });
      })
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'leads'
      }, (payload: any) => {
        // Remove lead from local state
        const deletedId = payload.old.id;
        const pipelineId = payload.old.pipeline_id || 'default';

        setLeadsByPipeline(prev => ({
          ...prev,
          [pipelineId]: (prev[pipelineId] || []).filter(lead => lead.id !== deletedId)
        }));
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(pipelinesSubscription);
      supabaseClient.removeChannel(leadsSubscription);
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
    // If it's the last pipeline, create a new default one automatically
    if (pipelines.length === 1) {
      const newDefaultPipeline: Pipeline = {
        id: generateId(),
        name: 'Nouveau Pipeline',
        stages: DEFAULT_STAGES,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setPipelines([newDefaultPipeline]);
      setCurrentPipelineId(newDefaultPipeline.id);

      // Delete old pipeline leads
      setLeadsByPipeline({});

      // Sync with Supabase
      if (isSupabase && supabase) {
        try {
          // Delete old pipeline and its leads
          await supabase.from('pipelines').delete().eq('id', pipelineId);
          await supabase.from('leads').delete().eq('pipeline_id', pipelineId);

          // Create new default pipeline
          await supabase.from('pipelines').insert({
            id: newDefaultPipeline.id,
            name: newDefaultPipeline.name,
            stages: newDefaultPipeline.stages,
            created_at: newDefaultPipeline.createdAt,
            updated_at: newDefaultPipeline.updatedAt
          });
        } catch (error) {
          console.error('Error deleting last pipeline from Supabase:', error);
        }
      }

      return true;
    }

    // Normal deletion when there are multiple pipelines
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
   * Add a single lead (optimized for Supabase)
   */
  const addSingleLead = useCallback(
    async (pipelineId: string, lead: Lead) => {
      setLeadsByPipeline(prev => ({
        ...prev,
        [pipelineId]: [...(prev[pipelineId] || []), lead]
      }));

      if (isSupabase && supabase) {
        try {
          await supabase.from('leads').insert({
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
          });
        } catch (error) {
          console.error('Error adding lead to Supabase:', error);
        }
      }
    },
    [isSupabase]
  );

  /**
   * Update a single lead (optimized for Supabase - no delete+insert!)
   */
  const updateSingleLead = useCallback(
    async (pipelineId: string, leadId: string, updates: Partial<Lead>) => {
      // Update local state
      setLeadsByPipeline(prev => ({
        ...prev,
        [pipelineId]: (prev[pipelineId] || []).map(lead =>
          lead.id === leadId
            ? { ...lead, ...updates, updatedAt: new Date().toISOString() }
            : lead
        )
      }));

      // Update Supabase (single UPDATE query)
      if (isSupabase && supabase) {
        try {
          const supabaseUpdates: Record<string, any> = {
            updated_at: new Date().toISOString()
          };

          // Map camelCase to snake_case
          if (updates.name !== undefined) supabaseUpdates.name = updates.name;
          if (updates.contactName !== undefined) supabaseUpdates.contact_name = updates.contactName;
          if (updates.email !== undefined) supabaseUpdates.email = updates.email;
          if (updates.phone !== undefined) supabaseUpdates.phone = updates.phone;
          if (updates.company !== undefined) supabaseUpdates.company = updates.company;
          if (updates.siret !== undefined) supabaseUpdates.siret = updates.siret;
          if (updates.address !== undefined) supabaseUpdates.address = updates.address;
          if (updates.city !== undefined) supabaseUpdates.city = updates.city;
          if (updates.zipCode !== undefined) supabaseUpdates.zip_code = updates.zipCode;
          if (updates.country !== undefined) supabaseUpdates.country = updates.country;
          if (updates.stage !== undefined) supabaseUpdates.stage = updates.stage;
          if (updates.value !== undefined) supabaseUpdates.value = updates.value;
          if (updates.probability !== undefined) supabaseUpdates.probability = updates.probability;
          if (updates.closedDate !== undefined) supabaseUpdates.closed_date = updates.closedDate;
          if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;
          if (updates.nextActions !== undefined) supabaseUpdates.next_actions = updates.nextActions;

          await supabase
            .from('leads')
            .update(supabaseUpdates)
            .eq('id', leadId);
        } catch (error) {
          console.error('Error updating lead in Supabase:', error);
          throw error;
        }
      }
    },
    [isSupabase]
  );

  /**
   * Delete a single lead (optimized for Supabase)
   */
  const deleteSingleLead = useCallback(
    async (pipelineId: string, leadId: string) => {
      setLeadsByPipeline(prev => ({
        ...prev,
        [pipelineId]: (prev[pipelineId] || []).filter(lead => lead.id !== leadId)
      }));

      if (isSupabase && supabase) {
        try {
          await supabase.from('leads').delete().eq('id', leadId);
        } catch (error) {
          console.error('Error deleting lead from Supabase:', error);
        }
      }
    },
    [isSupabase]
  );

  /**
   * Add multiple leads at once (optimized for imports)
   */
  const addBatchLeads = useCallback(
    async (pipelineId: string, newLeads: Lead[]) => {
      console.log('🔵 addBatchLeads: Starting import of', newLeads.length, 'leads');
      console.log('🔵 Supabase configured:', isSupabase);

      // Sync with Supabase in batches FIRST
      if (isSupabase && supabase) {
        try {
          const batchSize = 1000; // Supabase can handle up to 1000 rows per insert

          for (let i = 0; i < newLeads.length; i += batchSize) {
            const batch = newLeads.slice(i, i + batchSize);
            const supabaseLeads = batch.map(lead => ({
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

            console.log(`🟢 Inserting batch ${i / batchSize + 1}/${Math.ceil(newLeads.length / batchSize)} (${batch.length} leads)`);

            const { data, error } = await supabase.from('leads').insert(supabaseLeads);

            if (error) {
              console.error('🔴 Supabase insert error:', error);
              throw new Error(`Supabase error: ${error.message}`);
            }

            console.log(`✅ Batch ${i / batchSize + 1} inserted successfully`);
          }

          console.log('✅ All leads inserted into Supabase');

          // Reload from Supabase to ensure consistency
          console.log('🔄 Reloading leads from Supabase...');
          const { data: allLeads, error: loadError } = await supabase
            .from('leads')
            .select('*')
            .eq('pipeline_id', pipelineId)
            .order('created_at', { ascending: false });

          if (loadError) {
            console.error('🔴 Error reloading leads:', loadError);
            throw loadError;
          }

          // Update local state with fresh data from Supabase
          const leadsMap: Record<string, Lead[]> = {};
          if (allLeads) {
            allLeads.forEach((lead: any) => {
              const pid = lead.pipeline_id || 'default';
              if (!leadsMap[pid]) leadsMap[pid] = [];
              leadsMap[pid].push({
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
          }

          setLeadsByPipeline(prev => ({
            ...prev,
            ...leadsMap
          }));

          console.log('✅ Local state updated with', allLeads?.length || 0, 'leads from Supabase');

        } catch (error) {
          console.error('🔴 CRITICAL Error adding batch leads to Supabase:', error);
          throw error;
        }
      } else {
        // No Supabase, just update local state
        console.log('⚠️ No Supabase configured, updating local state only');
        setLeadsByPipeline(prev => ({
          ...prev,
          [pipelineId]: [...(prev[pipelineId] || []), ...newLeads]
        }));
      }
    },
    [isSupabase]
  );

  /**
   * Update leads for a specific pipeline (batch operation for imports)
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
    updatePipelineLeads,
    // Optimized single-lead operations
    addSingleLead,
    updateSingleLead,
    deleteSingleLead,
    // Batch operations
    addBatchLeads
  };
}
