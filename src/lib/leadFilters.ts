/**
 * Pure filtering logic for leads — composable, testable in isolation.
 */

import type { Lead } from './types';

export interface LeadFilters {
  search: string;
  cities: string[];
  stages: string[];
  tagIds: string[];
  valueMin?: number;
}

export const EMPTY_FILTERS: LeadFilters = {
  search: '',
  cities: [],
  stages: [],
  tagIds: [],
  valueMin: undefined,
};

export function countActiveFilters(f: LeadFilters): number {
  let n = 0;
  if (f.search.trim()) n++;
  if (f.cities.length) n++;
  if (f.stages.length) n++;
  if (f.tagIds.length) n++;
  if (typeof f.valueMin === 'number' && f.valueMin > 0) n++;
  return n;
}

export function isFiltersEmpty(f: LeadFilters): boolean {
  return countActiveFilters(f) === 0;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function applyLeadFilters(
  leads: Lead[],
  filters: LeadFilters,
  tagIdsByLead?: Map<string, string[]>
): Lead[] {
  if (isFiltersEmpty(filters)) return leads;

  const q = normalize(filters.search);
  const citySet = new Set(filters.cities.map((c) => normalize(c)));
  const stageSet = new Set(filters.stages);
  const tagSet = new Set(filters.tagIds);
  const min = typeof filters.valueMin === 'number' ? filters.valueMin : undefined;

  return leads.filter((l) => {
    if (q) {
      const hay = normalize(
        [l.name, l.company, l.contactName, l.email, l.phone, l.city]
          .filter(Boolean)
          .join(' ')
      );
      if (!hay.includes(q)) return false;
    }
    if (citySet.size > 0) {
      const city = l.city ? normalize(l.city) : '';
      if (!citySet.has(city)) return false;
    }
    if (stageSet.size > 0 && !stageSet.has(l.stage)) return false;
    if (tagSet.size > 0) {
      const leadTags = tagIdsByLead?.get(l.id) ?? [];
      if (!leadTags.some((t) => tagSet.has(t))) return false;
    }
    if (min !== undefined && (l.value ?? 0) < min) return false;
    return true;
  });
}

export function extractCities(leads: Lead[]): string[] {
  const set = new Map<string, string>(); // normalized → original
  for (const l of leads) {
    const c = (l.city ?? '').trim();
    if (!c) continue;
    const key = normalize(c);
    if (!set.has(key)) set.set(key, c);
  }
  return Array.from(set.values()).sort((a, b) => a.localeCompare(b, 'fr'));
}
