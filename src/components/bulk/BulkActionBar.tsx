/**
 * Floating action bar shown when one or more leads are selected.
 * Offers: change stage (select), delete, deselect.
 */

import React, { useState } from 'react';
import { Trash2, X, ArrowRight } from 'lucide-react';
import { Button } from '../ui';
import type { StageConfig } from '../../lib/types';

export interface BulkActionBarProps {
  count: number;
  stages: StageConfig[];
  onChangeStage: (stageId: string) => void;
  onDelete: () => void;
  onClear: () => void;
}

export function BulkActionBar({
  count,
  stages,
  onChangeStage,
  onDelete,
  onClear,
}: BulkActionBarProps) {
  const [pendingStage, setPendingStage] = useState('');

  if (count === 0) return null;

  const handleApplyStage = (stageId: string) => {
    if (!stageId) return;
    onChangeStage(stageId);
    setPendingStage('');
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-gray-900 text-white rounded-xl shadow-2xl px-5 py-3 flex items-center gap-4 min-w-[500px] max-w-[90vw]">
      <span className="font-semibold whitespace-nowrap">
        {count} {count > 1 ? 'leads sélectionnés' : 'lead sélectionné'}
      </span>

      <div className="h-6 w-px bg-gray-700" />

      <div className="flex items-center gap-2">
        <ArrowRight size={16} className="text-gray-400" />
        <select
          value={pendingStage}
          onChange={(e) => handleApplyStage(e.target.value)}
          className="bg-gray-800 border border-gray-700 text-white text-sm rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="">Changer étape…</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <Button
        size="sm"
        variant="danger"
        icon={<Trash2 size={14} />}
        onClick={onDelete}
      >
        Supprimer
      </Button>

      <div className="h-6 w-px bg-gray-700" />

      <button
        onClick={onClear}
        className="text-gray-300 hover:text-white p-1.5 rounded transition-colors"
        title="Désélectionner"
      >
        <X size={18} />
      </button>
    </div>
  );
}
