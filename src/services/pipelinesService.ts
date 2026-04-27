/**
 * Pipeline service: Supabase wrapper for pipelines.
 */

import { getSupabaseClient } from '../lib/supabaseClient';
import type { Pipeline, StageConfig } from '../lib/types';

interface DbPipelineRow {
  id: string;
  owner_id: string | null;
  name: string;
  stages: StageConfig[];
  created_at: string;
  updated_at: string;
}

function rowToPipeline(r: DbPipelineRow): Pipeline {
  return {
    id: r.id,
    name: r.name,
    stages: r.stages ?? [],
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

export async function listPipelines(): Promise<Pipeline[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('pipelines')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map((r) => rowToPipeline(r as DbPipelineRow));
}

export async function createPipeline(pipeline: Pipeline, ownerId: string): Promise<Pipeline> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('pipelines')
    .insert({
      id: pipeline.id,
      name: pipeline.name,
      stages: pipeline.stages,
      owner_id: ownerId,
      created_at: pipeline.createdAt,
      updated_at: pipeline.updatedAt,
    })
    .select()
    .single();
  if (error) throw error;
  return rowToPipeline(data as DbPipelineRow);
}

export async function renamePipeline(pipelineId: string, name: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('pipelines')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', pipelineId);
  if (error) throw error;
}

export async function updatePipelineStages(
  pipelineId: string,
  stages: StageConfig[]
): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase
    .from('pipelines')
    .update({ stages, updated_at: new Date().toISOString() })
    .eq('id', pipelineId);
  if (error) throw error;
}

export async function deletePipeline(pipelineId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('pipelines').delete().eq('id', pipelineId);
  if (error) throw error;
}
