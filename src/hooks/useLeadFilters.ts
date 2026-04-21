/**
 * Stateful filter bag with localStorage persistence.
 * Wraps LeadFilters and exposes per-field updaters.
 */

import { useCallback, useEffect, useState } from 'react';
import type { LeadFilters } from '../lib/leadFilters';
import { EMPTY_FILTERS, countActiveFilters } from '../lib/leadFilters';

const STORAGE_KEY = 'crm_lead_filters_v1';

function load(): LeadFilters {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_FILTERS;
    const parsed = JSON.parse(raw) as Partial<LeadFilters>;
    return {
      search: typeof parsed.search === 'string' ? parsed.search : '',
      cities: Array.isArray(parsed.cities) ? parsed.cities : [],
      stages: Array.isArray(parsed.stages) ? parsed.stages : [],
      tagIds: Array.isArray(parsed.tagIds) ? parsed.tagIds : [],
      valueMin: typeof parsed.valueMin === 'number' ? parsed.valueMin : undefined,
    };
  } catch {
    return EMPTY_FILTERS;
  }
}

export function useLeadFilters() {
  const [filters, setFilters] = useState<LeadFilters>(() => load());

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filters));
    } catch { /* quota — ignore */ }
  }, [filters]);

  const updateFilter = useCallback(<K extends keyof LeadFilters>(key: K, value: LeadFilters[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetFilters = useCallback(() => setFilters(EMPTY_FILTERS), []);

  const activeCount = countActiveFilters(filters);

  return { filters, setFilters, updateFilter, resetFilters, activeCount };
}
