import { useState, useEffect } from 'react';
import { Pipeline } from '../lib/types';
import { getAllPipelines, savePipeline, saveLead } from '../lib/db';
import { getSetting, setSetting } from '../lib/db';

const STORAGE_KEY_CURRENT = 'crm_current_pipeline';
const STORAGE_KEY_LAST_BACKUP = 'crm_last_backup';

export interface BackupData {
  version: string;
  timestamp: string;
  data: {
    pipelines: Pipeline[];
    currentPipelineId: string;
  };
}

export function useBackup() {
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      const lastBackup = await getSetting(STORAGE_KEY_LAST_BACKUP);
      setLastBackupDate(lastBackup);
    }
    loadData();
  }, []);

  // Créer un backup complet
  const createBackup = async (): Promise<BackupData> => {
    const pipelines = await getAllPipelines();
    const currentPipelineId = await getSetting(STORAGE_KEY_CURRENT);

    const backupData: BackupData = {
      version: '1.0',
      timestamp: new Date().toISOString(),
      data: {
        pipelines: pipelines || [],
        currentPipelineId: currentPipelineId || '',
      },
    };

    // Sauvegarder la date du dernier backup
    await setSetting(STORAGE_KEY_LAST_BACKUP, backupData.timestamp);
    setLastBackupDate(backupData.timestamp);

    return backupData;
  };

  // Télécharger le backup en JSON
  const downloadBackup = async () => {
    try {
      const backupData = await createBackup();

      // Créer le fichier JSON
      const dataStr = JSON.stringify(backupData, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      // Créer le lien de téléchargement
      const link = document.createElement('a');
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, '-')
        .slice(0, -5);
      link.href = url;
      link.download = `crm-backup-${timestamp}.json`;
      link.click();

      // Nettoyer
      URL.revokeObjectURL(url);

      return { success: true };
    } catch (error) {
      console.error('Error creating backup:', error);
      return { success: false, error };
    }
  };

  // Restaurer à partir d'un fichier backup
  const restoreBackup = (
    file: File,
    onSuccess?: (stats: { pipelinesCount: number; leadsCount: number }) => void,
    onError?: (error: string) => void
  ) => {
    if (file.type !== 'application/json') {
      onError?.('Veuillez sélectionner un fichier JSON valide');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const content = e.target?.result as string;
        const backupData: BackupData = JSON.parse(content);

        // Valider la structure du backup
        if (
          !backupData.data ||
          !Array.isArray(backupData.data.pipelines)
        ) {
          throw new Error('Format de backup invalide');
        }

        // Restaurer les données
        for (const pipeline of backupData.data.pipelines) {
          await savePipeline(pipeline);
          // Restore leads for this pipeline
          for (const lead of pipeline.leads || []) {
            await saveLead(lead);
          }
        }

        if (backupData.data.currentPipelineId) {
          await setSetting(STORAGE_KEY_CURRENT, backupData.data.currentPipelineId);
        }

        // Calculer les statistiques
        const pipelinesCount = backupData.data.pipelines.length;
        const leadsCount = backupData.data.pipelines.reduce(
          (total, pipeline) => total + (pipeline.leads?.length || 0),
          0
        );

        onSuccess?.({ pipelinesCount, leadsCount });
      } catch (error) {
        console.error('Error restoring backup:', error);
        onError?.(
          error instanceof Error ? error.message : 'Erreur lors de la restauration'
        );
      }
    };

    reader.onerror = () => {
      onError?.('Erreur lors de la lecture du fichier');
    };

    reader.readAsText(file);
  };

  // Obtenir les statistiques de stockage
  const getStorageStats = async () => {
    const pipelines = await getAllPipelines();

    const pipelinesCount = pipelines.length;
    const leadsCount = pipelines.reduce(
      (total, pipeline) => total + (pipeline.leads?.length || 0),
      0
    );

    return {
      pipelinesCount,
      leadsCount,
      lastBackup: lastBackupDate,
    };
  };

  // Supprimer toutes les données
  const clearAllData = async () => {
    // Note: In Electron, this would require clearing the entire database
    // For now, we just clear the settings
    await setSetting(STORAGE_KEY_CURRENT, '');
    await setSetting(STORAGE_KEY_LAST_BACKUP, '');
    setLastBackupDate(null);
    // TODO: Add proper database clearing function
  };

  return {
    downloadBackup,
    restoreBackup,
    getStorageStats,
    clearAllData,
    lastBackupDate,
  };
}
