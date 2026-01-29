/**
 * Tests for useLeads hook
 */

import { describe, it, expect, vi } from 'vitest';
import { createLeadsManager, validateLead, createEmptyLead } from './useLeads';
import type { Lead } from '../lib/types';

describe('createLeadsManager', () => {
  const mockLeads: Lead[] = [
    {
      id: '1',
      name: 'Test Lead',
      stage: 'new',
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z'
    }
  ];

  it('should create a leads manager', () => {
    const updateCallback = vi.fn();
    const manager = createLeadsManager(mockLeads, updateCallback, 'test-pipeline');

    expect(manager).toHaveProperty('addLead');
    expect(manager).toHaveProperty('updateLead');
    expect(manager).toHaveProperty('deleteLead');
    expect(manager).toHaveProperty('addNextAction');
    expect(manager).toHaveProperty('toggleNextAction');
    expect(manager).toHaveProperty('deleteNextAction');
  });

  it('should add a new lead', async () => {
    const updateCallback = vi.fn();
    const manager = createLeadsManager(mockLeads, updateCallback, 'test-pipeline');

    const newLead = await manager.addLead({
      name: 'New Lead',
      email: 'test@example.com'
    });

    expect(newLead).toBeDefined();
    expect(newLead.name).toBe('New Lead');
    expect(newLead.email).toBe('test@example.com');
    expect(updateCallback).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ name: 'New Lead' })
      ])
    );
  });

  it('should update an existing lead', async () => {
    const updateCallback = vi.fn();
    const manager = createLeadsManager(mockLeads, updateCallback, 'test-pipeline');

    await manager.updateLead('1', { name: 'Updated Lead' });

    expect(updateCallback).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: '1', name: 'Updated Lead' })
      ])
    );
  });

  it('should delete a lead', async () => {
    const updateCallback = vi.fn();
    const manager = createLeadsManager(mockLeads, updateCallback, 'test-pipeline');

    await manager.deleteLead('1');

    expect(updateCallback).toHaveBeenCalledWith([]);
  });

  it('should add next action to a lead', async () => {
    const updateCallback = vi.fn();
    const manager = createLeadsManager(mockLeads, updateCallback, 'test-pipeline');

    await manager.addNextAction('1', 'Call client', '2025-01-15');

    expect(updateCallback).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          nextActions: expect.arrayContaining([
            expect.objectContaining({
              text: 'Call client',
              completed: false
            })
          ])
        })
      ])
    );
  });
});

describe('validateLead', () => {
  it('should validate a valid lead', () => {
    const lead = {
      name: 'Test Lead',
      email: 'test@example.com',
      phone: '0612345678',
      siret: '12345678901234',
      zipCode: '75001'
    };

    const result = validateLead(lead);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should fail validation for missing name', () => {
    const lead = {
      name: '',
      email: 'test@example.com'
    };

    const result = validateLead(lead);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Le nom du projet est requis');
  });

  it('should fail validation for invalid email', () => {
    const lead = {
      name: 'Test Lead',
      email: 'invalid-email'
    };

    const result = validateLead(lead);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Email invalide');
  });

  it('should fail validation for invalid phone', () => {
    const lead = {
      name: 'Test Lead',
      phone: '123'
    };

    const result = validateLead(lead);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Numéro de téléphone invalide');
  });

  it('should fail validation for invalid SIRET', () => {
    const lead = {
      name: 'Test Lead',
      siret: '123'
    };

    const result = validateLead(lead);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Numéro SIRET invalide (14 chiffres requis)');
  });

  it('should fail validation for invalid zip code', () => {
    const lead = {
      name: 'Test Lead',
      zipCode: '123'
    };

    const result = validateLead(lead);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Code postal invalide (5 chiffres requis)');
  });

  it('should fail validation for negative value', () => {
    const lead = {
      name: 'Test Lead',
      value: -100
    };

    const result = validateLead(lead);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('La valeur ne peut pas être négative');
  });

  it('should fail validation for invalid probability', () => {
    const lead = {
      name: 'Test Lead',
      probability: 150
    };

    const result = validateLead(lead);

    expect(result.valid).toBe(false);
    expect(result.errors).toContain('La probabilité doit être entre 0 et 100');
  });
});

describe('createEmptyLead', () => {
  it('should create an empty lead with default values', () => {
    const lead = createEmptyLead();

    expect(lead).toEqual({
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
      stage: 'new',
      value: 0,
      probability: 0,
      notes: '',
      nextActions: [],
      pipelineId: undefined
    });
  });

  it('should create an empty lead with custom stage and pipeline', () => {
    const lead = createEmptyLead('contacted', 'pipeline-123');

    expect(lead.stage).toBe('contacted');
    expect(lead.pipelineId).toBe('pipeline-123');
  });
});
