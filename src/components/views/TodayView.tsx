/**
 * Activity view — liste chronologique de tout ce que le commercial a à faire :
 * relances (nextActions) + rendez-vous Autoglass (fiches.availability).
 *
 * Groupée par bucket temporel (En retard / Aujourd'hui / Demain / Cette
 * semaine / Semaine prochaine / Plus tard), ergonomique et scannable en un
 * coup d'œil sans avoir à cliquer.
 */

import React, { useMemo, useState, useCallback, useEffect } from 'react';
import type { Lead, NextAction } from '../../lib/types';
import { Card, Button } from '../ui';
import { Calendar, AlertCircle, Truck, CalendarCheck2, ChevronDown, ChevronRight, Bell, BellOff } from 'lucide-react';
import { useAllFiches } from '../../contexts/FichesContext';
import { parseFicheSlots, type ParsedSlot } from '../../lib/appointments';
import {
  getNotificationPermission,
  requestNotificationPermission,
} from '../../hooks/useActivityReminders';
import { cn } from '../../lib/utils';

export interface TodayViewProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onUpdateStage: (leadId: string, newStage: Lead['stage']) => void;
  onViewLead?: (lead: Lead) => void;
  /** Incremented by the header badge click; forces expand + scroll-to-top. */
  focusKey?: number;
}

type ActivityItem =
  | { kind: 'action'; when: Date; hasTime: boolean; lead: Lead; action: NextAction }
  | { kind: 'appointment'; when: Date; hasTime: boolean; lead: Lead; slot: ParsedSlot };

