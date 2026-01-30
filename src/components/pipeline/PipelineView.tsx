/**
 * Pipeline Kanban view with smooth drag & drop
 */

import React, { useState } from 'react';
import type { Lead, StageConfig } from '../../lib/types';
import { Card } from '../ui';
import { MoreVertical, Edit, Trash2 } from 'lucide-react';

export interface PipelineViewProps {
  leads: Lead[];
  stages: StageConfig[];
  onUpdateStage: (leadId: string, newStage: Lead['stage']) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onAddNextAction?: (leadId: string) => void;
  onToggleNextAction?: (leadId: string, actionId: string) => void;
  onDeleteNextAction?: (leadId: string, actionId: string) => void;
}

export function PipelineView({
  leads,
  stages,
  onUpdateStage,
  onEditLead,
  onDeleteLead
}: PipelineViewProps) {
  const [draggedLead, setDraggedLead] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<string | null>(null);

  // Group leads by stage
  const leadsByStage = leads.reduce((acc, lead) => {
    if (!acc[lead.stage]) {
      acc[lead.stage] = [];
    }
    acc[lead.stage].push(lead);
    return acc;
  }, {} as Record<string, Lead[]>);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    setDraggedLead(leadId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', leadId);
    // Rendre l'élément semi-transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4';
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedLead(null);
    setDragOverStage(null);
    // Restaurer l'opacité
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
  };

  const handleDragOver = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => {
    setDragOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, newStage: Lead['stage']) => {
    e.preventDefault();
    setDragOverStage(null);

    if (draggedLead) {
      // Mise à jour optimiste
      onUpdateStage(draggedLead, newStage);
    }

    setDraggedLead(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pipeline</h1>

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
                  ? 'bg-blue-100 border-2 border-blue-400 shadow-lg scale-105'
                  : 'bg-gray-100 border-2 border-transparent'
              }`}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                <span className="text-sm text-gray-500">
                  {leadsByStage[stage.id]?.length || 0}
                </span>
              </div>

              <div className="space-y-3 min-h-[100px]">
                {leadsByStage[stage.id]?.map(lead => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, lead.id)}
                    onDragEnd={handleDragEnd}
                    className={`transition-all duration-75 cursor-move ${
                      draggedLead === lead.id ? 'scale-95 opacity-50' : 'scale-100 opacity-100'
                    }`}
                  >
                    <Card padding="sm" hover>
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-gray-900 text-sm">{lead.name}</h4>
                          <div className="relative group">
                            <button
                              className="p-1 rounded hover:bg-gray-100"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <MoreVertical size={14} />
                            </button>
                            <div className="hidden group-hover:block absolute right-0 mt-1 bg-white border rounded-lg shadow-lg py-1 z-10">
                              <button
                                onClick={() => onEditLead(lead)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 flex items-center gap-2"
                              >
                                <Edit size={14} />
                                Modifier
                              </button>
                              <button
                                onClick={() => onDeleteLead(lead.id)}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center gap-2"
                              >
                                <Trash2 size={14} />
                                Supprimer
                              </button>
                            </div>
                          </div>
                        </div>
                        {lead.contactName && (
                          <p className="text-xs text-gray-600">{lead.contactName}</p>
                        )}
                        {lead.company && (
                          <p className="text-xs text-gray-500">{lead.company}</p>
                        )}
                        {lead.value && (
                          <p className="text-xs font-semibold text-blue-600">
                            {lead.value}€
                          </p>
                        )}
                      </div>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
