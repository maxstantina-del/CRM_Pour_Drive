/**
 * Popover panel with 4 filter sections: cities / stages / tags / valueMin.
 * Live-applies changes to the parent filters state.
 */

import React, { useMemo, useState } from 'react';
import { X, Search } from 'lucide-react';
import type { LeadFilters } from '../../lib/leadFilters';
import type { StageConfig } from '../../lib/types';
import type { Tag } from '../../services/tagsService';

export interface FilterPanelProps {
  filters: LeadFilters;
  onChange: (next: LeadFilters) => void;
  onClose: () => void;
  onReset: () => void;
  cities: string[];
  stages: StageConfig[];
  tags: Tag[];
}

function toggle<T>(list: T[], item: T): T[] {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

export function FilterPanel({ filters, onChange, onClose, onReset, cities, stages, tags }: FilterPanelProps) {
  const [citySearch, setCitySearch] = useState('');

  const visibleCities = useMemo(() => {
    const q = citySearch.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => c.toLowerCase().includes(q));
  }, [cities, citySearch]);

  const toggleCity = (c: string) => onChange({ ...filters, cities: toggle(filters.cities, c) });
  const toggleStage = (id: string) => onChange({ ...filters, stages: toggle(filters.stages, id) });
  const toggleTag = (id: string) => onChange({ ...filters, tagIds: toggle(filters.tagIds, id) });
  const setValueMin = (v?: number) => onChange({ ...filters, valueMin: v });

  return (
    <>
      {/* click-outside backdrop */}
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div
        className="absolute right-0 top-full mt-2 z-40 w-[420px] max-h-[70vh] overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Filtres avancés</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300" title="Fermer">
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-5">
          {/* Cities */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Villes</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">{filters.cities.length || 'aucune'}</span>
            </div>
            {cities.length > 12 && (
              <div className="relative mb-2">
                <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
                <input
                  type="text"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  placeholder="Filtrer villes…"
                  className="w-full pl-7 pr-2 py-1.5 text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-400"
                />
              </div>
            )}
            {cities.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">Aucune ville renseignée.</p>
            ) : (
              <div className="max-h-44 overflow-y-auto space-y-1 border border-gray-100 dark:border-gray-800 rounded p-2">
                {visibleCities.map((c) => (
                  <label key={c} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-1 py-0.5 rounded">
                    <input
                      type="checkbox"
                      checked={filters.cities.includes(c)}
                      onChange={() => toggleCity(c)}
                      className="w-3.5 h-3.5 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-gray-700 dark:text-gray-200">{c}</span>
                  </label>
                ))}
                {visibleCities.length === 0 && <p className="text-xs text-gray-400 dark:text-gray-500 px-1">Aucun résultat.</p>}
              </div>
            )}
          </section>

          {/* Stages */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Étapes</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">{filters.stages.length || 'toutes'}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {stages.map((s) => {
                const active = filters.stages.includes(s.id);
                return (
                  <button
                    key={s.id}
                    onClick={() => toggleStage(s.id)}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                      active
                        ? 'bg-blue-600 border-blue-600 text-white'
                        : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-blue-400'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Tags */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Tags</h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">{filters.tagIds.length || 'tous'}</span>
            </div>
            {tags.length === 0 ? (
              <p className="text-xs text-gray-500 dark:text-gray-400">Aucun tag créé. Ajoute-les depuis une fiche lead.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {tags.map((t) => {
                  const active = filters.tagIds.includes(t.id);
                  return (
                    <button
                      key={t.id}
                      onClick={() => toggleTag(t.id)}
                      style={active ? { backgroundColor: t.color, borderColor: t.color, color: 'white' } : undefined}
                      className={`px-2.5 py-1 text-xs rounded-full border transition-all ${
                        active ? 'shadow-sm' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {t.name}
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* ValueMin */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-200">Valeur minimum (€)</h4>
              {typeof filters.valueMin === 'number' && filters.valueMin > 0 && (
                <button onClick={() => setValueMin(undefined)} className="text-xs text-gray-500 dark:text-gray-400 hover:text-red-600">
                  Effacer
                </button>
              )}
            </div>
            <input
              type="number"
              min={0}
              step={100}
              value={filters.valueMin ?? ''}
              onChange={(e) => {
                const v = e.target.value === '' ? undefined : Number(e.target.value);
                setValueMin(Number.isFinite(v) && (v as number) >= 0 ? v : undefined);
              }}
              placeholder="ex: 1000"
              className="w-full px-3 py-1.5 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-700 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </section>
        </div>

        <div className="flex items-center justify-between p-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 sticky bottom-0">
          <button onClick={onReset} className="text-sm text-gray-600 dark:text-gray-300 hover:text-red-600 font-medium">
            Effacer tout
          </button>
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </>
  );
}
