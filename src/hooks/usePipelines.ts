/**
 * Pipelines management hook
 *
 * ✅ ARCHITECTURE PROPRE:
 * - Source de vérité: SUPABASE UNIQUEMENT
 * - localStorage: Seulement pour currentPipelineId (préférence UI)
 * - Pas de double sync localStorage/Supabase
 */

import { useState, useEffect, useCallback } from 'react';
import type { Pipeline } from '../lib/types';
import { generateId } from '../lib/utils';
import { getItem, setItem, STORAGE_KEYS } from '../lib/storage';
import { isSupabaseConfigured } from '../lib/supabase';
import { supabase } from '../lib/supabaseClient';
import { DEFAULT_STAGES } from './usePipelineStages';

/**
 * Hook to manage pipelines (refactored - no longer manages leads)
 * Leads management is now in useLeads.ts hook
 */
export function usePipelines() {
  const isSupabase = isSupabaseConfigured();

  // Pipelines state - loaded from Supabase
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);

  // Current pipeline ID state - saved to localStorage (UI preference only)
  const [currentPipelineId, setCurrentPipelineId] = useState<string>(() => {
    const stored = getItem<string>(STORAGE_KEYS.CURRENT_PIPELINE, '');
    return stored || '';
  });

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
          .order('created_at', { ascending: true});

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

          // Set current pipeline to first one if default doesn't exist
          if (supabasePipelines.length > 0 && !supabasePipelines.find(p => p.id === currentPipelineId)) {
            setCurrentPipelineId(supabasePipelines[0].id);
          }
        } else {
          // No pipelines - user will create their first one
          setPipelines([]);
          setCurrentPipelineId('');
        }
      } catch (error) {
        console.error('Error loading pipelines from Supabase:', error);
      }
    };

    loadPipelines();

    // Subscribe to real-time changes
    const pipelinesSubscription = supabaseClient
      .channel('pipelines_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pipelines' }, () => {
        // For pipelines, reload is acceptable since they change rarely
        loadPipelines();
      })
      .subscribe();

    return () => {
      supabaseClient.removeChannel(pipelinesSubscription);
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
    // Delete the pipeline
    setPipelines(prev => prev.filter(p => p.id !== pipelineId));

    // Switch to first remaining pipeline if current was deleted
    if (currentPipelineId === pipelineId) {
      const remaining = pipelines.filter(p => p.id !== pipelineId);
      setCurrentPipelineId(remaining[0]?.id || '');
    }

    // Sync with Supabase
    if (isSupabase && supabase) {
      try {
        await supabase.from('pipelines').delete().eq('id', pipelineId);
        // Note: Leads deletion is handled by useLeads hook through cascade or App.tsx
      } catch (error) {
        console.error('Error deleting pipeline from Supabase:', error);
      }
    }

    return true;
  }, [pipelines, currentPipelineId, isSupabase]);

  return {
    pipelines,
    currentPipelineId,
    currentPipeline,
    setCurrentPipelineId,
    addPipeline,
    renamePipeline,
    deletePipeline
  };
}
