/**
 * Table view with sortable columns
 */

import { useState } from 'react';
import type { Lead } from '../../lib/types';
import { Button, Badge } from '../ui';
import { Edit, Trash2, ArrowUpDown } from 'lucide-react';
import { sortLeads, formatDate, formatCurrency } from '../../lib/utils';

export interface TableViewProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onUpdateStage: (leadId: string, newStage: Lead['stage']) => void;
}

export function TableView({ leads, onEditLead, onDeleteLead }: TableViewProps) {
  const [sortField, setSortField] = useState<keyof Lead>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const sortedLeads = sortLeads(leads, sortField, sortDirection);

  const handleSort = (field: keyof Lead) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Vue Tableau</h1>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase hover:text-gray-900"
                  >
                    Nom <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                  Entreprise
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('stage')}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase hover:text-gray-900"
                  >
                    Étape <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('value')}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase hover:text-gray-900"
                  >
                    Valeur <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-600 uppercase hover:text-gray-900"
                  >
                    Créé le <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {sortedLeads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{lead.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {lead.contactName || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {lead.company || '-'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="blue" size="sm">
                      {lead.stage}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                    {lead.value ? formatCurrency(lead.value) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {formatDate(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Edit size={14} />}
                        onClick={() => onEditLead(lead)}
                        aria-label="Modifier le lead"
                        title="Modifier"
                      />
                      <Button
                        size="sm"
                        variant="ghost"
                        icon={<Trash2 size={14} />}
                        onClick={() => onDeleteLead(lead.id)}
                        aria-label="Supprimer le lead"
                        title="Supprimer"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
