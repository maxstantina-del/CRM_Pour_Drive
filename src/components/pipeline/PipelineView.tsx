/**
 * Pipeline Kanban — refonte visuelle Phase 3.
 *
 * Cartes épurées : titre (company/name) bold, contact en caption, 1 tag
 * primaire + pastille +N, icônes phone/email discrètes à droite, barre d'état
 * colorée en bas. Colonnes avec compteur + valeur totale en caption.
 * Drop zone avec feedback visuel quand on survole. Menu ⋮ toujours visible.
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
import type { Lead, NextAction, StageConfig } from '../../lib/types';
import type { Tag } from '../../services/tagsService';
import { MoreVertical, Edit, Trash2, Calendar, Phone, Mail, Paperclip, Bell } from 'lucide-react';
import { getStageIcon, getStageColorHex } from '../../lib/stageIcons';
import { useAllFiches } from '../../contexts/FichesContext';
import { getAllAppointmentsForLead, formatSlotCompact, isSlotPast } from '../../lib/appointments';
import { cn } from '../../lib/utils';

export interface PipelineViewProps {
  leads: Lead[];
  stages: StageConfig[];
  onUpdateStage: (leadId: string, newStage: Lead['stage']) => void;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onViewLead?: (lead: Lead) => void;
  tagsByLead?: Map<string, Tag[]>;
}

const WON_STAGE_IDS = new Set<string>(['won', 'closed_won']);

function formatCurrency(n: number): string {
  return new Intl.NumberFormat('fr-FR', {
    maximumFractionDigits: 0,
  }).format(n) + ' €';
}

type ActionUrgency = 'overdue' | 'today' | 'upcoming' | 'someday';

interface NextActionInfo {
  action: NextAction;
  urgency: ActionUrgency;
  relativeLabel: string;
  extra: number;
}

/**
 * Returns the most urgent pending next action for the lead, with a
 * relative label ("en retard", "aujourd'hui", "demain", "dans 3j", …)
 * and an urgency tone for coloring.
 */
function getPendingAction(lead: Lead): NextActionInfo | null {
  const pending = (lead.nextActions ?? []).filter((a) => !a.completed);
  if (pending.length === 0) return null;

  // Sort : entries with dueDate first (ascending), then those without.
  const sorted = [...pending].sort((a, b) => {
    if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;
    return 0;
  });
  const action = sorted[0];

  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let urgency: ActionUrgency = 'someday';
  let relativeLabel = action.text;

  if (action.dueDate) {
    const when = new Date(action.dueDate);
    if (!isNaN(when.getTime())) {
      const whenDay = new Date(when);
      whenDay.setHours(0, 0, 0, 0);
      const diffDays = Math.round((whenDay.getTime() - today.getTime()) / (24 * 3600 * 1000));
      if (diffDays < 0) {
        urgency = 'overdue';
        relativeLabel = diffDays === -1 ? 'hier' : `en retard ${-diffDays}j`;
      } else if (diffDays === 0) {
        urgency = 'today';
        if (action.dueDate.includes('T')) {
          const hh = when.getHours().toString().padStart(2, '0');
          const mm = when.getMinutes().toString().padStart(2, '0');
          relativeLabel = `aujourd'hui ${hh}h${mm === '00' ? '' : mm}`;
        } else {
          relativeLabel = "aujourd'hui";
        }
      } else if (diffDays === 1) {
        urgency = 'upcoming';
        relativeLabel = 'demain';
      } else if (diffDays <= 7) {
        urgency = 'upcoming';
        relativeLabel = `dans ${diffDays}j`;
      } else {
        urgency = 'upcoming';
        relativeLabel = when.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      }
    }
  }

  return {
    action,
    urgency,
    relativeLabel,
    extra: pending.length - 1,
  };
}

// ---------------------------------------------------------------------------
// Lead card
// ---------------------------------------------------------------------------

interface LeadCardProps {
  lead: Lead;
  tags?: Tag[];
  stageColor: string;
  isMenuOpen: boolean;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onViewLead?: (lead: Lead) => void;
  onMenuToggle: (leadId: string) => void;
}

