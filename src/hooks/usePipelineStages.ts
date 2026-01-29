/**
 * Pipeline stages configuration hook
 */

import { useState, useEffect } from 'react';
import type { StageConfig, LeadStage } from '../lib/types';
import { getItem, setItem, STORAGE_KEYS } from '../lib/storage';

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
 * Hook to manage pipeline stages
 */
export function usePipelineStages(pipelineId?: string) {
  const storageKey = pipelineId
    ? `${STORAGE_KEYS.PIPELINES}_${pipelineId}_stages`
    : 'crm_default_stages';

  const [stages, setStages] = useState<StageConfig[]>(() => {
    return getItem<StageConfig[]>(storageKey, DEFAULT_STAGES);
  });

  useEffect(() => {
    setItem(storageKey, stages);
  }, [stages, storageKey]);

  const addStage = (stage: StageConfig) => {
    setStages(prev => [...prev, stage]);
  };

  const updateStage = (stageId: LeadStage, updates: Partial<StageConfig>) => {
    setStages(prev =>
      prev.map(stage =>
        stage.id === stageId ? { ...stage, ...updates } : stage
      )
    );
  };

  const removeStage = (stageId: LeadStage) => {
    setStages(prev => prev.filter(stage => stage.id !== stageId));
  };

  const reorderStages = (startIndex: number, endIndex: number) => {
    setStages(prev => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  const resetToDefault = () => {
    setStages(DEFAULT_STAGES);
  };

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
