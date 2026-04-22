/**
 * Today view - shows leads with actions due today
 */

import React, { useMemo } from 'react';
import type { Lead } from '../../lib/types';
import { Card, Button } from '../ui';
import { getLeadsDueToday, getOverdueLeads } from '../../lib/utils';
import { Calendar, AlertCircle, Truck } from 'lucide-react';
import { useAllFiches } from '../../contexts/FichesContext';
import { parseFicheSlots, formatSlotCompact } from '../../lib/appointments';

export interface TodayViewProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onUpdateStage: (leadId: string, newStage: Lead['stage']) => void;
  onViewLead?: (lead: Lead) => void;
}

export function TodayView({ leads, onEditLead, onViewLead }: TodayViewProps) {
  const openLead = onViewLead ?? onEditLead;
  const dueToday = getLeadsDueToday(leads);
  const overdue = getOverdueLeads(leads);
  const { fichesByLead } = useAllFiches();

  // Fiches appointments scheduled for today, grouped per lead
  const apptsToday = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const results: Array<{ lead: Lead; slots: ReturnType<typeof parseFicheSlots> }> = [];
    const leadById = new Map(leads.map((l) => [l.id, l]));
    for (const [leadId, fiches] of fichesByLead) {
      const lead = leadById.get(leadId);
      if (!lead) continue;
      const todaySlots = fiches.flatMap((f) => parseFicheSlots(f)).filter((s) =>
        s.when.getTime() >= today.getTime() && s.when.getTime() < tomorrow.getTime()
      );
      if (todaySlots.length > 0) {
        todaySlots.sort((a, b) => a.when.getTime() - b.when.getTime());
        results.push({ lead, slots: todaySlots });
      }
    }
    return results;
  }, [leads, fichesByLead]);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Aujourd'hui</h1>

      {/* Appointments Autoglass today */}
      {apptsToday.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Truck className="text-blue-600" size={20} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Rendez-vous Autoglass du jour ({apptsToday.length})
            </h2>
          </div>
          <div className="space-y-3">
            {apptsToday.map(({ lead, slots }) => (
              <Card key={lead.id} padding="md" hover onClick={() => openLead(lead)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{lead.name}</h3>
                    {lead.contactName && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{lead.contactName}</p>
                    )}
                    <div className="mt-2 space-y-1">
                      {slots.map((s, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
                          <Calendar size={14} />
                          <span className="font-medium">{formatSlotCompact(s)}</span>
                          {s.vehiclePlate && (
                            <span className="font-mono text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                              {s.vehiclePlate}
                            </span>
                          )}
                          {s.note && <span className="text-xs text-gray-500 dark:text-gray-400">— {s.note}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); openLead(lead); }}>
                    Voir
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Overdue */}
      {overdue.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-red-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">En retard ({overdue.length})</h2>
          </div>
          <div className="space-y-3">
            {overdue.map(lead => (
              <Card key={lead.id} padding="md" hover onClick={() => openLead(lead)}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{lead.name}</h3>
                    {lead.contactName && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{lead.contactName}</p>
                    )}
                    <div className="mt-2 space-y-1">
                      {lead.nextActions?.filter(a => !a.completed).map(action => (
                        <p key={action.id} className="text-sm text-red-600 dark:text-red-400">
                          • {action.text}
                          {action.dueDate && action.dueDate.includes('T') && (
                            <span className="ml-2 text-xs opacity-80">
                              {new Date(action.dueDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); openLead(lead); }}>
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">À faire aujourd'hui ({dueToday.length})</h2>
        </div>
        {dueToday.length === 0 ? (
          <Card padding="lg">
            <p className="text-center text-gray-500 dark:text-gray-400">Aucune action prévue pour aujourd'hui</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {dueToday.map(lead => (
              <Card key={lead.id} padding="md" hover onClick={() => openLead(lead)}>
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-gray-100">{lead.name}</h3>
                    {lead.contactName && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{lead.contactName}</p>
                    )}
                    <div className="mt-2 space-y-1">
                      {lead.nextActions?.filter(a => !a.completed).map(action => (
                        <p key={action.id} className="text-sm text-gray-700 dark:text-gray-300">
                          • {action.text}
                          {action.dueDate && action.dueDate.includes('T') && (
                            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                              {new Date(action.dueDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          )}
                        </p>
                      ))}
                    </div>
                  </div>
                  <Button size="sm" onClick={(e) => { e.stopPropagation(); openLead(lead); }}>
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
