import { Lead } from '../lib/types';
import { deleteLead as dbDeleteLead, deleteMultipleLeads as dbDeleteMultipleLeads } from '../lib/db';

export function createLeadsManager(
  leads: Lead[],
  updateCallback: (newLeads: Lead[], skipPersist?: boolean) => void,
  pipelineId: string
) {
  const addLead = async (leadData: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'pipelineId'>) => {
    try {
      const newLead: Lead = {
        ...leadData,
        pipelineId, // Add pipelineId from parameter
        name: leadData.name || '',
        value: leadData.value || 0,
        stage: leadData.stage || 'new',
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedLeads = [newLead, ...leads];
      updateCallback(updatedLeads);
      return { success: true, data: newLead };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const addLeads = async (leadsData: Omit<Lead, 'id' | 'created_at' | 'updated_at' | 'pipelineId'>[]) => {
    try {
      console.log('[useLeads] addLeads appelé avec', leadsData.length, 'leads');
      console.log('[useLeads] pipelineId:', pipelineId);
      console.log('[useLeads] leads existants:', leads.length);

      const newLeads = leadsData.map(leadData => ({
        ...leadData,
        pipelineId, // Add pipelineId from parameter
        name: leadData.name || 'Sans nom',
        value: leadData.value || 0,
        stage: leadData.stage || 'new',
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      console.log('[useLeads] Nouveaux leads créés:', newLeads.length);
      const updatedLeads = [...newLeads, ...leads];
      console.log('[useLeads] Total leads après ajout:', updatedLeads.length);

      updateCallback(updatedLeads);
      console.log('[useLeads] updateCallback appelé');

      return { success: true, data: newLeads };
    } catch (err) {
      console.error('[useLeads] Erreur dans addLeads:', err);
      return { success: false, error: err };
    }
  };

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    try {
      const updatedLeads = leads.map(lead =>
        lead.id === id ? { ...lead, ...updates, updated_at: new Date().toISOString() } : lead
      );
      updateCallback(updatedLeads);
      return { success: true };
    } catch (err) {
      return { success: false, error: err };
    }
  };

  const deleteLead = async (id: string) => {
    try {
      // Supprimer de la base de données d'abord
      await dbDeleteLead(id);
      // Puis mettre à jour l'état local (skipPersist=true car on a déjà supprimé en BDD)
      const updatedLeads = leads.filter(lead => lead.id !== id);
      updateCallback(updatedLeads, true);
      return { success: true };
    } catch (err) {
      console.error('Erreur lors de la suppression du lead:', err);
      return { success: false, error: err };
    }
  };

  const deleteMultipleLeads = async (ids: string[]) => {
    try {
      // Supprimer de la base de données d'abord
      await dbDeleteMultipleLeads(ids);
      // Puis mettre à jour l'état local (skipPersist=true car on a déjà supprimé en BDD)
      const updatedLeads = leads.filter(lead => !ids.includes(lead.id));
      updateCallback(updatedLeads, true);
      return { success: true };
    } catch (err) {
      console.error('Erreur lors de la suppression des leads:', err);
      return { success: false, error: err };
    }
  };

  const deleteAllLeads = async () => {
    try {
      // Supprimer tous les leads du pipeline actuel de la base de données
      const allIds = leads.map(lead => lead.id);
      if (allIds.length > 0) {
        await dbDeleteMultipleLeads(allIds);
      }
      // Puis mettre à jour l'état local (skipPersist=true car on a déjà supprimé en BDD)
      updateCallback([], true);
      return { success: true };
    } catch (err) {
      console.error('Erreur lors de la suppression de tous les leads:', err);
      return { success: false, error: err };
    }
  };

  return {
    addLead,
    addLeads,
    updateLead,
    deleteLead,
    deleteMultipleLeads,
    deleteAllLeads,
  };
}
