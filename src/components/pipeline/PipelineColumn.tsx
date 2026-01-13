import { useState, useRef, useEffect } from 'react';
import { motion, DragControls } from 'framer-motion';
import { Lead } from '../../lib/types';
import { LeadCard } from './LeadCard';
import { Badge } from '../ui';
import { GripVertical, Check } from 'lucide-react';

import { STAGE_ICONS } from '../../hooks/usePipelineStages';
import { StageConfig } from '../../lib/types';

interface PipelineColumnProps {
  config: StageConfig;
  leads: Lead[];
  onEdit: (lead: Lead) => void;
  onDelete: (id: string) => void;
  onViewDetails: (lead: Lead) => void;
  onDrop: (leadId: string, newStage: string) => void;
  dragControls?: DragControls;
  onUpdateColumn: (id: string, updates: Partial<StageConfig>) => void;
  onDeleteColumn: (id: string) => void;
}

const COLOR_MAP: Record<string, string> = {
  gray: '#6b7280',
  blue: '#3b82f6',
  green: '#22c55e',
  yellow: '#eab308',
  red: '#ef4444',
  purple: '#a855f7',
  indigo: '#6366f1',
  pink: '#ec4899',
  orange: '#f97316',
  teal: '#14b8a6'
};

export function PipelineColumn({ config, leads, onEdit,
  onDelete,
  onViewDetails,
  onDrop, dragControls, onUpdateColumn }: PipelineColumnProps) {
  const Icon = STAGE_ICONS[config.icon] || STAGE_ICONS['HelpCircle'];
  // Removed local usePipelineStages usage
  const [isEditing, setIsEditing] = useState(false);
  const [editLabel, setEditLabel] = useState(config.label);
  const [editEmoji, setEditEmoji] = useState(config.emoji || '');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const editRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (isEditing && editRef.current && !editRef.current.contains(event.target as Node)) {
        // Only save if the click is outside the edit container
        handleSave();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditing, editLabel, editEmoji, config]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('ring-2', 'ring-accent-blue');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('ring-2', 'ring-accent-blue');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-accent-blue');
    const leadId = e.dataTransfer.getData('leadId');
    if (leadId) {
      onDrop(leadId, config.id);
    }
  };

  const colors = ['gray', 'blue', 'green', 'yellow', 'red', 'purple', 'indigo', 'pink', 'orange', 'teal'];

  const handleSave = () => {
    if (editLabel.trim() && (editLabel !== config.label || editEmoji !== config.emoji)) {
      onUpdateColumn(config.id, {
        label: editLabel,
        emoji: editEmoji
      });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setEditLabel(config.label);
      setEditEmoji(config.emoji || '');
      setIsEditing(false);
    }
  };

  const totalValue = leads.reduce((sum, lead) => sum + (lead.value || 0), 0);

  return (
    <div
      className="w-full h-full flex flex-col"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="glass rounded-t-xl p-1 sm:p-1.5 md:p-2 lg:p-3 xl:p-4 border-b border-white/10 group relative z-10">
        <div className="flex items-start justify-between mb-2">

          {isEditing ? (
            <div ref={editRef} className="flex-1 flex flex-col gap-3 min-w-0" onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="bg-white/10 border border-white/20 rounded px-2 py-1 text-sm text-white w-10 text-center hover:bg-white/20 transition-colors"
                  >
                    {editEmoji || '😃'}
                  </button>
                  {showEmojiPicker && (
                    <div className="absolute top-full left-0 mt-2 p-2 bg-gray-800 border border-gray-700 rounded-lg shadow-xl grid grid-cols-4 gap-1 z-50 w-48">
                      {['⚡', '🔥', '⭐', '💎', '🚀', '💰', '📈', '🤝', '📅', '✅', '❌', '⚠️', '🔔', '📧', '📞', '💼', '🏆', '🎯', '💡', '🛑'].map(emoji => (
                        <button
                          key={emoji}
                          onClick={() => {
                            setEditEmoji(emoji);
                            setShowEmojiPicker(false);
                          }}
                          className="p-1.5 hover:bg-gray-700 rounded text-lg transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <input
                  autoFocus
                  type="text"
                  value={editLabel}
                  onChange={(e) => setEditLabel(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-white/10 border rounded px-2 py-1 text-sm text-white w-full focus:outline-none transition-colors min-w-0"
                  style={{ borderColor: COLOR_MAP[config.color] || 'rgba(255,255,255,0.2)' }}
                />
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSave();
                    }}
                    className="p-1.5 hover:bg-green-500/20 text-green-400 rounded transition-colors"
                    title="Valider"
                  >
                    <Check size={16} />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {colors.map((c) => (
                  <button
                    key={c}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onUpdateColumn(config.id, { color: c });
                    }}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${config.color === c ? 'border-white scale-110' : 'border-transparent hover:scale-105'
                      }`}
                    style={{ backgroundColor: COLOR_MAP[c] }}
                    title={c}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 cursor-pointer w-full" onClick={() => {
              setEditLabel(config.label);
              setEditEmoji(config.emoji || '');
              setIsEditing(true);
            }}>
              {dragControls && (
                <div
                  className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-white transition-colors"
                  onPointerDown={(e) => {
                    e.stopPropagation();
                    dragControls.start(e);
                  }}
                >
                  <GripVertical size={16} />
                </div>
              )}
              <Badge variant={config.color} icon={config.emoji ? <span className="text-sm leading-none">{config.emoji}</span> : <Icon size={14} />} className="hover:ring-2 hover:ring-white/20 transition-all select-none">
                {config.label}
              </Badge>
              <span className="text-sm font-medium text-gray-400 ml-auto">{leads.length}</span>
            </div>
          )}
        </div>
        {totalValue > 0 && !isEditing && (
          <p className="text-xs text-gray-500 mt-2">
            Total: ${totalValue.toLocaleString()}
          </p>
        )}
      </div>

      <motion.div
        className="glass rounded-b-xl p-1 sm:p-1.5 md:p-2 lg:p-3 xl:p-4 flex-1 overflow-hidden"
        style={{ maxHeight: 'calc(100% - 80px)' }}
      >
        {leads.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Icon size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No leads yet</p>
          </div>
        ) : (
          <div className="space-y-1 sm:space-y-1.5 md:space-y-2 lg:space-y-3 overflow-y-auto scrollbar-hide h-full">
            {leads.map((lead) => (
              <div
                key={lead.id}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('leadId', lead.id);
                  e.currentTarget.classList.add('opacity-50');
                }}
                onDragEnd={(e) => {
                  e.currentTarget.classList.remove('opacity-50');
                }}
              >
                <LeadCard
                  lead={lead}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onViewDetails={onViewDetails}
                />
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
