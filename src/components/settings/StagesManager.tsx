/**
 * Manage pipeline stages: rename, change icon, change color, reorder, add, delete.
 */

import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Trash2, Plus, Check, X as XIcon, AlertCircle, Lock } from 'lucide-react';
import type { StageConfig, LeadStage, StageColor } from '../../lib/types';
import { getStageIcon, getStageColorHex } from '../../lib/stageIcons';
import { IconPicker } from './IconPicker';
import { ColorPicker } from './ColorPicker';
import { generateId } from '../../lib/utils';

export interface StagesManagerProps {
  stages: StageConfig[];
  onAdd: (stage: StageConfig) => void;
  onUpdate: (stageId: LeadStage, updates: Partial<StageConfig>) => void;
  onRemove: (stageId: LeadStage) => void;
  onReorder: (from: number, to: number) => void;
}

const MIN_STAGES = 2;
const MAX_STAGES = 20;

export function StagesManager({ stages, onAdd, onUpdate, onRemove, onReorder }: StagesManagerProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [iconOpenFor, setIconOpenFor] = useState<string | null>(null);
  const [colorOpenFor, setColorOpenFor] = useState<string | null>(null);

  const startRename = (s: StageConfig) => {
    setEditingId(s.id);
    setEditValue(s.label);
  };

  const commitRename = (id: LeadStage) => {
    const v = editValue.trim();
    if (v) onUpdate(id, { label: v });
    setEditingId(null);
  };

  const handleAdd = () => {
    if (stages.length >= MAX_STAGES) return;
    const newStage: StageConfig = {
      id: generateId() as LeadStage,
      label: 'Nouvelle étape',
      icon: 'Target',
      color: 'blue',
    };
    onAdd(newStage);
    startRename(newStage);
  };

  const handleDelete = (id: LeadStage, label: string) => {
    if (stages.length <= MIN_STAGES) return;
    if (confirm(`Supprimer l'étape "${label}" ? Les leads de cette étape resteront mais sans colonne d'affichage.`)) {
      onRemove(id);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-gray-900">Étapes du pipeline</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {stages.length} étape{stages.length > 1 ? 's' : ''} · min {MIN_STAGES}, max {MAX_STAGES}
          </p>
        </div>
        <button
          onClick={handleAdd}
          disabled={stages.length >= MAX_STAGES}
          className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={14} /> Ajouter
        </button>
      </div>

      {stages.length >= MAX_STAGES && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded p-2 text-xs text-amber-800">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>Limite atteinte ({MAX_STAGES} étapes maximum).</span>
        </div>
      )}

      <div className="space-y-2">
        {stages.map((s, idx) => {
          const Icon = getStageIcon(s.icon);
          const color = getStageColorHex(s.color);
          const isEditing = editingId === s.id;
          const showIcon = iconOpenFor === s.id;
          const showColor = colorOpenFor === s.id;
          // Colonne "Nouveau" : verrouillée — c'est la file d'attente brute,
          // toujours en première position, ni renommable ni supprimable ni déplaçable.
          const isLocked = s.id === 'new';
          // Si "Nouveau" est en position 0, le stage juste en dessous (idx 1)
          // ne peut pas remonter au-dessus.
          const upDisabled = idx === 0 || (idx === 1 && stages[0]?.id === 'new');

          return (
            <div
              key={s.id}
              className={`flex items-center gap-2 p-2 border rounded-lg transition-colors ${
                isLocked
                  ? 'border-gray-200 bg-gray-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
              title={isLocked ? 'Colonne verrouillée — file d\'attente du pipeline' : undefined}
            >
              {/* Icon (clickable, sauf si locked) */}
              <div className="relative">
                <button
                  onClick={() => {
                    if (isLocked) return;
                    setIconOpenFor(showIcon ? null : s.id);
                    setColorOpenFor(null);
                  }}
                  disabled={isLocked}
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors disabled:cursor-not-allowed disabled:hover:bg-transparent"
                  title={isLocked ? undefined : "Changer l'icône"}
                  style={{ color }}
                >
                  <Icon size={18} />
                </button>
                {showIcon && !isLocked && (
                  <IconPicker
                    value={s.icon}
                    color={color}
                    onChange={(name) => onUpdate(s.id, { icon: name })}
                    onClose={() => setIconOpenFor(null)}
                  />
                )}
              </div>

              {/* Color swatch (clickable, sauf si locked) */}
              <div className="relative">
                <button
                  onClick={() => {
                    if (isLocked) return;
                    setColorOpenFor(showColor ? null : s.id);
                    setIconOpenFor(null);
                  }}
                  disabled={isLocked}
                  className="w-6 h-6 rounded-full border-2 border-white shadow hover:scale-110 transition-transform disabled:cursor-not-allowed disabled:hover:scale-100"
                  style={{ backgroundColor: color }}
                  title={isLocked ? undefined : 'Changer la couleur'}
                />
                {showColor && !isLocked && (
                  <ColorPicker
                    value={s.color}
                    onChange={(id) => onUpdate(s.id, { color: id as StageColor })}
                    onClose={() => setColorOpenFor(null)}
                  />
                )}
              </div>

              {/* Label (inline edit, sauf si locked) */}
              {isEditing && !isLocked ? (
                <div className="flex-1 flex items-center gap-1">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') commitRename(s.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onBlur={() => commitRename(s.id)}
                    className="flex-1 px-2 py-1 text-sm border border-blue-400 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button onClick={() => commitRename(s.id)} className="p-1 text-green-600 hover:bg-green-50 rounded" title="Enregistrer">
                    <Check size={14} />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1 text-gray-400 hover:bg-gray-100 rounded" title="Annuler">
                    <XIcon size={14} />
                  </button>
                </div>
              ) : isLocked ? (
                <div className="flex-1 flex items-center gap-2 text-sm font-medium text-gray-500 cursor-not-allowed truncate">
                  <span className="truncate">{s.label}</span>
                  <Lock size={12} className="shrink-0 text-gray-400" aria-label="Verrouillée" />
                </div>
              ) : (
                <button
                  onClick={() => startRename(s)}
                  className="flex-1 text-left text-sm font-medium text-gray-900 hover:text-blue-600 truncate"
                  title="Renommer"
                >
                  {s.label}
                </button>
              )}

              {/* Actions */}
              <div className="flex items-center gap-0.5">
                <button
                  onClick={() => onReorder(idx, idx - 1)}
                  disabled={isLocked || upDisabled}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600"
                  title="Monter"
                >
                  <ArrowUp size={14} />
                </button>
                <button
                  onClick={() => onReorder(idx, idx + 1)}
                  disabled={isLocked || idx === stages.length - 1}
                  className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600"
                  title="Descendre"
                >
                  <ArrowDown size={14} />
                </button>
                <button
                  onClick={() => handleDelete(s.id, s.label)}
                  disabled={isLocked || stages.length <= MIN_STAGES}
                  className="p-1.5 rounded hover:bg-red-50 text-red-600 disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
