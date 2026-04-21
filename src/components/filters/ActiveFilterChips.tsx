/**
 * Row of active filter chips under the search bar; each chip removes one criterion.
 */

import React from 'react';
import { X } from 'lucide-react';
import type { LeadFilters } from '../../lib/leadFilters';
import type { StageConfig } from '../../lib/types';
import type { Tag } from '../../services/tagsService';

export interface ActiveFilterChipsProps {
  filters: LeadFilters;
  onChange: (next: LeadFilters) => void;
  onClearAll: () => void;
  stages: StageConfig[];
  tags: Tag[];
}

function Chip({ label, onRemove, color }: { label: string; onRemove: () => void; color?: string }) {
  return (
    <span
      className="inline-flex items-center gap-1 pl-2.5 pr-1 py-1 text-xs rounded-full border"
      style={color ? { backgroundColor: `${color}20`, borderColor: color, color } : { backgroundColor: '#EFF6FF', borderColor: '#BFDBFE', color: '#1D4ED8' }}
    >
      <span className="font-medium">{label}</span>
      <button
        onClick={onRemove}
        className="p-0.5 rounded-full hover:bg-black/10"
        title="Retirer"
      >
        <X size={12} />
      </button>
    </span>
  );
}

export function ActiveFilterChips({ filters, onChange, onClearAll, stages, tags }: ActiveFilterChipsProps) {
  const stageLabel = (id: string) => stages.find((s) => s.id === id)?.label ?? id;
  const tag = (id: string) => tags.find((t) => t.id === id);

  const hasAny =
    filters.cities.length ||
    filters.stages.length ||
    filters.tagIds.length ||
    (typeof filters.valueMin === 'number' && filters.valueMin > 0);

  if (!hasAny) return null;

  return (
    <div className="flex items-center flex-wrap gap-2">
      {filters.cities.map((c) => (
        <Chip key={`c-${c}`} label={`📍 ${c}`} onRemove={() => onChange({ ...filters, cities: filters.cities.filter((x) => x !== c) })} />
      ))}
      {filters.stages.map((s) => (
        <Chip key={`s-${s}`} label={`📌 ${stageLabel(s)}`} onRemove={() => onChange({ ...filters, stages: filters.stages.filter((x) => x !== s) })} />
      ))}
      {filters.tagIds.map((id) => {
        const t = tag(id);
        return (
          <Chip
            key={`t-${id}`}
            label={`🏷 ${t?.name ?? id}`}
            color={t?.color}
            onRemove={() => onChange({ ...filters, tagIds: filters.tagIds.filter((x) => x !== id) })}
          />
        );
      })}
      {typeof filters.valueMin === 'number' && filters.valueMin > 0 && (
        <Chip
          label={`💰 ≥ ${filters.valueMin}€`}
          onRemove={() => onChange({ ...filters, valueMin: undefined })}
        />
      )}

      <button onClick={onClearAll} className="text-xs text-gray-500 hover:text-red-600 underline ml-1">
        Effacer tout
      </button>
    </div>
  );
}
