/**
 * Pipeline Kanban view with smooth drag & drop
 */

import React, { useState, useMemo, useCallback, memo } from 'react';
import type { Lead, StageConfig } from '../../lib/types';
import { Card } from '../ui';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';
import { getStageIcon, getStageColorHex } from '../../lib/stageIcons';

export interface PipelineViewProps {
  leads: Lead[];
  stages: StageConfig[];
  onUpdateStage: (leadId: string, newStage: Lead['stage']) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onViewLead?: (lead: Lead) => void;
  onAddNextAction?: (leadId: string) => void;
  onToggleNextAction?: (leadId: string, actionId: string) => void;
  onDeleteNextAction?: (leadId: string, actionId: string) => void;
}

// Memoized Lead Card component to prevent unnecessary re-renders
const LeadCard = memo(function LeadCard({
  lead,
  isDragging,
  isMenuOpen,
  onDragStart,
  onDragEnd,
  onEditLead,
  onDeleteLead,
  onViewLead,
  onMenuToggle
}: {
  lead: Lead;
  isDragging: boolean;
  isMenuOpen: boolean;
  onDragStart: (e: React.DragEvent, leadId: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onViewLead?: (lead: Lead) => void;
  onMenuToggle: (leadId: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, lead.id)}
      onDragEnd={onDragEnd}
      onClick={() => onViewLead?.(lead)}
      className={`transition-all duration-75 cursor-pointer ${
        isDragging ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
      } ${isMenuOpen ? 'relative z-30' : ''}`}
    >
      <Card padding="sm" hover>
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">{lead.name}</h4>
            <div className="relative">
              <button
                className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  onMenuToggle(lead.id);
                }}
                title="Actions"
              >
                <MoreVertical size={16} className="text-gray-600 dark:text-gray-400" />
              </button>
              {isMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => onMenuToggle(lead.id)}
                  />
                  <div className="absolute right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl py-1 z-40 min-w-[160px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditLead(lead);
                        onMenuToggle(lead.id);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:text-blue-600 dark:hover:text-blue-300 flex items-center gap-2"
                    >
                      <Edit size={14} />
                      Modifier
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Supprimer "${lead.name}" ?`)) {
                          onDeleteLead(lead.id);
                        }
                        onMenuToggle(lead.id);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-red-50 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center gap-2"
                    >
                      <Trash2 size={14} />
                      Supprimer
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          {lead.contactName && (
            <p className="text-xs text-gray-700 dark:text-gray-300">{lead.contactName}</p>
          )}
          {lead.company && lead.company !== lead.name && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{lead.company}</p>
          )}
          {lead.value && (
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              {lead.value}€
            </p>
          )}
        </div>
      </Card>
    </div>
  );
});

export const PipelineView = memo(function PipelineView({
  leads,
  stages,
  onUpdateStage,
  onEditLead,
  onDeleteLead,
  onViewLead
}: PipelineViewProps) {
  const [draggedLead, setDraggedLead] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Group leads by stage (memoized to prevent recalculation on every render)
  const leadsByStage = useMemo(() => {
    return leads.reduce((acc, lead) => {
      if (!acc[lead.stage]) {
        acc[lead.stage] = [];
      }
      acc[lead.stage].push(lead);
      return acc;
    }, {} as Record<string, Lead[]>);
  }, [leads]);

  const handleDragStart = useCallback((e: React.DragEvent, leadId: string) => {
    setDraggedLead(leadId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', leadId);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4';
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    setDraggedLead(null);
    setDragOverStage(null);
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    // Guard: only set if value actually changes to avoid 60fps re-renders
    setDragOverStage(prev => (prev === stageId ? prev : stageId));
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverStage(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, newStage: Lead['stage']) => {
    e.preventDefault();
    setDragOverStage(null);
    setDraggedLead(prev => {
      if (prev) onUpdateStage(prev, newStage);
      return null;
    });
  }, [onUpdateStage]);

  const handleMenuToggle = useCallback((leadId: string) => {
    setOpenMenuId(prev => (prev === leadId ? null : leadId));
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Pipeline</h1>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map(stage => (
          <div
            key={stage.id}
            className="flex-shrink-0 w-80"
            onDragOver={(e) => handleDragOver(e, stage.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <div
              className={`rounded-lg p-4 transition-all duration-100 ${
                dragOverStage === stage.id
                  ? 'bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-400 dark:border-blue-500 shadow-lg scale-105'
                  : 'bg-gray-100 dark:bg-gray-900 border-2 border-transparent dark:border-gray-800'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 min-w-0">
                  {(() => {
                    const Icon = getStageIcon(stage.icon);
                    return <Icon size={16} style={{ color: getStageColorHex(stage.color) }} />;
                  })()}
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">{stage.label}</h3>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
                  style={{
                    backgroundColor: `${getStageColorHex(stage.color)}20`,
                    color: getStageColorHex(stage.color),
                  }}
                >
                  {leadsByStage[stage.id]?.length || 0}
                </span>
              </div>

              <div className="space-y-3 min-h-[100px]">
                {leadsByStage[stage.id]?.map(lead => (
                  <LeadCard
                    key={lead.id}
                    lead={lead}
                    isDragging={draggedLead === lead.id}
                    isMenuOpen={openMenuId === lead.id}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onEditLead={onEditLead}
                    onDeleteLead={onDeleteLead}
                    onViewLead={onViewLead}
                    onMenuToggle={handleMenuToggle}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
