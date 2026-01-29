/**
 * Pipeline Kanban view with drag & drop
 */

import React from 'react';
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
  // Group leads by stage
  const leadsByStage = leads.reduce((acc, lead) => {
    if (!acc[lead.stage]) {
      acc[lead.stage] = [];
    }
    acc[lead.stage].push(lead);
    return acc;
  }, {} as Record<string, Lead[]>);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Pipeline</h1>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {stages.map(stage => (
          <div key={stage.id} className="flex-shrink-0 w-80">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">{stage.label}</h3>
                <span className="text-sm text-gray-500">
                  {leadsByStage[stage.id]?.length || 0}
                </span>
              </div>

              <div className="space-y-3">
                {leadsByStage[stage.id]?.map(lead => (
                  <Card key={lead.id} padding="sm" hover>
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-gray-900 text-sm">{lead.name}</h4>
                        <div className="relative group">
                          <button className="p-1 rounded hover:bg-gray-100">
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
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
