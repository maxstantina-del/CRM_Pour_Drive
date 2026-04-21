/**
 * Toggle button for the FilterPanel, with active filter count badge.
 */

import React, { useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { FilterPanel, type FilterPanelProps } from './FilterPanel';

export interface FilterButtonProps extends Omit<FilterPanelProps, 'onClose'> {
  activeCount: number;
}

export function FilterButton({ activeCount, ...panelProps }: FilterButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={`inline-flex items-center gap-2 px-3 py-2 text-sm border rounded-lg transition-colors ${
          activeCount > 0
            ? 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <SlidersHorizontal size={16} />
        <span className="font-medium">Filtres</span>
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold bg-blue-600 text-white rounded-full">
            {activeCount}
          </span>
        )}
      </button>

      {open && <FilterPanel {...panelProps} onClose={() => setOpen(false)} />}
    </div>
  );
}
