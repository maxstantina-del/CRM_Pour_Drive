import { useState, useEffect } from 'react';
import { Pipeline, Lead } from '../lib/types';
import { getAllPipelines, savePipeline, deletePipeline as dbDeletePipeline, saveLead } from '../lib/db';
import { getSetting, setSetting } from '../lib/db';

const STORAGE_KEY_CURRENT = 'crm_current_pipeline';

export function usePipelines() {
  const [pipelines, setPipelines] = useState<Pipeline[]>([]);
  const [currentPipelineId, setCurrentPipelineId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Load pipelines from database
  useEffect(() => {
    async function loadData() {
      try {
        const loadedPipelines = await getAllPipelines();
        const storedCurrent = await getSetting(STORAGE_KEY_CURRENT);

        if (loadedPipelines.length > 0) {
          setPipelines(loadedPipelines);

          if (storedCurrent && loadedPipelines.find(p => p.id === storedCurrent)) {
            setCurrentPipelineId(storedCurrent);
          } else {
            setCurrentPipelineId(loadedPipelines[0].id);
          }
        } else {
          // Create default pipeline
          const defaultPipeline: Pipeline = {
            id: crypto.randomUUID(),
            name: 'Pipeline Principal',
            createdAt: new Date().toISOString(),
            leads: [],
          };
          await savePipeline(defaultPipeline);
          await setSetting(STORAGE_KEY_CURRENT, defaultPipeline.id);
          setPipelines([defaultPipeline]);
          setCurrentPipelineId(defaultPipeline.id);
        }
      } catch (error) {
        console.error('Error loading pipelines:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentPipeline = pipelines.find(p => p.id === currentPipelineId);

  const switchPipeline = async (id: string) => {
    setCurrentPipelineId(id);
    await setSetting(STORAGE_KEY_CURRENT, id);
  };

  const createPipeline = async (name: string, initialLeads: Lead[] = [], pipelineId?: string) => {
    const newPipeline: Pipeline = {
      id: pipelineId || crypto.randomUUID(), // Use provided ID or generate new one
      name,
      createdAt: new Date().toISOString(),
      leads: initialLeads,
    };

    await savePipeline(newPipeline);

    // Save initial leads if any
    for (const lead of initialLeads) {
      await saveLead(lead);
    }

    const updated = [...pipelines, newPipeline];
    setPipelines(updated);
    setCurrentPipelineId(newPipeline.id);
    await setSetting(STORAGE_KEY_CURRENT, newPipeline.id);

    return newPipeline;
  };

  const renamePipeline = async (id: string, newName: string) => {
    const pipeline = pipelines.find(p => p.id === id);
    if (pipeline) {
      const updatedPipeline = { ...pipeline, name: newName };
      await savePipeline(updatedPipeline);

      const updated = pipelines.map(p =>
        p.id === id ? updatedPipeline : p
      );
      setPipelines(updated);
    }
  };

  const deletePipeline = async (id: string) => {
    await dbDeletePipeline(id);
    const updated = pipelines.filter(p => p.id !== id);
    setPipelines(updated);

    // If no pipelines left, clear current ID
    if (updated.length === 0) {
      setCurrentPipelineId('');
      await setSetting(STORAGE_KEY_CURRENT, '');
    } else {
      // Switch to first pipeline if deleting current
      const newCurrentId = id === currentPipelineId ? updated[0].id : currentPipelineId;
      setCurrentPipelineId(newCurrentId);
      await setSetting(STORAGE_KEY_CURRENT, newCurrentId);
    }
  };

  const updatePipelineLeads = async (pipelineId: string, leads: Lead[], skipPersist: boolean = false) => {
    console.log('[usePipelines] updatePipelineLeads - pipelineId:', pipelineId, 'leads:', leads.length, 'skipPersist:', skipPersist);

    // Save all leads to database (sauf si skipPersist est true, ex: après suppression)
    if (!skipPersist) {
      console.log('[usePipelines] Sauvegarde de', leads.length, 'leads...');
      for (const lead of leads) {
        await saveLead(lead);
      }
      console.log('[usePipelines] Sauvegarde terminée');
    } else {
      console.log('[usePipelines] skipPersist=true, pas de sauvegarde');
    }

    const updated = pipelines.map(p =>
      p.id === pipelineId ? { ...p, leads } : p
    );
    setPipelines(updated);
    console.log('[usePipelines] State mis à jour');
  };

  return {
    pipelines,
    currentPipeline,
    currentPipelineId,
    loading,
    switchPipeline,
    createPipeline,
    renamePipeline,
    deletePipeline,
    updatePipelineLeads,
  };
}
