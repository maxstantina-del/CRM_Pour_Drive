/**
 * Pipelines hook. Source of truth: Supabase. Delegates I/O to pipelinesService.
 * currentPipelineId persisted to localStorage as a UI preference.
 */

import { useState, useEffect, useCallback } from 'react';
import type { Pipeline } from '../lib/types';
import { generateId } from '../lib/utils';
import { getItem, setItem, STORAGE_KEYS } from '../lib/storage';
import { isSupabaseConfigured } from '../lib/supabase';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../contexts/AuthContext';
import { DEFAULT_STAGES } from './usePipelineStages';
import * as pipelinesService from '../services/pipelinesService';

export function usePipelines() {
  const isSupabase = isSupabaseConfigured();
  const { user } = useAuth();
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [currentPipelineId, setCurrentPipelineId] = useState<string>(() =>
    getItem<string>(STORAGE_KEYS.CURRENT_PIPELINE, '') || ''
  );

  const currentPipeline = pipelines.find((p) => p.id === currentPipelineId) || pipelines[0];

  useEffect(() => {
    setItem(STORAGE_KEYS.CURRENT_PIPELINE, currentPipelineId);
  }, [currentPipelineId]);

  useEffect(() => {
    if (!isSupabase || !supabase || !user) return;
    const client = supabase;

    const loadPipelines = async () => {
      try {
        const data = await pipelinesService.listPipelines();
        setPipelines(data);
        if (data.length > 0 && !data.find((p) => p.id === currentPipelineId)) {
          setCurrentPipelineId(data[0].id);
        } else if (data.length === 0) {
          setCurrentPipelineId('');
        }
      } catch (error) {
        console.error('Error loading pipelines:', error);
      }
    };

    loadPipelines();

    const channel = client
      .channel('pipelines_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pipelines' }, () => {
        loadPipelines();
      })
      .subscribe();

    // Sync également les changements de membership : si on m'ajoute/retire d'un
    // pipeline, je dois recharger la liste pour voir/cacher le pipeline sans F5.
    const membersChannel = client
      .channel(`pipeline_members_changes_${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'pipeline_members',
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          loadPipelines();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
      client.removeChannel(membersChannel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSupabase, user]);

  const addPipeline = useCallback(
    async (name: string) => {
      if (!user) throw new Error('Not authenticated');
      const pipeline: Pipeline = {
        id: generateId(),
        name,
        stages: DEFAULT_STAGES,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setPipelines((prev) => [...prev, pipeline]);
      if (isSupabase) {
        try {
          await pipelinesService.createPipeline(pipeline, user.id);
        } catch (error) {
          setPipelines((prev) => prev.filter((p) => p.id !== pipeline.id));
          throw error;
        }
      }
      return pipeline;
    },
    [isSupabase, user]
  );

  const renamePipeline = useCallback(
    async (pipelineId: string, newName: string) => {
      setPipelines((prev) =>
        prev.map((p) =>
          p.id === pipelineId ? { ...p, name: newName, updatedAt: new Date().toISOString() } : p
        )
      );
      if (isSupabase) {
        try {
          await pipelinesService.renamePipeline(pipelineId, newName);
        } catch (error) {
          console.error('Error renaming pipeline:', error);
        }
      }
    },
    [isSupabase]
  );

  const deletePipeline = useCallback(
    async (pipelineId: string) => {
      setPipelines((prev) => prev.filter((p) => p.id !== pipelineId));
      if (currentPipelineId === pipelineId) {
        const remaining = pipelines.filter((p) => p.id !== pipelineId);
        setCurrentPipelineId(remaining[0]?.id || '');
      }
      if (isSupabase) {
        try {
          await pipelinesService.deletePipeline(pipelineId);
        } catch (error) {
          console.error('Error deleting pipeline:', error);
        }
      }
      return true;
    },
    [pipelines, currentPipelineId, isSupabase]
  );

  return {
    pipelines,
    currentPipelineId,
    currentPipeline,
    setCurrentPipelineId,
    addPipeline,
    renamePipeline,
    deletePipeline,
  };
}
