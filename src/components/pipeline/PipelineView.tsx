/**
 * Pipeline Kanban with @dnd-kit/core.
 * Optimized for 100+ leads per column: zero-render drag, DragOverlay, sensor-gated.
 */

import React, { useMemo, useState, useCallback, memo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  closestCenter,
  type Active,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { Lead, StageConfig } from '../../lib/types';
import type { Tag } from '../../services/tagsService';
import { Card } from '../ui';
import { MoreVertical, Edit, Trash2, X as XIcon, Calendar } from 'lucide-react';
import { getStageIcon, getStageColorHex } from '../../lib/stageIcons';
import { useTags } from '../../hooks/useTags';
import { useAllFiches } from '../../contexts/FichesContext';
import { getNextAppointmentForLead, formatSlotCompact, countAppointmentsForLead } from '../../lib/appointments';

export interface PipelineViewProps {
  leads: Lead[];
  stages: StageConfig[];
  onUpdateStage: (leadId: string, newStage: Lead['stage']) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onViewLead?: (lead: Lead) => void;
  tagsByLead?: Map<string, Tag[]>;
}

// ---------------------------------------------------------------------------
// Lead card
// ---------------------------------------------------------------------------

interface LeadCardProps {
  lead: Lead;
  tags?: Tag[];
  isMenuOpen: boolean;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onViewLead?: (lead: Lead) => void;
  onMenuToggle: (leadId: string) => void;
}

const DraggableLeadCard = memo(function DraggableLeadCard({
  lead,
  tags,
  isMenuOpen,
  onEditLead,
  onDeleteLead,
  onViewLead,
  onMenuToggle,
}: LeadCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: { lead },
  });

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1, // original card disappears; DragOverlay renders the ghost
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={(e) => {
        // only trigger view if not currently dragging
        if (!transform) onViewLead?.(lead);
      }}
      className={`cursor-grab active:cursor-grabbing ${isMenuOpen ? 'relative z-30' : ''}`}
    >
      <LeadCardContent
        lead={lead}
        tags={tags}
        isMenuOpen={isMenuOpen}
        onEditLead={onEditLead}
        onDeleteLead={onDeleteLead}
        onMenuToggle={onMenuToggle}
      />
    </div>
  );
}, (a, b) => (
  a.lead.id === b.lead.id &&
  a.lead.name === b.lead.name &&
  a.lead.stage === b.lead.stage &&
  a.lead.contactName === b.lead.contactName &&
  a.lead.company === b.lead.company &&
  a.lead.value === b.lead.value &&
  a.isMenuOpen === b.isMenuOpen &&
  a.onEditLead === b.onEditLead &&
  a.onDeleteLead === b.onDeleteLead &&
  a.onViewLead === b.onViewLead &&
  a.onMenuToggle === b.onMenuToggle &&
  (a.tags?.length ?? 0) === (b.tags?.length ?? 0) &&
  (a.tags ?? []).every((t, i) => t.id === b.tags?.[i]?.id)
));