const DraggableLeadCard = memo(
  function DraggableLeadCard({
    lead,
    tags,
    stageColor,
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
      opacity: isDragging ? 0 : 1,
    };

    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={() => {
          if (!transform) onViewLead?.(lead);
        }}
        className={cn('cursor-grab active:cursor-grabbing', isMenuOpen && 'relative z-30')}
      >
        <LeadCardContent
          lead={lead}
          tags={tags}
          stageColor={stageColor}
          isMenuOpen={isMenuOpen}
          onEditLead={onEditLead}
          onDeleteLead={onDeleteLead}
          onMenuToggle={onMenuToggle}
        />
      </div>
    );
  },
  (a, b) =>
    a.lead.id === b.lead.id &&
    a.lead.name === b.lead.name &&
    a.lead.stage === b.lead.stage &&
    a.lead.contactName === b.lead.contactName &&
    a.lead.company === b.lead.company &&
    a.lead.value === b.lead.value &&
    a.lead.phone === b.lead.phone &&
    a.lead.email === b.lead.email &&
    a.lead.nextActions === b.lead.nextActions &&
    a.stageColor === b.stageColor &&
    a.isMenuOpen === b.isMenuOpen &&
    a.onEditLead === b.onEditLead &&
    a.onDeleteLead === b.onDeleteLead &&
    a.onViewLead === b.onViewLead &&
    a.onMenuToggle === b.onMenuToggle &&
    (a.tags?.length ?? 0) === (b.tags?.length ?? 0) &&
    (a.tags ?? []).every((t, i) => t.id === b.tags?.[i]?.id)
);

