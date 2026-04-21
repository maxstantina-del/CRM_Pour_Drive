/**
 * Unit tests for bulkDeleteLeads + bulkUpdateLeads.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

const deleteInMock = vi.fn();
const updateMock = vi.fn();
const updateInSelectMock = vi.fn();

vi.mock('../lib/supabaseClient', () => ({
  getSupabaseClient: () => ({
    from: () => ({
      delete: () => ({
        in: (col: string, ids: string[]) => {
          deleteInMock(col, ids);
          return Promise.resolve({ error: null });
        },
      }),
      update: (row: unknown) => {
        updateMock(row);
        return {
          in: (col: string, ids: string[]) => ({
            select: () => {
              updateInSelectMock(col, ids);
              const rows = ids.map((id) => ({
                id,
                pipeline_id: 'p1',
                owner_id: 'u1',
                name: 'X',
                email: null,
                phone: null,
                company: null,
                contact_name: null,
                siret: null,
                address: null,
                city: null,
                zip_code: null,
                country: null,
                stage: (row as Record<string, unknown>).stage ?? 'new',
                value: null,
                probability: null,
                closed_date: null,
                notes: null,
                next_actions: [],
                created_at: '2026-01-01T00:00:00Z',
                updated_at: '2026-01-02T00:00:00Z',
              }));
              return Promise.resolve({ data: rows, error: null });
            },
          }),
        };
      },
    }),
  }),
}));

vi.mock('../lib/sentry', () => ({ captureException: vi.fn() }));

import { bulkDeleteLeads, bulkUpdateLeads } from './leadsService';

describe('bulkDeleteLeads', () => {
  beforeEach(() => {
    deleteInMock.mockReset();
  });

  it('no-ops on empty array', async () => {
    await bulkDeleteLeads([]);
    expect(deleteInMock).not.toHaveBeenCalled();
  });

  it('deletes with a single .in() call for small list', async () => {
    await bulkDeleteLeads(['a', 'b', 'c']);
    expect(deleteInMock).toHaveBeenCalledTimes(1);
    expect(deleteInMock).toHaveBeenCalledWith('id', ['a', 'b', 'c']);
  });

  it('chunks >500 ids into batches', async () => {
    const ids = Array.from({ length: 1200 }, (_, i) => `id-${i}`);
    await bulkDeleteLeads(ids);
    expect(deleteInMock).toHaveBeenCalledTimes(3); // 500 + 500 + 200
    expect((deleteInMock.mock.calls[0][1] as string[]).length).toBe(500);
    expect((deleteInMock.mock.calls[2][1] as string[]).length).toBe(200);
  });
});

describe('bulkUpdateLeads', () => {
  beforeEach(() => {
    updateMock.mockReset();
    updateInSelectMock.mockReset();
  });

  it('no-ops on empty ids', async () => {
    const out = await bulkUpdateLeads([], { stage: 'won' });
    expect(out).toEqual([]);
    expect(updateMock).not.toHaveBeenCalled();
  });

  it('maps partial update to snake_case and returns fresh rows', async () => {
    const out = await bulkUpdateLeads(['a', 'b'], { stage: 'won' });
    expect(updateMock).toHaveBeenCalledTimes(1);
    const row = updateMock.mock.calls[0][0] as Record<string, unknown>;
    expect(row.stage).toBe('won');
    expect(row.updated_at).toBeDefined();
    expect(out).toHaveLength(2);
    expect(out[0].stage).toBe('won');
  });
});