/** Truncate a date to local midnight so equality checks work by day. */
function dayStart(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

/** ISO week: Monday (1) .. Sunday (7). Returns 0 for Monday, 6 for Sunday. */
function isoDay(d: Date): number {
  return (d.getDay() + 6) % 7;
}

/** Start of the ISO week (Monday 00:00) containing d. */
function startOfWeek(d: Date): Date {
  return addDays(dayStart(d), -isoDay(d));
}

const BUCKETS = [
  'overdue',
  'today',
  'tomorrow',
  'thisWeek',
  'nextWeek',
  'later',
] as const;
type Bucket = (typeof BUCKETS)[number];

const BUCKET_LABELS: Record<Bucket, string> = {
  overdue: 'En retard',
  today: "Aujourd'hui",
  tomorrow: 'Demain',
  thisWeek: 'Cette semaine',
  nextWeek: 'Semaine prochaine',
  later: 'Plus tard',
};

/**
 * Sections plus éloignées dans le temps sont repliées par défaut pour éviter
 * le défilement infini quand la liste grossit. L'utilisateur peut déplier
 * manuellement et son choix est persisté en localStorage.
 */
const DEFAULT_OPEN: Record<Bucket, boolean> = {
  overdue: true,
  today: true,
  tomorrow: true,
  thisWeek: true,
  nextWeek: false,
  later: false,
};

const STORAGE_KEY = 'activity.bucketOpen.v1';

function bucketOf(itemDate: Date, now: Date): Bucket {
  const today = dayStart(now);
  const itemDay = dayStart(itemDate);
  const diff = Math.round((itemDay.getTime() - today.getTime()) / (24 * 3600 * 1000));
  if (diff < 0) return 'overdue';
  if (diff === 0) return 'today';
  if (diff === 1) return 'tomorrow';
  const thisWeekStart = startOfWeek(today);
  const nextWeekStart = addDays(thisWeekStart, 7);
  const weekAfterStart = addDays(thisWeekStart, 14);
  if (itemDay < nextWeekStart) return 'thisWeek';
  if (itemDay < weekAfterStart) return 'nextWeek';
  return 'later';
}

function formatDayHeader(d: Date): string {
  return d
    .toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    .replace(/^./, (c) => c.toUpperCase());
}

function formatTime(d: Date): string {
  const hh = d.getHours().toString().padStart(2, '0');
  const mm = d.getMinutes().toString().padStart(2, '0');
  return mm === '00' ? `${hh}h` : `${hh}h${mm}`;
}

export function TodayView({ leads, onEditLead, onViewLead, focusKey }: TodayViewProps) {
  const openLead = onViewLead ?? onEditLead;
  const { fichesByLead } = useAllFiches();

  const grouped = useMemo(() => {
    const now = new Date();
    const items: ActivityItem[] = [];
    const leadById = new Map(leads.map((l) => [l.id, l]));

    for (const lead of leads) {
      if (!lead.nextActions) continue;
      for (const action of lead.nextActions) {
        if (action.completed || !action.dueDate) continue;
        const when = new Date(action.dueDate);
        if (isNaN(when.getTime())) continue;
        items.push({
          kind: 'action',
          when,
          hasTime: action.dueDate.includes('T') || action.dueDate.includes(' '),
          lead,
          action,
        });
      }
    }

    for (const [leadId, fiches] of fichesByLead) {
      const lead = leadById.get(leadId);
      if (!lead) continue;
      for (const fiche of fiches) {
        for (const slot of parseFicheSlots(fiche)) {
          items.push({ kind: 'appointment', when: slot.when, hasTime: slot.hasTime, lead, slot });
        }
      }
    }

    const out: Record<Bucket, ActivityItem[]> = {
      overdue: [],
      today: [],
      tomorrow: [],
      thisWeek: [],
      nextWeek: [],
      later: [],
    };
    for (const item of items) out[bucketOf(item.when, now)].push(item);

    // In "overdue", we want the most recent overdue first (closest to today).
    out.overdue.sort((a, b) => b.when.getTime() - a.when.getTime());
    // All other buckets: chronological ascending.
    for (const key of BUCKETS) {
      if (key === 'overdue') continue;
      out[key].sort((a, b) => a.when.getTime() - b.when.getTime());
    }
    return out;
  }, [leads, fichesByLead]);

  const totalCount = BUCKETS.reduce((sum, k) => sum + grouped[k].length, 0);

  const [openState, setOpenState] = useState<Record<Bucket, boolean>>(() => {
    if (typeof window === 'undefined') return { ...DEFAULT_OPEN };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Record<Bucket, boolean>>;
        return { ...DEFAULT_OPEN, ...parsed };
      }
    } catch { /* ignore */ }
    return { ...DEFAULT_OPEN };
  });

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(openState)); } catch { /* ignore */ }
  }, [openState]);

  // When the header Activity badge is clicked, force-open the two most urgent
  // buckets and scroll to the top so the user gets visible feedback even when
  // already on this view.
  useEffect(() => {
    if (focusKey === undefined || focusKey === 0) return;
    setOpenState((prev) => ({ ...prev, overdue: true, today: true }));
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [focusKey]);

  const toggleBucket = useCallback((bucket: Bucket) => {
    setOpenState((prev) => ({ ...prev, [bucket]: !prev[bucket] }));
  }, []);

  const setAll = useCallback((value: boolean) => {
    setOpenState(BUCKETS.reduce((acc, k) => ({ ...acc, [k]: value }), {} as Record<Bucket, boolean>));
  }, []);

  return (
    <div className="p-4 space-y-4 max-w-4xl">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <div className="flex items-baseline gap-3">
          <h1 className="heading-lg">Activité</h1>
          <span className="text-[12px] text-[color:var(--color-text-muted)]">
            {totalCount} élément{totalCount > 1 ? 's' : ''} à traiter
          </span>
        </div>
        {totalCount > 0 && (
          <div className="flex items-center gap-2 text-[11px]">
            <NotifToggle />
            <button
              type="button"
              onClick={() => setAll(true)}
              className="h-7 px-2.5 rounded-sm border border-border text-[color:var(--color-text-body)] hover:bg-surface-2"
            >
              Tout déplier
            </button>
            <button
              type="button"
              onClick={() => setAll(false)}
              className="h-7 px-2.5 rounded-sm border border-border text-[color:var(--color-text-body)] hover:bg-surface-2"
            >
              Tout replier
            </button>
          </div>
        )}
      </div>

      {totalCount === 0 && (
        <Card padding="lg">
          <div className="flex items-center gap-3 text-[color:var(--color-text-muted)]">
            <CalendarCheck2 size={24} className="text-[color:var(--color-text-subtle)]" />
            <p className="text-[13px]">Rien de prévu. Ajoute une relance ou un rendez-vous Autoglass sur une fiche.</p>
          </div>
        </Card>
      )}

      {BUCKETS.map((bucket) => {
        const list = grouped[bucket];
        if (list.length === 0) return null;
        return (
          <BucketSection
            key={bucket}
            bucket={bucket}
            items={list}
            open={openState[bucket]}
            onToggle={() => toggleBucket(bucket)}
            onOpenLead={openLead}
          />
        );
      })}
    </div>
  );
}

