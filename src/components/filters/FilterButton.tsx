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
            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 dark:border-blue-800 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50'
            : 'bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
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
