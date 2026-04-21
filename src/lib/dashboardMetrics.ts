/**
 * Pure aggregation helpers for dashboard charts.
 * No Recharts coupling — raw data only.
 */

import type { Lead, StageConfig, LeadStage } from './types';

const WON_STAGES: readonly LeadStage[] = ['won', 'closed_won'];
const LOST_STAGES: readonly LeadStage[] = ['lost', 'closed_lost'];

export interface FunnelRow {
  stageId: string;
  label: string;
  count: number;
  value: number;
  /** % from the previous stage — null for the first row */
  dropOffPct: number | null;
}

export interface MonthlyWonRow {
  /** YYYY-MM, e.g. "2026-04" */
  monthKey: string;
  /** Short locale label, e.g. "Avr 2026" */
  label: string;
  wonCount: number;
  wonValue: number;
}

export interface StageConversionRow {
  from: string;
  to: string;
  fromLabel: string;
  toLabel: string;
  fromCount: number;
  toCount: number;
  /** % of leads making it from `from` to `to` (0-100) */
  rate: number;
}

const MONTH_LABELS = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(d: Date): string {
  return `${MONTH_LABELS[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Build an ordered funnel from the user's stage config.
 * Drops terminal stages (won/lost) from drop-off math — they are endpoints, not funnel steps.
 */
export function buildFunnelData(leads: Lead[], stages: StageConfig[]): FunnelRow[] {
  const ordered = stages.filter((s) => !LOST_STAGES.includes(s.id as LeadStage));
  const byStage = new Map<string, { count: number; value: number }>();
  for (const s of ordered) byStage.set(s.id, { count: 0, value: 0 });
  for (const l of leads) {
    const bucket = byStage.get(l.stage);
    if (bucket) {
      bucket.count++;
      bucket.value += l.value ?? 0;
    }
  }

  const rows: FunnelRow[] = [];
  let previousCount: number | null = null;
  for (const s of ordered) {
    const { count, value } = byStage.get(s.id)!;
    const dropOffPct = previousCount === null || previousCount === 0 ? null : Math.round((count / previousCount) * 100);
    rows.push({ stageId: s.id, label: s.label, count, value, dropOffPct });
    previousCount = count;
  }
  return rows;
}

/**
 * Won leads grouped by closedDate month (falls back to updatedAt if closedDate missing).
 * Returns exactly `monthsBack` rows, most recent last, including months with zero wins.
 */
export function buildMonthlyWonValue(leads: Lead[], monthsBack = 12, now: Date = new Date()): MonthlyWonRow[] {
  const buckets = new Map<string, MonthlyWonRow>();

  // Seed exactly monthsBack months, oldest first
  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    buckets.set(key, { monthKey: key, label: monthLabel(d), wonCount: 0, wonValue: 0 });
  }

  for (const l of leads) {
    if (!WON_STAGES.includes(l.stage)) continue;
    const raw = l.closedDate ?? l.updatedAt;
    if (!raw) continue;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) continue;
    const key = monthKey(d);
    const b = buckets.get(key);
    if (!b) continue; // outside the window
    b.wonCount++;
    b.wonValue += l.value ?? 0;
  }

  return Array.from(buckets.values());
}

/**
 * Pair-wise conversion rates between consecutive non-terminal stages.
 * Uses current-snapshot counts: fromCount = leads currently at or past `from`,
 * toCount = leads currently at or past `to`. Cumulative interpretation.
 */
export function buildStageConversion(leads: Lead[], stages: StageConfig[]): StageConversionRow[] {
  const ordered = stages.filter((s) => !LOST_STAGES.includes(s.id as LeadStage));
  if (ordered.length < 2) return [];

  const stageIndex = new Map(ordered.map((s, i) => [s.id as string, i]));
  const cumulative = ordered.map(() => 0);

  for (const l of leads) {
    if (LOST_STAGES.includes(l.stage)) continue; // lost leads don't count against progression
    const idx = stageIndex.get(l.stage);
    if (idx === undefined) continue;
    for (let i = 0; i <= idx; i++) cumulative[i]++;
  }

  const rows: StageConversionRow[] = [];
  for (let i = 0; i < ordered.length - 1; i++) {
    const from = ordered[i];
    const to = ordered[i + 1];
    const fromCount = cumulative[i];
    const toCount = cumulative[i + 1];
    const rate = fromCount === 0 ? 0 : Math.round((toCount / fromCount) * 100);
    rows.push({
      from: from.id,
      to: to.id,
      fromLabel: from.label,
      toLabel: to.label,
      fromCount,
      toCount,
      rate,
    });
  }
  return rows;
}

/**
 * Color class for a conversion rate: red <20, amber 20-40, green >40.
 */
export function conversionColor(rate: number): string {
  if (rate < 20) return '#DC2626';
  if (rate < 40) return '#F59E0B';
  return '#16A34A';
}