function LeadCardContent({
  lead,
  tags,
  stageColor,
  isMenuOpen,
  onEditLead,
  onDeleteLead,
  onMenuToggle,
}: Omit<LeadCardProps, 'onViewLead'>) {
  const { fichesByLead } = useAllFiches();
  const leadFiches = fichesByLead.get(lead.id);
  const allAppts = getAllAppointmentsForLead(leadFiches);
  const isWon = WON_STAGE_IDS.has(lead.stage);

  // Prefer company as primary heading, fallback to lead.name. Contact is the subline.
  const primary = lead.company || lead.name;
  const secondary = lead.company && lead.company !== lead.name ? lead.name : null;
  const contact = lead.contactName;

  const firstTag = tags?.[0];
  const extraTagCount = tags ? Math.max(0, tags.length - 1) : 0;
  const hasAttachments = false; // placeholder — future: wire to attachments context
  const pendingAction = getPendingAction(lead);

  return (
    <div
      className={cn(
        'group/card relative rounded-md border transition-all duration-150',
        'bg-surface shadow-xs hover:shadow-sm hover:border-border-strong',
        isWon
          ? 'border-[color:#fbbf24] bg-gradient-to-br from-amber-50/60 to-yellow-50/40 dark:from-amber-900/20 dark:to-yellow-900/10'
          : 'border-border'
      )}
    >
      {isWon && (
        <span className="absolute top-1 right-7 text-sm pointer-events-none z-10" title="Lead gagné">
          🏆
        </span>
      )}

      <div className="p-3 space-y-1.5">
        {/* Title + menu */}
        <div className="flex items-start gap-1.5">
          <div className="min-w-0 flex-1">
            <h4 className="text-[13px] font-semibold text-[color:var(--color-text)] leading-tight truncate">
              {primary}
            </h4>
            {contact && (
              <p className="text-[11px] text-[color:var(--color-text-muted)] mt-0.5 truncate">
                {contact}
              </p>
            )}
            {secondary && !contact && (
              <p className="text-[11px] text-[color:var(--color-text-muted)] mt-0.5 truncate">
                {secondary}
              </p>
            )}
          </div>
          <button
            type="button"
            className="shrink-0 p-1 rounded-sm text-[color:var(--color-text-subtle)] hover:bg-surface-2 hover:text-[color:var(--color-text)] transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onMenuToggle(lead.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            title="Actions"
            aria-label="Actions"
          >
            <MoreVertical size={14} />
          </button>
        </div>

        {/* Appointments */}
        {allAppts.length > 0 && (
          <div className="flex flex-col gap-1">
            {allAppts.slice(0, 2).map((s, i) => {
              const past = isSlotPast(s);
              return (
                <div
                  key={i}
                  className={cn(
                    'flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-sm border w-fit max-w-full',
                    past
                      ? 'text-[color:var(--color-text-subtle)] bg-surface-2 border-border line-through'
                      : 'text-primary-soft-text bg-primary-soft border-transparent'
                  )}
                  title={s.note || undefined}
                >
                  <Calendar size={10} className="shrink-0" />
                  <span className="truncate">{formatSlotCompact(s)}</span>
                  {s.vehiclePlate && (
                    <span className="font-mono text-[9px] px-1 bg-white/80 dark:bg-black/30 rounded text-[color:var(--color-text-body)]">
                      {s.vehiclePlate}
                    </span>
                  )}
                </div>
              );
            })}
            {allAppts.length > 2 && (
              <span className="text-[10px] text-[color:var(--color-text-subtle)] pl-1">
                +{allAppts.length - 2} autre{allAppts.length - 2 > 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}

        {/* Pending next action — the task to do, without opening the lead */}
        {pendingAction && (
          <div
            className={cn(
              'flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded-sm border w-fit max-w-full',
              pendingAction.urgency === 'overdue'
                ? 'text-danger-soft-text bg-danger-soft border-transparent'
                : pendingAction.urgency === 'today'
                ? 'text-warning-soft-text bg-warning-soft border-transparent'
                : pendingAction.urgency === 'upcoming'
                ? 'text-[color:var(--color-text-body)] bg-surface-2 border-border'
                : 'text-[color:var(--color-text-muted)] bg-surface-2 border-border'
            )}
            title={`${pendingAction.action.text}${pendingAction.action.dueDate ? ' — ' + pendingAction.relativeLabel : ''}`}
          >
            <Bell size={10} className="shrink-0" />
            <span className="truncate">{pendingAction.action.text}</span>
            {pendingAction.action.dueDate && (
              <span className="shrink-0 opacity-80">· {pendingAction.relativeLabel}</span>
            )}
            {pendingAction.extra > 0 && (
              <span className="shrink-0 text-[9px] px-1 bg-white/80 dark:bg-black/30 rounded text-[color:var(--color-text-body)]">
                +{pendingAction.extra}
              </span>
            )}
          </div>
        )}

        {/* Footer meta : valeur + contact icons + tag */}
        <div className="flex items-center gap-2 pt-0.5">
          <div className="flex items-center gap-1 text-[color:var(--color-text-subtle)]">
            {lead.phone && <Phone size={11} aria-label="Téléphone" />}
            {lead.email && <Mail size={11} aria-label="Email" />}
            {hasAttachments && <Paperclip size={11} aria-label="Pièces jointes" />}
          </div>
          {lead.value ? (
            <span className="text-[11px] font-semibold text-[color:var(--color-text-body)] ml-auto">
              {formatCurrency(lead.value)}
            </span>
          ) : null}
        </div>

        {firstTag && (
          <div className="flex items-center gap-1 flex-wrap">
            <span
              className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium leading-none whitespace-nowrap"
              style={{ backgroundColor: `${firstTag.color}1f`, color: firstTag.color }}
              title={tags && tags.length > 1 ? tags.map((t) => t.name).join(', ') : firstTag.name}
            >
              {firstTag.name}
            </span>
            {extraTagCount > 0 && (
              <span
                className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium leading-none bg-surface-2 text-[color:var(--color-text-muted)] whitespace-nowrap"
                title={tags?.slice(1).map((t) => t.name).join(', ')}
              >
                +{extraTagCount}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Stage color accent bar — rounded-l so it sits inside the card corners */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[3px] rounded-l-md"
        style={{ backgroundColor: stageColor }}
      />

      {/* Menu dropdown */}
      {isMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={(e) => {
              // Stop propagation so the outer card onClick (opens the drawer)
              // n'est pas déclenchée quand on clique dehors pour fermer le menu.
              e.stopPropagation();
              onMenuToggle(lead.id);
            }}
            onPointerDown={(e) => e.stopPropagation()}
          />
          <div className="absolute right-2 top-9 z-40 w-40 bg-surface border border-border rounded-md shadow-md overflow-hidden animate-fade-in">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onEditLead(lead);
                onMenuToggle(lead.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 text-left text-[13px] text-[color:var(--color-text-body)] hover:bg-surface-2 flex items-center gap-2"
            >
              <Edit size={13} />
              Modifier
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Supprimer « ${lead.name} » ?`)) {
                  onDeleteLead(lead.id);
                }
                onMenuToggle(lead.id);
              }}
              onPointerDown={(e) => e.stopPropagation()}
              className="w-full px-3 py-2 text-left text-[13px] text-danger hover:bg-danger-soft flex items-center gap-2"
            >
              <Trash2 size={13} />
              Supprimer
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Column
// ---------------------------------------------------------------------------

interface ColumnProps {
  stage: StageConfig;
  leads: Lead[];
  winGlow?: boolean;
  openMenuId: string | null;
  tagsByLead?: Map<string, Tag[]>;
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onViewLead?: (lead: Lead) => void;
  onMenuToggle: (leadId: string) => void;
}

const Column = memo(function Column({
  stage, leads, winGlow, openMenuId, tagsByLead, onEditLead, onDeleteLead, onViewLead, onMenuToggle,
}: ColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage.id });
  const color = getStageColorHex(stage.color);
  const Icon = getStageIcon(stage.icon);
  const isWonStage = WON_STAGE_IDS.has(stage.id);
  const totalValue = useMemo(
    () => leads.reduce((acc, l) => acc + (l.value ?? 0), 0),
    [leads]
  );

  return (
    <div className="flex-shrink-0 w-[304px] h-full flex flex-col">
      <div
        ref={setNodeRef}
        className={cn(
          'rounded-lg flex-1 flex flex-col min-h-0 border transition-colors duration-150',
          winGlow
            ? 'bg-yellow-50 dark:bg-yellow-900/30 border-yellow-400 shadow-[0_0_24px_rgba(234,179,8,0.4)]'
            : isOver
            ? 'bg-primary-soft border-primary'
            : isWonStage
            ? 'bg-success-soft/60 border-[color:var(--color-success-soft-text)]/30'
            : 'bg-surface-2 border-transparent'
        )}
      >
        {/* Column header */}
        <div className="flex items-start justify-between gap-2 px-3 pt-3 pb-2 flex-shrink-0 border-b border-border-subtle">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="shrink-0 w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: color }}
              aria-hidden
            />
            <Icon size={14} style={{ color }} className="shrink-0" />
            <h3 className="text-[13px] font-semibold text-[color:var(--color-text)] truncate">
              {stage.label}
            </h3>
            <span className="chip chip-neutral !py-0 !h-5 text-[11px] font-semibold">
              {leads.length}
            </span>
          </div>
        </div>

        {/* Total value caption */}
        {totalValue > 0 && (
          <div className="px-3 pt-1.5 pb-1 text-caption text-[color:var(--color-text-muted)]">
            {formatCurrency(totalValue)}
          </div>
        )}

        {/* Cards */}
        <div className="space-y-2 flex-1 overflow-y-auto min-h-[100px] px-2 pb-2 pt-1.5">
          {leads.map((lead) => (
            <DraggableLeadCard
              key={lead.id}
              lead={lead}
              tags={tagsByLead?.get(lead.id)}
              stageColor={color}
              isMenuOpen={openMenuId === lead.id}
              onEditLead={onEditLead}
              onDeleteLead={onDeleteLead}
              onViewLead={onViewLead}
              onMenuToggle={onMenuToggle}
            />
          ))}
          {leads.length === 0 && (
            <div
              className={cn(
                'flex items-center justify-center rounded-md border border-dashed h-20 text-[11px] transition-colors',
                isOver
                  ? 'border-primary bg-primary-soft/50 text-primary'
                  : 'border-border-strong text-[color:var(--color-text-subtle)]'
              )}
            >
              {isOver ? 'Déposer ici' : 'Vide'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------

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
    // Tri stable alpha sur (company || name) — l'ordre ne change qu'au
    // renommage, jamais sur tag/stage/notes/etc.
    for (const s of stages) {
      map[s.id].sort((a, b) => {
        const ka = (a.company || a.name || '').trim();
        const kb = (b.company || b.name || '').trim();
        return ka.localeCompare(kb, 'fr', { sensitivity: 'base', numeric: true });
      });
    }
    return map;
  }, [leads, stages]);

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
  const activeStageColor = activeLead
    ? getStageColorHex(stages.find((s) => s.id === activeLead.stage)?.color ?? 'blue')
    : '#999';

  return (
    <div className="p-4 h-full flex flex-col min-h-0">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="flex gap-3 overflow-x-auto flex-1 min-h-0 pb-2 items-stretch">
          {stages.map((stage) => (
            <Column
              key={stage.id}
              stage={stage}
              leads={leadsByStage[stage.id] ?? []}
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
            <div className="w-[304px] rotate-[1.5deg] shadow-lg">
              <LeadCardContent
                lead={activeLead}
                tags={tagsByLead?.get(activeLead.id)}
                stageColor={activeStageColor}
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
