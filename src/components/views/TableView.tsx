/**
 * Vue Tableau — refonte Phase 5.
 *
 * Sticky header, zebra stripes subtiles, toutes colonnes triables avec
 * indicateur ascendant/descendant, ligne hover teinte, pagination basse
 * (50 lignes par défaut, configurable 25/50/100).
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { Lead } from '../../lib/types';
import type { Tag } from '../../services/tagsService';
import { Badge, Tooltip } from '../ui';
import {
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Calendar,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { sortLeads, formatDate, formatCurrency } from '../../lib/utils';
import { useAllFiches } from '../../contexts/FichesContext';
import { getAllAppointmentsForLead, formatSlotCompact, isSlotPast } from '../../lib/appointments';
import { cn } from '../../lib/utils';

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

type SortField = 'name' | 'contactName' | 'company' | 'stage' | 'value' | 'createdAt';

interface Column {
  id: SortField | 'select' | 'tags' | 'appointments' | 'actions';
  label: string;
  sortable: boolean;
  align?: 'left' | 'right' | 'center';
  width?: string;
}

const COLUMNS: Column[] = [
  { id: 'select', label: '', sortable: false, width: '40px' },
  { id: 'name', label: 'Nom', sortable: true },
  { id: 'contactName', label: 'Contact', sortable: true },
  { id: 'company', label: 'Entreprise', sortable: true },
  { id: 'tags', label: 'Tags', sortable: false },
  { id: 'appointments', label: 'RDV', sortable: false },
  { id: 'stage', label: 'Étape', sortable: true },
  { id: 'value', label: 'Valeur', sortable: true, align: 'right' },
  { id: 'createdAt', label: 'Créé le', sortable: true },
  { id: 'actions', label: '', sortable: false, align: 'right', width: '90px' },
];

const PAGE_SIZES = [25, 50, 100];

export function TableView({
  leads,
  onEditLead,
  onDeleteLead,
  onViewLead,
  selectedIds,
  onSelectionChange,
  tagsByLead,
}: TableViewProps) {
  const { fichesByLead } = useAllFiches();
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [pageSize, setPageSize] = useState(50);
  const [page, setPage] = useState(0);
  const headerCheckboxRef = useRef<HTMLInputElement>(null);

  const sortedLeads = useMemo(
    () => sortLeads(leads, sortField as keyof Lead, sortDirection),
    [leads, sortField, sortDirection]
  );

  // Reset to first page when filters change the leads set.
  useEffect(() => {
    setPage(0);
  }, [leads.length, pageSize]);

  const pageCount = Math.max(1, Math.ceil(sortedLeads.length / pageSize));
  const effectivePage = Math.min(page, pageCount - 1);
  const pagedLeads = useMemo(
    () => sortedLeads.slice(effectivePage * pageSize, (effectivePage + 1) * pageSize),
    [sortedLeads, effectivePage, pageSize]
  );

  const allSelected = pagedLeads.length > 0 && pagedLeads.every((l) => selectedIds.has(l.id));
  const someSelected = pagedLeads.some((l) => selectedIds.has(l.id));

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected]);

  const handleSort = (field: SortField) => {
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

  const toggleAllOnPage = () => {
    const next = new Set(selectedIds);
    if (allSelected) {
      pagedLeads.forEach((l) => next.delete(l.id));
    } else {
      pagedLeads.forEach((l) => next.add(l.id));
    }
    onSelectionChange(next);
  };

  const firstRowIndex = sortedLeads.length === 0 ? 0 : effectivePage * pageSize + 1;
  const lastRowIndex = Math.min(sortedLeads.length, (effectivePage + 1) * pageSize);

  return (
    <div className="p-4 pb-20 h-full flex flex-col min-h-0">
      <div className="bg-surface border border-border rounded-md shadow-xs flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Scrollable table body */}
        <div className="flex-1 overflow-auto min-h-0">
          <table className="w-full border-collapse">
            <thead className="sticky top-0 z-sticky bg-surface-muted border-b border-border">
              <tr>
                {COLUMNS.map((col) => (
                  <th
                    key={col.id}
                    scope="col"
                    style={col.width ? { width: col.width } : undefined}
                    className={cn(
                      'px-3 h-10 text-caption font-semibold text-[color:var(--color-text-muted)] whitespace-nowrap',
                      col.align === 'right' ? 'text-right' : 'text-left'
                    )}
                  >
                    {col.id === 'select' ? (
                      <input
                        ref={headerCheckboxRef}
                        type="checkbox"
                        checked={allSelected}
                        onChange={toggleAllOnPage}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer block mx-auto"
                        aria-label="Sélectionner la page"
                      />
                    ) : col.sortable ? (
                      <SortButton
                        field={col.id as SortField}
                        label={col.label}
                        currentField={sortField}
                        direction={sortDirection}
                        onSort={handleSort}
                        align={col.align}
                      />
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedLeads.length === 0 && (
                <tr>
                  <td
                    colSpan={COLUMNS.length}
                    className="px-4 py-12 text-center text-[13px] text-[color:var(--color-text-subtle)]"
                  >
                    Aucun lead à afficher
                  </td>
                </tr>
              )}
              {pagedLeads.map((lead, rowIdx) => {
                const checked = selectedIds.has(lead.id);
                const tags = tagsByLead?.get(lead.id) ?? [];
                const appts = getAllAppointmentsForLead(fichesByLead.get(lead.id));
                return (
                  <tr
                    key={lead.id}
                    onClick={() => onViewLead?.(lead)}
                    className={cn(
                      'border-b border-border-subtle transition-colors cursor-pointer',
                      checked
                        ? 'bg-primary-soft/30 hover:bg-primary-soft/50'
                        : rowIdx % 2 === 0
                        ? 'bg-surface hover:bg-surface-2'
                        : 'bg-surface-muted hover:bg-surface-2'
                    )}
                  >
                    <td
                      className="px-3 py-2 text-center align-middle"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleRow(lead.id);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleRow(lead.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="w-4 h-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                        aria-label={`Sélectionner ${lead.name}`}
                      />
                    </td>
                    <td className="px-3 py-2 text-[13px] font-medium text-[color:var(--color-text)] max-w-[240px] truncate">
                      {lead.name}
                    </td>
                    <td className="px-3 py-2 text-[13px] text-[color:var(--color-text-body)] max-w-[180px] truncate">
                      {lead.contactName || <span className="text-[color:var(--color-text-subtle)]">—</span>}
                    </td>
                    <td className="px-3 py-2 text-[13px] text-[color:var(--color-text-body)] max-w-[200px] truncate">
                      {lead.company && lead.company !== lead.name ? (
                        lead.company
                      ) : (
                        <span className="text-[color:var(--color-text-subtle)]">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {tags.length === 0 ? (
                        <span className="text-[color:var(--color-text-subtle)] text-[12px]">—</span>
                      ) : (
                        <div className="flex flex-wrap gap-1 max-w-[180px]">
                          {tags.slice(0, 2).map((t) => (
                            <span
                              key={t.id}
                              style={{
                                backgroundColor: `${t.color}1f`,
                                color: t.color,
                              }}
                              className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded-full whitespace-nowrap"
                              title={t.name}
                            >
                              {t.name}
                            </span>
                          ))}
                          {tags.length > 2 && (
                            <span
                              className="chip chip-neutral !text-[10px] !h-5"
                              title={tags.slice(2).map((t) => t.name).join(', ')}
                            >
                              +{tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {appts.length === 0 ? (
                        <span className="text-[color:var(--color-text-subtle)] text-[12px]">—</span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {appts.slice(0, 2).map((s, i) => {
                            const past = isSlotPast(s);
                            return (
                              <div
                                key={i}
                                className={cn(
                                  'inline-flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-sm w-fit',
                                  past
                                    ? 'text-[color:var(--color-text-subtle)] bg-surface-2 line-through'
                                    : 'text-primary-soft-text bg-primary-soft'
                                )}
                                title={s.note || undefined}
                              >
                                <Calendar size={10} />
                                <span>{formatSlotCompact(s)}</span>
                                {s.vehiclePlate && (
                                  <span className="font-mono text-[9px] px-1 bg-white/80 dark:bg-black/30 rounded text-[color:var(--color-text-body)]">
                                    {s.vehiclePlate}
                                  </span>
                                )}
                              </div>
                            );
                          })}
                          {appts.length > 2 && (
                            <span className="text-[10px] text-[color:var(--color-text-subtle)]">
                              +{appts.length - 2} autre{appts.length - 2 > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Badge tone="primary" size="sm">{lead.stage}</Badge>
                    </td>
                    <td className="px-3 py-2 text-right text-[13px] font-semibold text-[color:var(--color-text)] tabular-nums">
                      {lead.value ? formatCurrency(lead.value) : <span className="text-[color:var(--color-text-subtle)] font-normal">—</span>}
                    </td>
                    <td className="px-3 py-2 text-[13px] text-[color:var(--color-text-muted)] whitespace-nowrap">
                      {formatDate(lead.createdAt)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-0.5">
                        <Tooltip label="Modifier" side="left">
                          <button
                            type="button"
                            className="p-1.5 rounded-sm text-[color:var(--color-text-subtle)] hover:bg-surface-2 hover:text-[color:var(--color-text)]"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditLead(lead);
                            }}
                            aria-label="Modifier"
                          >
                            <Edit size={13} />
                          </button>
                        </Tooltip>
                        <Tooltip label="Supprimer" side="left">
                          <button
                            type="button"
                            className="p-1.5 rounded-sm text-[color:var(--color-text-subtle)] hover:bg-danger-soft hover:text-danger"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm(`Supprimer « ${lead.name} » ?`)) {
                                onDeleteLead(lead.id);
                              }
                            }}
                            aria-label="Supprimer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="shrink-0 flex items-center justify-between gap-3 border-t border-border px-3 h-11 bg-surface-muted">
          <div className="flex items-center gap-2 text-[12px] text-[color:var(--color-text-muted)]">
            <label htmlFor="page-size" className="hidden sm:inline">
              Afficher
            </label>
            <select
              id="page-size"
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="h-7 px-1.5 text-[12px] rounded-sm bg-surface border border-border text-[color:var(--color-text)] focus:outline-none focus:border-primary focus:shadow-focus"
            >
              {PAGE_SIZES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <span className="hidden sm:inline">par page</span>
          </div>

          <div className="flex items-center gap-3 text-[12px] text-[color:var(--color-text-muted)]">
            <span>
              {firstRowIndex}–{lastRowIndex} / {sortedLeads.length}
            </span>
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={effectivePage === 0}
                className="h-7 w-7 flex items-center justify-center rounded-sm text-[color:var(--color-text-muted)] hover:bg-surface hover:text-[color:var(--color-text)] disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Page précédente"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="px-2 text-[color:var(--color-text)] font-medium">
                {effectivePage + 1} / {pageCount}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
                disabled={effectivePage >= pageCount - 1}
                className="h-7 w-7 flex items-center justify-center rounded-sm text-[color:var(--color-text-muted)] hover:bg-surface hover:text-[color:var(--color-text)] disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Page suivante"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sort button
// ---------------------------------------------------------------------------

function SortButton({
  field,
  label,
  currentField,
  direction,
  onSort,
  align,
}: {
  field: SortField;
  label: string;
  currentField: SortField;
  direction: 'asc' | 'desc';
  onSort: (field: SortField) => void;
  align?: 'left' | 'right' | 'center';
}) {
  const active = field === currentField;
  const Icon = !active ? ArrowUpDown : direction === 'asc' ? ArrowUp : ArrowDown;
  return (
    <button
      type="button"
      onClick={() => onSort(field)}
      className={cn(
        'flex items-center gap-1 text-caption font-semibold hover:text-[color:var(--color-text)] transition-colors',
        active ? 'text-[color:var(--color-text)]' : 'text-[color:var(--color-text-muted)]',
        align === 'right' ? 'justify-end w-full' : ''
      )}
    >
      {align === 'right' && <Icon size={11} className={active ? 'opacity-100' : 'opacity-50'} />}
      <span>{label}</span>
      {align !== 'right' && <Icon size={11} className={active ? 'opacity-100' : 'opacity-50'} />}
    </button>
  );
}
