/**
 * Table view with sortable columns + multi-select for bulk actions.
 */

import React, { useMemo, useRef, useState, useEffect } from 'react';
import type { Lead } from '../../lib/types';
import type { Tag } from '../../services/tagsService';
import { Button, Badge } from '../ui';
import { Edit, Trash2, ArrowUpDown, X as XIcon } from 'lucide-react';
import { sortLeads, formatDate, formatCurrency } from '../../lib/utils';
import { useTags } from '../../hooks/useTags';

export interface TableViewProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onUpdateStage: (leadId: string, newStage: Lead['stage']) => void;
  onViewLead?: (lead: Lead) => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  tagsByLead?: Map<string, Tag[]>;
}

export function TableView({
  leads,
  onEditLead,
  onDeleteLead,
  onViewLead,
  selectedIds,
  onSelectionChange,
  tagsByLead,
}: TableViewProps) {
  const { toggleLeadTag } = useTags();
  const [sortField, setSortField] = useState<keyof Lead>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const sortedLeads = useMemo(
    () => sortLeads(leads, sortField, sortDirection),
    [leads, sortField, sortDirection]
  );

  const allSelected = sortedLeads.length > 0 && sortedLeads.every((l) => selectedIds.has(l.id));
  const someSelected = sortedLeads.some((l) => selectedIds.has(l.id));

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected]);

  const handleSort = (field: keyof Lead) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleRow = (leadId: string) => {
    const next = new Set(selectedIds);
    if (next.has(leadId)) next.delete(leadId);
    else next.add(leadId);
    onSelectionChange(next);
  };

  const toggleAll = () => {
    if (allSelected) {
      const next = new Set(selectedIds);
      sortedLeads.forEach((l) => next.delete(l.id));
      onSelectionChange(next);
    } else {
      const next = new Set(selectedIds);
      sortedLeads.forEach((l) => next.add(l.id));
      onSelectionChange(next);
    }
  };

  return (
    <div className="p-6 pb-32">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Vue Tableau</h1>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow dark:shadow-none dark:border dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    ref={headerCheckboxRef}
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    aria-label="Tout sélectionner"
                  />
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('name')}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Nom <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Contact
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Entreprise
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                  Tags
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('stage')}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Étape <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('value')}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Valeur <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-4 py-3 text-left">
                  <button
                    onClick={() => handleSort('createdAt')}
                    className="flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase hover:text-gray-900 dark:hover:text-gray-100"
                  >
                    Créé le <ArrowUpDown size={12} />
                  </button>
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {sortedLeads.map(lead => {
                const checked = selectedIds.has(lead.id);
                return (
                  <tr
                    key={lead.id}
                    className={`${checked ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'} cursor-pointer`}
                    onClick={() => onViewLead?.(lead)}
                  >
                    <td className="px-4 py-3" onClick={(e) => { e.stopPropagation(); toggleRow(lead.id); }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRow(lead.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        aria-label={`Sélectionner ${lead.name}`}
                      />
                    </td>
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">{lead.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {lead.contactName || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">
                      {lead.company && lead.company !== lead.name ? lead.company : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {(() => {
                        const tags = tagsByLead?.get(lead.id) ?? [];
                        if (tags.length === 0) return <span className="text-gray-400 dark:text-gray-500 text-xs">—</span>;
                        return (
                          <div className="flex flex-wrap gap-1" onClick={(e) => e.stopPropagation()}>
                            {tags.map((t) => (
                              <span
                                key={t.id}
                                style={{ backgroundColor: `${t.color}25`, color: t.color, borderColor: `${t.color}60` }}
                                className="inline-flex items-center gap-0.5 pl-1.5 pr-0.5 py-0.5 text-[10px] font-medium rounded-full border leading-none"
                                title={t.name}
                              >
                                <span>{t.name}</span>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); toggleLeadTag(lead.id, t); }}
                                  className="p-0.5 rounded-full opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"
                                  title={`Retirer "${t.name}" de ce lead`}
                                >
                                  <XIcon size={9} />
                                </button>
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="blue" size="sm">
                        {lead.stage}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
                      {lead.value ? formatCurrency(lead.value) : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Edit size={14} />}
                          onClick={(e) => { e.stopPropagation(); onEditLead(lead); }}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          icon={<Trash2 size={14} />}
                          onClick={(e) => { e.stopPropagation(); onDeleteLead(lead.id); }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
