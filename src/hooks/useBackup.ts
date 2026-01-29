/**
 * Backup and restore hook
 * Allows exporting and importing all CRM data
 */

import { useCallback } from 'react';
import type { BackupData, Pipeline, Lead } from '../lib/types';
import { downloadFile, readFileAsText } from '../lib/utils';
import { exportAllData, importAllData } from '../lib/storage';

const BACKUP_VERSION = '1.0.0';

/**
 * Hook to manage backup and restore operations
 */
export function useBackup(
  pipelines: Pipeline[],
  leadsByPipeline: Record<string, Lead[]>,
  onRestore?: (pipelines: Pipeline[], leadsByPipeline: Record<string, Lead[]>) => void
) {
  /**
   * Create a backup of all data
   */
  const createBackup = useCallback((): BackupData => {
    // Flatten leads from all pipelines
    const allLeads: Lead[] = [];
    Object.values(leadsByPipeline).forEach(pipelineLeads => {
      allLeads.push(...pipelineLeads);
    });

    const backup: BackupData = {
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      pipelines,
      leads: allLeads,
      settings: exportAllData()
    };

    return backup;
  }, [pipelines, leadsByPipeline]);

  /**
   * Export backup as JSON file
   */
  const exportBackup = useCallback(() => {
    const backup = createBackup();
    const json = JSON.stringify(backup, null, 2);
    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `crm_backup_${timestamp}.json`;

    downloadFile(json, filename, 'application/json');

    return { success: true, filename };
  }, [createBackup]);

  /**
   * Import backup from JSON file
   */
  const importBackup = useCallback(
    async (file: File): Promise<{ success: boolean; error?: string }> => {
      try {
        const content = await readFileAsText(file);
        const backup: BackupData = JSON.parse(content);

        // Validate backup structure
        if (!backup.version || !backup.pipelines || !backup.leads) {
          return {
            success: false,
            error: 'Fichier de sauvegarde invalide'
          };
        }

        // Version compatibility check
        if (backup.version !== BACKUP_VERSION) {
          console.warn(`Backup version mismatch: ${backup.version} vs ${BACKUP_VERSION}`);
          // Could add migration logic here if needed
        }

        // Restore pipelines
        const restoredPipelines = backup.pipelines;

        // Organize leads by pipeline
        const restoredLeadsByPipeline: Record<string, Lead[]> = {};
        backup.leads.forEach(lead => {
          const pipelineId = lead.pipelineId || 'default';
          if (!restoredLeadsByPipeline[pipelineId]) {
            restoredLeadsByPipeline[pipelineId] = [];
          }
          restoredLeadsByPipeline[pipelineId].push(lead);
        });

        // Import settings if available
        if (backup.settings) {
          importAllData(backup.settings);
        }

        // Call the restore callback
        if (onRestore) {
          onRestore(restoredPipelines, restoredLeadsByPipeline);
        }

        return { success: true };
      } catch (error) {
        console.error('Error importing backup:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Erreur lors de l\'import'
        };
      }
    },
    [onRestore]
  );

  /**
   * Get backup statistics
   */
  const getBackupStats = useCallback(() => {
    const backup = createBackup();
    return {
      pipelines: backup.pipelines.length,
      leads: backup.leads.length,
      size: new Blob([JSON.stringify(backup)]).size,
      exportedAt: backup.exportedAt
    };
  }, [createBackup]);

  return {
    createBackup,
    exportBackup,
    importBackup,
    getBackupStats
  };
}
