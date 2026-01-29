/**
 * Leads management hook
 * Provides CRUD operations for leads and their next actions
 */

import type { Lead, NextAction, LeadStage } from '../lib/types';
import { generateId } from '../lib/utils';

/**
 * Callback type for updating leads
 */
type UpdateLeadsCallback = (newLeads: Lead[], skipPersist?: boolean) => void;

/**
 * Leads manager interface
 */
export interface LeadsManager {
  addLead: (leadData: Partial<Lead>) => Promise<Lead>;
  updateLead: (leadId: string, updates: Partial<Lead>) => Promise<void>;
  deleteLead: (leadId: string) => Promise<void>;
  addNextAction: (leadId: string, actionText: string, dueDate?: string) => Promise<void>;
  toggleNextAction: (leadId: string, actionId: string) => Promise<void>;
  deleteNextAction: (leadId: string, actionId: string) => Promise<void>;
}

/**
 * Create a leads manager instance
 * Factory function that returns CRUD operations for leads
 *
 * @param leads - Current leads array
 * @param updateCallback - Callback to update leads state
 * @param pipelineId - Current pipeline ID
 */
export function createLeadsManager(
  leads: Lead[],
  updateCallback: UpdateLeadsCallback,
  pipelineId: string
): LeadsManager {
  /**
   * Add a new lead
   */
  const addLead = async (leadData: Partial<Lead>): Promise<Lead> => {
    const now = new Date().toISOString();

    const newLead: Lead = {
      id: generateId(),
      name: leadData.name || 'Nouveau Lead',
      contactName: leadData.contactName,
      email: leadData.email,
      phone: leadData.phone,
      company: leadData.company,
      siret: leadData.siret,
      address: leadData.address,
      city: leadData.city,
      zipCode: leadData.zipCode,
      country: leadData.country || 'France',
      stage: leadData.stage || 'new',
      value: leadData.value,
      probability: leadData.probability,
      closedDate: leadData.closedDate,
      notes: leadData.notes,
      nextActions: leadData.nextActions || [],
      createdAt: now,
      updatedAt: now,
      pipelineId
    };

    const updatedLeads = [...leads, newLead];
    updateCallback(updatedLeads);

    return newLead;
  };

  /**
   * Update an existing lead
   */
  const updateLead = async (leadId: string, updates: Partial<Lead>): Promise<void> => {
    const updatedLeads = leads.map(lead =>
      lead.id === leadId
        ? {
            ...lead,
            ...updates,
            updatedAt: new Date().toISOString()
          }
        : lead
    );

    updateCallback(updatedLeads);
  };

  /**
   * Delete a lead
   */
  const deleteLead = async (leadId: string): Promise<void> => {
    const updatedLeads = leads.filter(lead => lead.id !== leadId);
    updateCallback(updatedLeads);
  };

  /**
   * Add a next action to a lead
   */
  const addNextAction = async (
    leadId: string,
    actionText: string,
    dueDate?: string
  ): Promise<void> => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead) {
      console.error(`Lead not found: ${leadId}`);
      return;
    }

    const newAction: NextAction = {
      id: generateId(),
      text: actionText,
      completed: false,
      dueDate,
      createdAt: new Date().toISOString()
    };

    const currentActions = lead.nextActions || [];
    const updatedLeads = leads.map(l =>
      l.id === leadId
        ? {
            ...l,
            nextActions: [...currentActions, newAction],
            updatedAt: new Date().toISOString()
          }
        : l
    );

    updateCallback(updatedLeads);
  };

  /**
   * Toggle completion status of a next action
   */
  const toggleNextAction = async (leadId: string, actionId: string): Promise<void> => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead || !lead.nextActions) {
      console.error(`Lead or actions not found: ${leadId}`);
      return;
    }

    const updatedActions = lead.nextActions.map(action =>
      action.id === actionId
        ? { ...action, completed: !action.completed }
        : action
    );

    const updatedLeads = leads.map(l =>
      l.id === leadId
        ? {
            ...l,
            nextActions: updatedActions,
            updatedAt: new Date().toISOString()
          }
        : l
    );

    updateCallback(updatedLeads);
  };

  /**
   * Delete a next action from a lead
   */
  const deleteNextAction = async (leadId: string, actionId: string): Promise<void> => {
    const lead = leads.find(l => l.id === leadId);
    if (!lead || !lead.nextActions) {
      console.error(`Lead or actions not found: ${leadId}`);
      return;
    }

    const updatedActions = lead.nextActions.filter(action => action.id !== actionId);

    const updatedLeads = leads.map(l =>
      l.id === leadId
        ? {
            ...l,
            nextActions: updatedActions,
            updatedAt: new Date().toISOString()
          }
        : l
    );

    updateCallback(updatedLeads);
  };

  return {
    addLead,
    updateLead,
    deleteLead,
    addNextAction,
    toggleNextAction,
    deleteNextAction
  };
}

/**
 * Helper function to create a new lead with default values
 */
export function createEmptyLead(stage: LeadStage = 'new', pipelineId?: string): Partial<Lead> {
  return {
    name: '',
    contactName: '',
    email: '',
    phone: '',
    company: '',
    siret: '',
    address: '',
    city: '',
    zipCode: '',
    country: 'France',
    stage,
    value: 0,
    probability: 0,
    notes: '',
    nextActions: [],
    pipelineId
  };
}

/**
 * Helper function to validate lead data
 */
export function validateLead(lead: Partial<Lead>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!lead.name || lead.name.trim() === '') {
    errors.push('Le nom du projet est requis');
  }

  if (lead.email && !isValidEmail(lead.email)) {
    errors.push('Email invalide');
  }

  if (lead.phone && !isValidPhone(lead.phone)) {
    errors.push('Numéro de téléphone invalide');
  }

  if (lead.siret && !isValidSiret(lead.siret)) {
    errors.push('Numéro SIRET invalide (14 chiffres requis)');
  }

  if (lead.zipCode && !isValidZipCode(lead.zipCode)) {
    errors.push('Code postal invalide (5 chiffres requis)');
  }

  if (lead.value !== undefined && lead.value < 0) {
    errors.push('La valeur ne peut pas être négative');
  }

  if (lead.probability !== undefined && (lead.probability < 0 || lead.probability > 100)) {
    errors.push('La probabilité doit être entre 0 et 100');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Validation helper functions
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone);
}

function isValidSiret(siret: string): boolean {
  const cleanSiret = siret.replace(/\s/g, '');
  return /^\d{14}$/.test(cleanSiret);
}

function isValidZipCode(zipCode: string): boolean {
  return /^\d{5}$/.test(zipCode);
}
