/**
 * Popover icon picker with search + category filter, 120 curated icons.
 */

import React, { useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { ICON_CATEGORIES, STAGE_ICON_MAP, getStageIcon } from '../../lib/stageIcons';

export interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
  onClose: () => void;
  color?: string; // hex for preview
}

export function IconPicker({ value, onChange, onClose, color = '#2563EB' }: IconPickerProps) {
  const [query, setQuery] = useState('');
  const [categoryId, setCategoryId] = useState<string | 'all'>('all');

  const q = query.trim().toLowerCase();

  const icons = useMemo(() => {
    const pool = categoryId === 'all'
      ? Object.keys(STAGE_ICON_MAP)
      : ICON_CATEGORIES.find((c) => c.id === categoryId)?.icons ?? [];
    if (!q) return pool;
    return pool.filter((name) => name.toLowerCase().includes(q));
  }, [q, categoryId]);

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute z-50 mt-2 w-[420px] bg-white border border-gray-200 rounded-xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-3 border-b border-gray-100">
          <h3 className="font-semibold text-sm text-gray-900">Choisir une icône</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100">
            <X size={16} />
          </button>
        </div>

        <div className="p-3 space-y-3">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (ex: phone, calendar)…"
              className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-200 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              autoFocus
            />
          </div>

          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setCategoryId('all')}
              className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                categoryId === 'all'
                  ? 'bg-blue-600 border-blue-600 text-white'
                  : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
              }`}
            >
              Tout
            </button>
            {ICON_CATEGORIES.map((c) => (
              <button
                key={c.id}
                onClick={() => setCategoryId(c.id)}
                className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                  categoryId === c.id
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-blue-400'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className="max-h-[280px] overflow-y-auto">
            {icons.length === 0 ? (
              <p className="text-xs text-gray-500 text-center py-6">Aucune icône trouvée.</p>
            ) : (
              <div className="grid grid-cols-10 gap-1">
                {icons.map((name) => {
                  const Icon = getStageIcon(name);
                  const isActive = name === value;
                  return (
                    <button
                      key={name}
                      onClick={() => {
                        onChange(name);
                        onClose();
                      }}
                      className={`w-9 h-9 flex items-center justify-center rounded border transition-all ${
                        isActive
                          ? 'border-blue-500 bg-blue-50 shadow-sm'
                          : 'border-transparent hover:bg-gray-100 hover:border-gray-200'
                      }`}
                      title={name}
                    >
                      <Icon size={18} style={{ color: isActive ? color : '#4B5563' }} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
