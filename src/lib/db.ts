/**
 * Database helpers for Electron SQLite
 * Falls back to localStorage for web version
 */

import { Pipeline, Lead } from './types';

interface ElectronAPI {
  db: {
    query: (sql: string, params?: any[]) => Promise<{ success: boolean; data?: any; error?: string }>;
    get: (sql: string, params?: any[]) => Promise<{ success: boolean; data?: any; error?: string }>;
    run: (sql: string, params?: any[]) => Promise<{ success: boolean; data?: any; error?: string }>;
  };
  isElectron: boolean;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

const isElectron = () => {
  return typeof window !== 'undefined' && window.electronAPI?.isElectron === true;
};

// ===== PIPELINES =====

export async function getAllPipelines(): Promise<Pipeline[]> {
  if (isElectron()) {
    try {
      const result = await window.electronAPI!.db.query('SELECT * FROM pipelines ORDER BY createdAt DESC');
      if (result.success && result.data) {
        // Load leads for each pipeline
        const pipelines = await Promise.all(
          result.data.map(async (p: any) => {
            const leadsResult = await window.electronAPI!.db.query(
              'SELECT * FROM leads WHERE pipelineId = ? ORDER BY created_at DESC',
              [p.id]
            );
            return {
              id: p.id,
              name: p.name,
              createdAt: p.createdAt,
              leads: leadsResult.success ? (leadsResult.data || []) : [],
            };
          })
        );
        return pipelines;
      }
      return [];
    } catch (error) {
      console.error('Error loading pipelines from SQLite:', error);
      return [];
    }
  } else {
    // Fallback to localStorage
    const stored = localStorage.getItem('crm_pipelines');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }
}

export async function savePipeline(pipeline: Pipeline): Promise<void> {
  if (isElectron()) {
    try {
      // Check if exists
      const existing = await window.electronAPI!.db.get(
        'SELECT id FROM pipelines WHERE id = ?',
        [pipeline.id]
      );

      if (existing.success && existing.data) {
        // Update
        await window.electronAPI!.db.run(
          'UPDATE pipelines SET name = ? WHERE id = ?',
          [pipeline.name, pipeline.id]
        );
      } else {
        // Insert
        await window.electronAPI!.db.run(
          'INSERT INTO pipelines (id, name, createdAt) VALUES (?, ?, ?)',
          [pipeline.id, pipeline.name, pipeline.createdAt]
        );
      }
    } catch (error) {
      console.error('Error saving pipeline to SQLite:', error);
      throw error;
    }
  } else {
    // Update in localStorage
    const pipelines = await getAllPipelines();
    const updated = pipelines.map(p => p.id === pipeline.id ? pipeline : p);
    const found = updated.find(p => p.id === pipeline.id);
    if (!found) {
      updated.push(pipeline);
    }
    localStorage.setItem('crm_pipelines', JSON.stringify(updated));
  }
}

export async function deletePipeline(id: string): Promise<void> {
  if (isElectron()) {
    try {
      // Foreign key CASCADE will delete associated leads
      await window.electronAPI!.db.run('DELETE FROM pipelines WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting pipeline from SQLite:', error);
      throw error;
    }
  } else {
    const pipelines = await getAllPipelines();
    const updated = pipelines.filter(p => p.id !== id);
    localStorage.setItem('crm_pipelines', JSON.stringify(updated));
  }
}

// ===== LEADS =====

export async function saveLead(lead: Lead): Promise<void> {
  if (isElectron()) {
    try {
      // Check if exists
      const existing = await window.electronAPI!.db.get(
        'SELECT id FROM leads WHERE id = ?',
        [lead.id]
      );

      if (existing.success && existing.data) {
        // Update
        await window.electronAPI!.db.run(
          `UPDATE leads SET
            name = ?, contactName = ?, jobTitle = ?, email = ?, phone = ?, mobile = ?,
            company = ?, siret = ?, address = ?, city = ?, postalCode = ?, country = ?,
            source = ?, website = ?, linkedin = ?, offerUrl = ?, stage = ?, value = ?, notes = ?,
            nextAction = ?, nextActionDate = ?, nextActionTime = ?, updated_at = ?
          WHERE id = ?`,
          [
            lead.name, lead.contactName, lead.jobTitle, lead.email, lead.phone, lead.mobile,
            lead.company, lead.siret, lead.address, lead.city, lead.postalCode, lead.country,
            lead.source, lead.website, lead.linkedin, lead.offerUrl, lead.stage, lead.value, lead.notes,
            lead.nextAction, lead.nextActionDate, lead.nextActionTime, new Date().toISOString(),
            lead.id
          ]
        );
      } else {
        // Insert
        await window.electronAPI!.db.run(
          `INSERT INTO leads (
            id, pipelineId, name, contactName, jobTitle, email, phone, mobile,
            company, siret, address, city, postalCode, country, source, website,
            linkedin, offerUrl, stage, value, notes, nextAction, nextActionDate, nextActionTime,
            created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            lead.id, lead.pipelineId, lead.name, lead.contactName, lead.jobTitle,
            lead.email, lead.phone, lead.mobile, lead.company, lead.siret,
            lead.address, lead.city, lead.postalCode, lead.country, lead.source,
            lead.website, lead.linkedin, lead.offerUrl, lead.stage, lead.value, lead.notes,
            lead.nextAction, lead.nextActionDate, lead.nextActionTime,
            lead.created_at, new Date().toISOString()
          ]
        );
      }
    } catch (error) {
      console.error('Error saving lead to SQLite:', error);
      throw error;
    }
  } else {
    // Update in localStorage (in pipeline)
    const pipelines = await getAllPipelines();
    const updated = pipelines.map(p => {
      if (p.id === lead.pipelineId) {
        // S'assurer que leads est un tableau
        const currentLeads = p.leads || [];
        const leadExists = currentLeads.find(l => l.id === lead.id);
        if (leadExists) {
          return { ...p, leads: currentLeads.map(l => l.id === lead.id ? lead : l) };
        } else {
          return { ...p, leads: [...currentLeads, lead] };
        }
      }
      return p;
    });
    localStorage.setItem('crm_pipelines', JSON.stringify(updated));
  }
}

export async function deleteLead(id: string): Promise<void> {
  console.log('[DB] deleteLead appelé pour id:', id, 'isElectron:', isElectron());
  if (isElectron()) {
    try {
      const result = await window.electronAPI!.db.run('DELETE FROM leads WHERE id = ?', [id]);
      console.log('[DB] Résultat suppression SQLite:', result);
    } catch (error) {
      console.error('[DB] Error deleting lead from SQLite:', error);
      throw error;
    }
  } else {
    console.log('[DB] Mode localStorage - suppression du lead');
    const pipelines = await getAllPipelines();
    const updated = pipelines.map(p => ({
      ...p,
      leads: p.leads.filter(l => l.id !== id)
    }));
    localStorage.setItem('crm_pipelines', JSON.stringify(updated));
  }
}

export async function deleteMultipleLeads(ids: string[]): Promise<void> {
  console.log('[DB] deleteMultipleLeads appelé pour ids:', ids, 'isElectron:', isElectron());
  if (isElectron()) {
    try {
      const placeholders = ids.map(() => '?').join(',');
      const result = await window.electronAPI!.db.run(`DELETE FROM leads WHERE id IN (${placeholders})`, ids);
      console.log('[DB] Résultat suppression multiple SQLite:', result);
    } catch (error) {
      console.error('[DB] Error deleting multiple leads from SQLite:', error);
      throw error;
    }
  } else {
    console.log('[DB] Mode localStorage - suppression multiple');
    const pipelines = await getAllPipelines();
    const updated = pipelines.map(p => ({
      ...p,
      leads: p.leads.filter(l => !ids.includes(l.id))
    }));
    localStorage.setItem('crm_pipelines', JSON.stringify(updated));
  }
}

// ===== PAGINATION & PERFORMANCE =====

/**
 * Get paginated leads for a specific pipeline
 * @param pipelineId - Pipeline ID
 * @param offset - Number of items to skip
 * @param limit - Number of items to return (default: 100)
 * @returns Object with leads array and total count
 */
export async function getLeadsPaginated(
  pipelineId: string,
  offset: number = 0,
  limit: number = 100
): Promise<{ leads: Lead[]; total: number }> {
  if (isElectron()) {
    try {
      // Get paginated leads
      const leadsResult = await window.electronAPI!.db.query(
        'SELECT * FROM leads WHERE pipelineId = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [pipelineId, limit, offset]
      );

      // Get total count
      const countResult = await window.electronAPI!.db.get(
        'SELECT COUNT(*) as count FROM leads WHERE pipelineId = ?',
        [pipelineId]
      );

      return {
        leads: leadsResult.success ? (leadsResult.data || []) : [],
        total: countResult.success && countResult.data ? countResult.data.count : 0,
      };
    } catch (error) {
      console.error('Error loading paginated leads from SQLite:', error);
      return { leads: [], total: 0 };
    }
  } else {
    // Fallback to localStorage
    const pipelines = await getAllPipelines();
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (!pipeline) return { leads: [], total: 0 };

    const total = pipeline.leads.length;
    const leads = pipeline.leads.slice(offset, offset + limit);
    return { leads, total };
  }
}

/**
 * Get total count of leads in a pipeline
 * @param pipelineId - Pipeline ID (optional, if not provided returns total for all pipelines)
 * @returns Total number of leads
 */
export async function getLeadsCount(pipelineId?: string): Promise<number> {
  if (isElectron()) {
    try {
      const sql = pipelineId
        ? 'SELECT COUNT(*) as count FROM leads WHERE pipelineId = ?'
        : 'SELECT COUNT(*) as count FROM leads';
      const params = pipelineId ? [pipelineId] : [];

      const result = await window.electronAPI!.db.get(sql, params);
      return result.success && result.data ? result.data.count : 0;
    } catch (error) {
      console.error('Error getting leads count from SQLite:', error);
      return 0;
    }
  } else {
    const pipelines = await getAllPipelines();
    if (pipelineId) {
      const pipeline = pipelines.find(p => p.id === pipelineId);
      return pipeline ? pipeline.leads.length : 0;
    }
    return pipelines.reduce((sum, p) => sum + p.leads.length, 0);
  }
}

/**
 * Get leads by stage with pagination
 * @param pipelineId - Pipeline ID
 * @param stage - Stage ID
 * @param offset - Number of items to skip
 * @param limit - Number of items to return
 * @returns Object with leads array and total count
 */
export async function getLeadsByStage(
  pipelineId: string,
  stage: string,
  offset: number = 0,
  limit: number = 100
): Promise<{ leads: Lead[]; total: number }> {
  if (isElectron()) {
    try {
      const leadsResult = await window.electronAPI!.db.query(
        'SELECT * FROM leads WHERE pipelineId = ? AND stage = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [pipelineId, stage, limit, offset]
      );

      const countResult = await window.electronAPI!.db.get(
        'SELECT COUNT(*) as count FROM leads WHERE pipelineId = ? AND stage = ?',
        [pipelineId, stage]
      );

      return {
        leads: leadsResult.success ? (leadsResult.data || []) : [],
        total: countResult.success && countResult.data ? countResult.data.count : 0,
      };
    } catch (error) {
      console.error('Error loading leads by stage from SQLite:', error);
      return { leads: [], total: 0 };
    }
  } else {
    const pipelines = await getAllPipelines();
    const pipeline = pipelines.find(p => p.id === pipelineId);
    if (!pipeline) return { leads: [], total: 0 };

    const stageLeads = pipeline.leads.filter(l => l.stage === stage);
    const total = stageLeads.length;
    const leads = stageLeads.slice(offset, offset + limit);
    return { leads, total };
  }
}

// ===== SETTINGS =====

export async function getSetting(key: string): Promise<string | null> {
  if (isElectron()) {
    try {
      const result = await window.electronAPI!.db.get(
        'SELECT value FROM settings WHERE key = ?',
        [key]
      );
      if (result.success && result.data) {
        return result.data.value;
      }
      return null;
    } catch (error) {
      console.error('Error getting setting from SQLite:', error);
      return null;
    }
  } else {
    return localStorage.getItem(key);
  }
}

export async function setSetting(key: string, value: string): Promise<void> {
  if (isElectron()) {
    try {
      await window.electronAPI!.db.run(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [key, value]
      );
    } catch (error) {
      console.error('Error setting value in SQLite:', error);
      throw error;
    }
  } else {
    localStorage.setItem(key, value);
  }
}
