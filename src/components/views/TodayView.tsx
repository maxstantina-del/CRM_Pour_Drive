/**
 * Today view - shows leads with actions due today
 */

import React from 'react';
import type { Lead } from '../../lib/types';
import { Card, Button } from '../ui';
import { getLeadsDueToday, getOverdueLeads } from '../../lib/utils';
import { Calendar, AlertCircle } from 'lucide-react';

export interface TodayViewProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onUpdateStage: (leadId: string, newStage: Lead['stage']) => void;
}

export function TodayView({ leads, onEditLead }: TodayViewProps) {
  const dueToday = getLeadsDueToday(leads);
  const overdue = getOverdueLeads(leads);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Aujourd'hui</h1>

      {/* Overdue */}
      {overdue.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-red-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900">En retard ({overdue.length})</h2>
          </div>
          <div className="space-y-3">
            {overdue.map(lead => (
              <Card key={lead.id} padding="md" hover onClick={() => onEditLead(lead)}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{lead.name}</h3>
                    {lead.contactName && (
                      <p className="text-sm text-gray-600 mt-1">{lead.contactName}</p>
                    )}
                    <div className="mt-2 space-y-1">
                      {lead.nextActions?.filter(a => !a.completed).map(action => (
                        <p key={action.id} className="text-sm text-red-600">
                          • {action.text}
                        </p>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => onEditLead(lead)}>
                    Voir
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Due Today */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="text-blue-500" size={20} />
          <h2 className="text-lg font-semibold text-gray-900">À faire aujourd'hui ({dueToday.length})</h2>
        </div>
        {dueToday.length === 0 ? (
          <Card padding="lg">
            <p className="text-center text-gray-500">Aucune action prévue pour aujourd'hui</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {dueToday.map(lead => (
              <Card key={lead.id} padding="md" hover onClick={() => onEditLead(lead)}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900">{lead.name}</h3>
                    {lead.contactName && (
                      <p className="text-sm text-gray-600 mt-1">{lead.contactName}</p>
                    )}
                    <div className="mt-2 space-y-1">
                      {lead.nextActions?.filter(a => !a.completed).map(action => (
                        <p key={action.id} className="text-sm text-gray-700">
                          • {action.text}
                        </p>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" onClick={() => onEditLead(lead)}>
                    Voir
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