/**
 * Permission toggle for the browser-level 10 minute reminder. Opt-in: we
 * never auto-prompt (UX), the user must click to enable.
 */
function NotifToggle() {
  const [perm, setPerm] = useState<NotificationPermission | 'unsupported'>(() =>
    getNotificationPermission()
  );

  if (perm === 'unsupported') return null;

  if (perm === 'granted') {
    return (
      <span
        title="Notifications activées : tu recevras une alerte 10 min avant chaque RDV ou relance avec une heure précise. L'onglet du CRM doit rester ouvert."
        className="chip chip-success"
      >
        <Bell size={12} /> Rappels 10 min
      </span>
    );
  }

  if (perm === 'denied') {
    return (
      <span
        title="Notifications bloquées par le navigateur. Réactive-les dans les paramètres du site (icône de cadenas à gauche de l'URL)."
        className="chip chip-neutral opacity-60"
      >
        <BellOff size={12} /> Rappels bloqués
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={async () => {
        const next = await requestNotificationPermission();
        setPerm(next);
      }}
      className="chip chip-primary hover:opacity-90"
      title="Active les alertes navigateur 10 min avant chaque RDV avec heure fixée"
    >
      <Bell size={12} /> Activer les rappels 10 min
    </button>
  );
}

function BucketSection({
  bucket,
  items,
  open,
  onToggle,
  onOpenLead,
}: {
  bucket: Bucket;
  items: ActivityItem[];
  open: boolean;
  onToggle: () => void;
  onOpenLead: (l: Lead) => void;
}) {
  const isOverdue = bucket === 'overdue';
  const icon = isOverdue ? (
    <AlertCircle className="text-danger" size={16} />
  ) : bucket === 'today' ? (
    <Calendar className="text-primary" size={16} />
  ) : (
    <Calendar className="text-[color:var(--color-text-subtle)]" size={16} />
  );

  // For multi-day buckets, sub-group by day to make the day structure visible.
  const needsDayGrouping = bucket === 'thisWeek' || bucket === 'nextWeek' || bucket === 'later';
  const byDay = useMemo(() => {
    if (!needsDayGrouping) return null;
    const map = new Map<number, ActivityItem[]>();
    for (const it of items) {
      const dayKey = dayStart(it.when).getTime();
      const arr = map.get(dayKey);
      if (arr) arr.push(it);
      else map.set(dayKey, [it]);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a - b);
  }, [items, needsDayGrouping]);

  return (
    <section>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className={cn(
          'w-full flex items-center gap-2 pb-2 border-b text-left select-none transition-colors rounded-sm px-1 -mx-1 hover:bg-surface-2',
          isOverdue ? 'border-[color:var(--color-danger-soft)]' : 'border-border',
          open ? 'mb-3' : 'mb-1'
        )}
      >
        {open ? (
          <ChevronDown size={14} className="text-[color:var(--color-text-subtle)] flex-shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-[color:var(--color-text-subtle)] flex-shrink-0" />
        )}
        {icon}
        <h2
          className={cn(
            'heading-sm',
            isOverdue && 'text-danger'
          )}
        >
          {BUCKET_LABELS[bucket]}
        </h2>
        <span
          className={cn(
            'chip !text-[11px] font-semibold',
            isOverdue ? 'chip-danger' : 'chip-neutral'
          )}
        >
          {items.length}
        </span>
      </button>

      {!open ? null : byDay ? (
        <div className="space-y-4">
          {byDay.map(([dayKey, dayItems]) => (
            <div key={dayKey}>
              <p className="text-caption mb-2">
                {formatDayHeader(new Date(dayKey))}
              </p>
              <div className="space-y-2">
                {dayItems.map((item, i) => (
                  <ActivityRow
                    key={`${item.kind}-${item.lead.id}-${i}`}
                    item={item}
                    overdue={isOverdue}
                    showDayInline={false}
                    onOpenLead={onOpenLead}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((item, i) => (
            <ActivityRow
              key={`${item.kind}-${item.lead.id}-${i}`}
              item={item}
              overdue={isOverdue}
              showDayInline={isOverdue}
              onOpenLead={onOpenLead}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function ActivityRow({
  item,
  overdue,
  showDayInline,
  onOpenLead,
}: {
  item: ActivityItem;
  overdue: boolean;
  showDayInline: boolean;
  onOpenLead: (l: Lead) => void;
}) {
  const { lead } = item;
  const isAppt = item.kind === 'appointment';
  const timeLabel = item.hasTime ? formatTime(item.when) : null;

  return (
    <Card padding="sm" hover onClick={() => onOpenLead(lead)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={cn(
              'flex-shrink-0 mt-0.5 w-8 h-8 rounded-sm flex items-center justify-center',
              isAppt
                ? 'bg-primary-soft text-primary-soft-text'
                : overdue
                ? 'bg-danger-soft text-danger-soft-text'
                : 'bg-surface-2 text-[color:var(--color-text-muted)]'
            )}
          >
            {isAppt ? <Truck size={14} /> : <Calendar size={14} />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-[13px] font-semibold text-[color:var(--color-text)] truncate">
                {lead.name}
              </h3>
              {lead.company && lead.company !== lead.name && (
                <span className="text-[11px] text-[color:var(--color-text-muted)] truncate">
                  {lead.company}
                </span>
              )}
            </div>
            <div
              className={cn(
                'mt-0.5 text-[13px]',
                overdue
                  ? 'text-danger'
                  : isAppt
                  ? 'text-primary-soft-text'
                  : 'text-[color:var(--color-text-body)]'
              )}
            >
              {isAppt ? (
                <span className="inline-flex items-center gap-2 flex-wrap">
                  <span className="font-medium">RDV Autoglass</span>
                  {item.slot.vehiclePlate && (
                    <span className="font-mono text-[11px] px-1.5 py-0.5 bg-surface-2 text-[color:var(--color-text-body)] rounded-sm">
                      {item.slot.vehiclePlate}
                    </span>
                  )}
                  {item.slot.note && (
                    <span className="text-[11px] text-[color:var(--color-text-muted)]">
                      — {item.slot.note}
                    </span>
                  )}
                </span>
              ) : (
                <span>{item.action.text}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          {showDayInline && (
            <span className="text-[11px] text-[color:var(--color-text-muted)]">
              {formatDayHeader(item.when)}
            </span>
          )}
          {timeLabel && (
            <span
              className={cn(
                'text-[13px] font-semibold tabular-nums',
                overdue ? 'text-danger' : 'text-[color:var(--color-text)]'
              )}
            >
              {timeLabel}
            </span>
          )}
          <Button size="xs" variant="ghost" onClick={(e) => { e.stopPropagation(); onOpenLead(lead); }}>
            Voir
          </Button>
        </div>
      </div>
    </Card>
  );
}
