/**
 * Compact color picker: 15 Tailwind-aligned colors, inline swatch grid.
 */

import React from 'react';
import { X } from 'lucide-react';
import { STAGE_COLORS } from '../../lib/stageIcons';

export interface ColorPickerProps {
  value: string;
  onChange: (colorId: string) => void;
  onClose: () => void;
}

export function ColorPicker({ value, onChange, onClose }: ColorPickerProps) {
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div
        className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl p-3"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-xs text-gray-900">Couleur</h3>
          <button onClick={onClose} className="p-0.5 rounded hover:bg-gray-100">
            <X size={14} />
          </button>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {STAGE_COLORS.map((c) => {
            const active = c.id === value;
            return (
              <button
                key={c.id}
                onClick={() => { onChange(c.id); onClose(); }}
                title={c.label}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  active ? 'border-gray-900 shadow-md scale-110' : 'border-white hover:scale-105'
                }`}
                style={{ backgroundColor: c.hex }}
              />
            );
          })}
        </div>
      </div>
    </>
  );
}