function LeadCardContent({
  lead,
  tags,
  isMenuOpen,
  onEditLead,
  onDeleteLead,
  onMenuToggle,
}: Omit<LeadCardProps, 'onViewLead'>) {
  const { toggleLeadTag } = useTags();
  const { fichesByLead } = useAllFiches();
  const leadFiches = fichesByLead.get(lead.id);
  const nextAppt = getNextAppointmentForLead(leadFiches);
  const totalAppts = countAppointmentsForLead(leadFiches);
  const handleRemoveTag = (e: React.MouseEvent, tag: Tag) => {
    e.stopPropagation();
    e.preventDefault();
    toggleLeadTag(lead.id, tag);
  };
  const isWon = WON_STAGE_IDS.has(lead.stage);
  const goldJewelClass = isWon
    ? [
        'relative overflow-hidden',
        'bg-gradient-to-br !from-amber-50 !via-yellow-50 !to-amber-100',
        'dark:!from-amber-900/40 dark:!via-yellow-900/30 dark:!to-amber-800/40',
        '!border-2 !border-amber-400 dark:!border-amber-500/70',
        'shadow-[0_4px_14px_-2px_rgba(251,191,36,0.45)] dark:shadow-[0_4px_14px_-2px_rgba(251,191,36,0.25)]',
      ].join(' ')
    : '';
  return (
    <Card padding="sm" className={goldJewelClass}>
      {isWon && (
        <>
          <div className="pointer-events-none absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-yellow-300/50 to-transparent dark:from-yellow-400/30 rounded-bl-full" />
          <div className="absolute top-1 right-1 text-base leading-none" title="Lead gagné">🏆</div>
        </>
      )}
      <div className="space-y-2 relative">
        <div className="flex items-start justify-between">
          <h4 className={`font-medium text-sm ${isWon ? 'text-amber-900 dark:text-amber-100' : 'text-gray-900 dark:text-gray-100'}`}>
            {lead.name}
          </h4>
          <div className="relative">
            <button
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onMenuToggle(lead.id);
              }}
              onPointerDown={(e) => e.stopPropagation()} // prevent drag start on menu click
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
                    onPointerDown={(e) => e.stopPropagation()}
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
                    onPointerDown={(e) => e.stopPropagation()}
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
        {nextAppt && (
          <div
            className="flex items-center gap-1 text-xs font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800/60 w-fit"
            title={`${totalAppts} rendez-vous au total sur ce lead`}
          >
            <Calendar size={11} />
            <span>{formatSlotCompact(nextAppt)}</span>
            {totalAppts > 1 && (
              <span className="ml-0.5 px-1 bg-blue-200 dark:bg-blue-800 text-[10px] rounded-full">
                +{totalAppts - 1}
              </span>
            )}
          </div>
        )}
        {tags && tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {tags.map((t) => (
              <span
                key={t.id}
                style={{ backgroundColor: `${t.color}25`, color: t.color, borderColor: `${t.color}60` }}
                className="group/chip inline-flex items-center gap-0.5 pl-1.5 pr-0.5 py-0.5 text-[10px] font-medium rounded-full border leading-none"
                title={t.name}
              >
                <span>{t.name}</span>
                <button
                  type="button"
                  onClick={(e) => handleRemoveTag(e, t)}
                  onPointerDown={(e) => e.stopPropagation()}
                  className="p-0.5 rounded-full opacity-60 hover:opacity-100 hover:bg-black/10 dark:hover:bg-white/10"
                  title={`Retirer "${t.name}" de ce lead`}
                >
                  <XIcon size={9} />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Column
// ---------------------------------------------------------------------------

interface ColumnProps {
  stage: StageConfig;
  leads: Lead[];
  isActive: boolean;
  winGlow?: boolean;
  openMenuId: string | null;
  tagsByLead?: Map<string, Tag[]>;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onViewLead?: (lead: Lead) => void;
  onMenuToggle: (leadId: string) => void;
}

const Column = memo(function Column({
  stage, leads, isActive, winGlow, openMenuId, tagsByLead, onEditLead, onDeleteLead, onViewLead, onMenuToggle,
}: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: stage.id });
  const color = getStageColorHex(stage.color);
  const Icon = getStageIcon(stage.icon);
  const isWonStage = WON_STAGE_IDS.has(stage.id);

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-80">
      <div
        className={`rounded-lg p-4 ${
          winGlow
            ? 'bg-yellow-50 dark:bg-yellow-900/40 border-2 border-yellow-400 dark:border-yellow-500 shadow-[0_0_24px_rgba(234,179,8,0.5)] animate-pulse'
            : isActive
            ? 'bg-blue-100 dark:bg-blue-900/40 border-2 border-blue-400 dark:border-blue-500'
            : isWonStage
            ? 'bg-emerald-50 dark:bg-emerald-900/30 border-2 border-emerald-300 dark:border-emerald-700/60'
            : 'bg-gray-100 dark:bg-gray-900 border-2 border-transparent dark:border-gray-800'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <Icon size={16} style={{ color }} />
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 truncate">
              {stage.label}
            </h3>
          </div>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded-full shrink-0"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {leads.length}
          </span>
        </div>

        <div className="space-y-3 min-h-[100px]">
          {leads.map((lead) => (
            <DraggableLeadCard
              key={lead.id}
              lead={lead}
              tags={tagsByLead?.get(lead.id)}
              isMenuOpen={openMenuId === lead.id}
              onEditLead={onEditLead}
              onDeleteLead={onDeleteLead}
              onViewLead={onViewLead}
              onMenuToggle={onMenuToggle}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const WON_STAGE_IDS = new Set<string>(['won', 'closed_won']);

export const PipelineView = memo(function PipelineView({
  leads, stages, onUpdateStage, onEditLead, onDeleteLead, onViewLead, tagsByLead,
}: PipelineViewProps) {
  const [active, setActive] = useState<Active | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [winGlowStageId, setWinGlowStageId] = useState<string | null>(null);

  const leadsByStage = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    for (const s of stages) map[s.id] = [];
    for (const l of leads) {
      if (map[l.stage]) map[l.stage].push(l);
    }
    return map;
  }, [leads, stages]);

  // 8px activation distance: click does NOT trigger drag, but a tiny move does.
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActive(e.active);
  }, []);

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setActive(null);
    const overId = e.over?.id;
    if (!overId) return;
    const leadId = String(e.active.id);
    const newStage = String(overId) as Lead['stage'];
    const lead = leads.find((l) => l.id === leadId);
    if (!lead || lead.stage === newStage) return;
    onUpdateStage(leadId, newStage);
    if (WON_STAGE_IDS.has(newStage) && !WON_STAGE_IDS.has(lead.stage)) {
      setWinGlowStageId(newStage);
      setTimeout(() => setWinGlowStageId(null), 1500);
    }
  }, [leads, onUpdateStage]);

  const handleDragCancel = useCallback(() => setActive(null), []);

  const handleMenuToggle = useCallback((leadId: string) => {
    setOpenMenuId((prev) => (prev === leadId ? null : leadId));
  }, []);

  const activeLead = active ? leads.find((l) => l.id === active.id) ?? null : null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Pipeline</h1>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <Column
              key={stage.id}
              stage={stage}
              leads={leadsByStage[stage.id] ?? []}
              isActive={false}
              winGlow={winGlowStageId === stage.id}
              openMenuId={openMenuId}
              tagsByLead={tagsByLead}
              onEditLead={onEditLead}
              onDeleteLead={onDeleteLead}
              onViewLead={onViewLead}
              onMenuToggle={handleMenuToggle}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activeLead ? (
            <div className="w-80 opacity-90 rotate-1 shadow-2xl">
              <LeadCardContent
                lead={activeLead}
                tags={tagsByLead?.get(activeLead.id)}
                isMenuOpen={false}
                onEditLead={() => void 0}
                onDeleteLead={() => void 0}
                onMenuToggle={() => void 0}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
});
