/**
 * Expanded color picker: ~48 curated colors in a dense grid with search.
 */

import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { STAGE_COLORS } from '../../lib/stageIcons';

export interface ColorPickerProps {
  value: string;
  onChange: (colorId: string) => void;
  onClose: () => void;
}

export function ColorPicker({ value, onChange, onClose }: ColorPickerProps) {
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return STAGE_COLORS;
    return STAGE_COLORS.filter(
      (c) => c.label.toLowerCase().includes(q) || c.id.toLowerCase().includes(q)
    );
  }, [query]);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute z-50 mt-2 w-[320px] bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-xs text-gray-900 dark:text-gray-100">Couleur</h3>
          <button onClick={onClose} className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={14} />
          </button>
        </div>

        <div className="relative mb-2">
          <Search className="absolute left-2 top-2 w-3.5 h-3.5 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher (jaune, rouge…)"
            className="w-full pl-7 pr-2 py-1.5 text-xs bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-700 rounded focus:outline-none focus:ring-1 focus:ring-blue-400 placeholder:text-gray-400 dark:placeholder:text-gray-500"
            autoFocus
          />
        </div>

        <div className="max-h-[260px] overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center py-4">Aucune couleur.</p>
          ) : (
            <div className="grid grid-cols-8 gap-1.5">
              {filtered.map((c) => {
                const active = c.id === value;
                return (
                  <button
                    key={c.id}
                    onClick={() => { onChange(c.id); onClose(); }}
                    title={c.label}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      active
                        ? 'border-gray-900 dark:border-white shadow-md scale-110'
                        : 'border-white dark:border-gray-700 hover:scale-105'
                    }`}
                    style={{ backgroundColor: c.hex }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {value && (
          <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5">
            <span
              className="w-3 h-3 rounded-full shrink-0"
              style={{ backgroundColor: STAGE_COLORS.find((c) => c.id === value)?.hex ?? '#2563EB' }}
            />
            {STAGE_COLORS.find((c) => c.id === value)?.label ?? value}
          </div>
        )}
      </div>
    </>
  );
}
