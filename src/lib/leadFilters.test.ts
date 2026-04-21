import { describe, it, expect } from 'vitest';
import type { Lead } from './types';
import { applyLeadFilters, extractCities, EMPTY_FILTERS, countActiveFilters } from './leadFilters';

const now = new Date().toISOString();
function L(p: Partial<Lead>): Lead {
  return {
    id: p.id ?? 'x',
    name: p.name ?? 'X',
    stage: p.stage ?? 'new',
    createdAt: now,
    updatedAt: now,
    ...p,
  } as Lead;
}

const leads: Lead[] = [
  L({ id: '1', name: 'Annecy Tabac', city: 'Annecy', stage: 'new', value: 1000 }),
  L({ id: '2', name: 'Paris Bar', city: 'Paris', stage: 'contacted', value: 5000 }),
  L({ id: '3', name: 'Lyon Shop', city: 'Lyon', stage: 'qualified', value: 2500 }),
  L({ id: '4', name: 'Annecy Cafe', city: 'annecy', stage: 'contacted' }), // diacritic/case variant
];

describe('applyLeadFilters', () => {
  it('returns everything when filters empty', () => {
    expect(applyLeadFilters(leads, EMPTY_FILTERS)).toHaveLength(4);
  });

  it('combines cities (normalized) and stages with AND logic', () => {
    const out = applyLeadFilters(leads, { ...EMPTY_FILTERS, cities: ['Annecy'], stages: ['contacted'] });
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe('4');
  });

  it('filters by valueMin', () => {
    const out = applyLeadFilters(leads, { ...EMPTY_FILTERS, valueMin: 2000 });
    expect(out.map((l) => l.id).sort()).toEqual(['2', '3']);
  });

  it('filters by tag ids via leadTags map', () => {
    const map = new Map<string, string[]>([
      ['1', ['hot']],
      ['3', ['hot', 'priority']],
    ]);
    const out = applyLeadFilters(leads, { ...EMPTY_FILTERS, tagIds: ['hot'] }, map);
    expect(out.map((l) => l.id).sort()).toEqual(['1', '3']);
  });

  it('search on name + diacritic-insensitive', () => {
    const out = applyLeadFilters(leads, { ...EMPTY_FILTERS, search: 'annecy' });
    expect(out.map((l) => l.id).sort()).toEqual(['1', '4']);
  });
});

describe('extractCities', () => {
  it('returns unique cities sorted, dedupes diacritic/case', () => {
    const out = extractCities(leads);
    expect(out).toEqual(['Annecy', 'Lyon', 'Paris']);
  });
});

describe('countActiveFilters', () => {
  it('counts each non-empty category once', () => {
    expect(countActiveFilters(EMPTY_FILTERS)).toBe(0);
    expect(
      countActiveFilters({ search: 'x', cities: ['a'], stages: [], tagIds: ['t'], valueMin: 500 })
    ).toBe(4);
  });
});
