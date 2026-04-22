/**
 * Unit tests for leadsService — focuses on row mapping and bulk insert chunking.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Lead } from '../lib/types';

const insertMock = vi.fn();
const selectAfterInsertMock = vi.fn();

vi.mock('../lib/supabaseClient', () => ({
  getSupabaseClient: () => ({
    from: () => ({
      insert: (rows: unknown) => {
        insertMock(rows);
        return { select: selectAfterInsertMock };
      },
    }),
  }),
}));

vi.mock('../lib/sentry', () => ({
  captureException: vi.fn(),
  captureFeatureException: vi.fn(),
}));

import { bulkInsertLeads } from './leadsService';

function makeLead(i: number): Lead {
  const now = new Date().toISOString();
  return {
    id: `lead-${i}`,
    name: `Lead ${i}`,
    contactName: 'John',
    email: 'a@b.c',
    phone: '0102030405',
    company: 'Acme',
    siret: '12345678901234',
    address: '1 rue X',
    city: 'Paris',
    zipCode: '75001',
    country: 'France',
    stage: 'new',
    value: 1000,
    probability: 50,
    nextActions: [],
    createdAt: now,
    updatedAt: now,
    pipelineId: 'pipe-1',
  };
}

describe('bulkInsertLeads', () => {
  beforeEach(() => {
    insertMock.mockReset();
    selectAfterInsertMock.mockReset();
  });

  it('chunks > 500 leads into multiple batches and reports progress', async () => {
    const leads = Array.from({ length: 1200 }, (_, i) => makeLead(i));

    selectAfterInsertMock.mockImplementation(() => {
      const lastBatch = insertMock.mock.calls[insertMock.mock.calls.length - 1][0] as any[];
      return Promise.resolve({ data: lastBatch, error: null });
    });

    const progress: Array<{ processed: number; total: number }> = [];
    const result = await bulkInsertLeads(leads, 'user-uuid', (p) => progress.push({ processed: p.processed, total: p.total }));

    expect(insertMock).toHaveBeenCalledTimes(3); // 500 + 500 + 200
    expect(result.inserted).toHaveLength(1200);
    expect(result.errors).toHaveLength(0);
    expect(progress[progress.length - 1]).toEqual({ processed: 1200, total: 1200 });
  });

  it('records errors per row when a batch fails after retries', async () => {
    const leads = Array.from({ length: 3 }, (_, i) => makeLead(i));

    selectAfterInsertMock.mockResolvedValue({ data: null, error: { message: 'rls violation' } });

    const result = await bulkInsertLeads(leads, 'user-uuid');

    expect(result.inserted).toHaveLength(0);
    expect(result.errors).toHaveLength(3);
    expect(result.errors[0].message).toContain('rls violation');
  });

  it('injects owner_id into each row', async () => {
    const leads = [makeLead(1)];
    selectAfterInsertMock.mockImplementation(() => {
      const lastBatch = insertMock.mock.calls[insertMock.mock.calls.length - 1][0] as any[];
      return Promise.resolve({ data: lastBatch, error: null });
    });

    await bulkInsertLeads(leads, 'user-42');

    const inserted = insertMock.mock.calls[0][0] as any[];
    expect(inserted[0].owner_id).toBe('user-42');
    expect(inserted[0].zip_code).toBe('75001'); // camelCase → snake_case mapping
    expect(inserted[0].contact_name).toBe('John');
  });
});
