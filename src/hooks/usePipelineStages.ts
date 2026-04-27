/**
 * Pipeline stages configuration hook.
 *
 * Source de vérité : pipelines.stages en DB (sync realtime via usePipelines).
 * On lit depuis le Pipeline passé en argument et on écrit via pipelinesService.
 * Plus aucune persistance localStorage — sinon Max et Nicolas voient des
 * colonnes différentes : c'était le bug "RDV Terrain pas visible côté client".
 */

import type { StageConfig, LeadStage, Pipeline } from '../lib/types';
import * as pipelinesService from '../services/pipelinesService';

/**
 * Default pipeline stages configuration
 */
export const DEFAULT_STAGES: StageConfig[] = [
  {
    id: 'new',
    label: 'Nouveau',
    icon: 'Target',
    color: 'blue'
  },
  {
    id: 'contacted',
    label: 'Contacté',
    icon: 'Phone',
    color: 'yellow'
  },
  {
    id: 'qualified',
    label: 'Qualifié',
    icon: 'CheckCircle',
    color: 'purple'
  },
  {
    id: 'meeting',
    label: 'RDV Planifié',
    icon: 'Calendar',
    color: 'indigo'
  },
  {
    id: 'proposal',
    label: 'Proposition',
    icon: 'FileText',
    color: 'pink'
  },
  {
    id: 'negotiation',
    label: 'Négociation',
    icon: 'MessageSquare',
    color: 'orange'
  },
  {
    id: 'won',
    label: 'Gagné',
    icon: 'Trophy',
    color: 'green'
  },
  {
    id: 'lost',
    label: 'Perdu',
    icon: 'XCircle',
    color: 'red'
  }
];

/**
 * Alternative stage names that might be used
 */
export const STAGE_ALIASES: Record<string, LeadStage> = {
  'contact': 'contacted',
  'closed_won': 'won',
  'closed_lost': 'lost'
};

/**
 * Normalize stage name to standard format
 */
export function normalizeStage(stage: string): LeadStage {
  return (STAGE_ALIASES[stage] as LeadStage) || (stage as LeadStage);
}

/**
 * Get stage configuration by ID
 */
export function getStageConfig(stageId: LeadStage, stages: StageConfig[] = DEFAULT_STAGES): StageConfig | undefined {
  return stages.find(s => s.id === stageId);
}

/**
 * Get stage color by ID
 */
export function getStageColor(stageId: LeadStage, stages: StageConfig[] = DEFAULT_STAGES): string {
  const stage = getStageConfig(stageId, stages);
  return stage?.color || 'gray';
}

/**
 * Get stage label by ID
 */
export function getStageLabel(stageId: LeadStage, stages: StageConfig[] = DEFAULT_STAGES): string {
  const stage = getStageConfig(stageId, stages);
  return stage?.label || stageId;
}

/**
 * Hook to manage pipeline stages.
 *
 * Lit `pipeline.stages` (chargé par usePipelines depuis Supabase, propagé via
 * realtime channel `pipelines_changes`). Toute modification est persistée via
 * pipelinesService.updatePipelineStages → DB → realtime → tous les clients.
 *
 * Si aucun pipeline n'est passé (boot, no-auth), retourne DEFAULT_STAGES en
 * read-only.
 */
export function usePipelineStages(pipeline?: Pipeline) {
  const stages: StageConfig[] =
    pipeline?.stages && pipeline.stages.length > 0 ? pipeline.stages : DEFAULT_STAGES;

  const persist = async (next: StageConfig[]) => {
    if (!pipeline) {
      console.warn('usePipelineStages: no pipeline provided, change ignored');
      return;
    }
    try {
      await pipelinesService.updatePipelineStages(pipeline.id, next);
    } catch (error) {
      console.error('Error updating pipeline stages:', error);
    }
  };

  const addStage = (stage: StageConfig) => persist([...stages, stage]);

  const updateStage = (stageId: LeadStage, updates: Partial<StageConfig>) =>
    persist(stages.map((s) => (s.id === stageId ? { ...s, ...updates } : s)));

  const removeStage = (stageId: LeadStage) =>
    persist(stages.filter((s) => s.id !== stageId));

  const reorderStages = (startIndex: number, endIndex: number) => {
    const result = Array.from(stages);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);
    return persist(result);
  };

  const resetToDefault = () => persist(DEFAULT_STAGES);

  return {
    stages,
    addStage,
    updateStage,
    removeStage,
    reorderStages,
    resetToDefault,
    getStageConfig: (stageId: LeadStage) => getStageConfig(stageId, stages),
    getStageColor: (stageId: LeadStage) => getStageColor(stageId, stages),
    getStageLabel: (stageId: LeadStage) => getStageLabel(stageId, stages)
  };
}
