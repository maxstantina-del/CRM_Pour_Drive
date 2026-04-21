import { describe, it, expect } from 'vitest';
import type { Lead, StageConfig } from './types';
import { buildFunnelData, buildMonthlyWonValue, buildStageConversion, conversionColor } from './dashboardMetrics';

const stages: StageConfig[] = [
  { id: 'new', label: 'Nouveau', icon: 'X', color: 'blue' },
  { id: 'contacted', label: 'Contacté', icon: 'X', color: 'yellow' },
  { id: 'qualified', label: 'Qualifié', icon: 'X', color: 'purple' },
  { id: 'won', label: 'Gagné', icon: 'X', color: 'green' },
  { id: 'lost', label: 'Perdu', icon: 'X', color: 'red' },
];

const now = '2026-04-21T10:00:00Z';

function L(p: Partial<Lead>): Lead {
  return {
    id: p.id ?? 'x',
    name: p.name ?? 'X',
    stage: p.stage ?? 'new',
    createdAt: p.createdAt ?? now,
    updatedAt: p.updatedAt ?? now,
    ...p,
  } as Lead;
}

describe('buildFunnelData', () => {
  it('drops lost stages and includes won as endpoint', () => {
    const out = buildFunnelData([], stages);
    expect(out.map((r) => r.stageId)).toEqual(['new', 'contacted', 'qualified', 'won']);
  });

  it('computes per-stage counts and ratio vs previous stage', () => {
    const leads = [
      L({ id: '1', stage: 'new', value: 100 }),
      L({ id: '2', stage: 'new', value: 100 }),
      L({ id: '3', stage: 'contacted', value: 200 }),
      L({ id: '4', stage: 'won', value: 500 }),
    ];
    const out = buildFunnelData(leads, stages);
    const newRow = out.find((r) => r.stageId === 'new')!;
    const contactedRow = out.find((r) => r.stageId === 'contacted')!;
    expect(newRow.count).toBe(2);
    expect(newRow.value).toBe(200);
    expect(newRow.dropOffPct).toBeNull(); // first row
    expect(contactedRow.count).toBe(1);
    expect(contactedRow.dropOffPct).toBe(50); // 1/2
  });
});

describe('buildMonthlyWonValue', () => {
  it('returns exactly N months with zero-filled buckets', () => {
    const out = buildMonthlyWonValue([], 12, new Date('2026-04-21'));
    expect(out).toHaveLength(12);
    expect(out[11].monthKey).toBe('2026-04');
    expect(out[11].wonCount).toBe(0);
  });

  it('groups won leads by closedDate month, falls back to updatedAt', () => {
    const leads = [
      L({ id: '1', stage: 'won', value: 1000, closedDate: '2026-04-10T00:00:00Z' }),
      L({ id: '2', stage: 'won', value: 2000, updatedAt: '2026-03-15T00:00:00Z' }), // no closedDate
      L({ id: '3', stage: 'lost', value: 999, closedDate: '2026-04-10T00:00:00Z' }),
    ];
    const out = buildMonthlyWonValue(leads, 3, new Date('2026-04-21'));
    expect(out).toHaveLength(3);
    const april = out.find((r) => r.monthKey === '2026-04')!;
    const march = out.find((r) => r.monthKey === '2026-03')!;
    expect(april.wonValue).toBe(1000);
    expect(april.wonCount).toBe(1);
    expect(march.wonValue).toBe(2000);
  });
});

describe('buildStageConversion', () => {
  it('computes cumulative pair-wise rates', () => {
    const leads = [
      L({ id: '1', stage: 'new' }),
      L({ id: '2', stage: 'new' }),
      L({ id: '3', stage: 'contacted' }),
      L({ id: '4', stage: 'qualified' }),
      L({ id: '5', stage: 'won' }),
      L({ id: '6', stage: 'lost' }), // excluded
    ];
    const out = buildStageConversion(leads, stages);
    const newToContacted = out.find((r) => r.from === 'new' && r.to === 'contacted')!;
    // cumulative: new=5, contacted=3 → 60%
    expect(newToContacted.rate).toBe(60);
  });
});

describe('conversionColor', () => {
  it('returns red/amber/green thresholds', () => {
    expect(conversionColor(10)).toBe('#DC2626');
    expect(conversionColor(30)).toBe('#F59E0B');
    expect(conversionColor(60)).toBe('#16A34A');
  });
});
