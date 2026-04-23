/**
 * Activity view — liste chronologique de tout ce que le commercial a à faire :
 * relances (nextActions) + rendez-vous Autoglass (fiches.availability).
 *
 * Groupée par bucket temporel (En retard / Aujourd'hui / Demain / Cette
 * semaine / Semaine prochaine / Plus tard), ergonomique et scannable en un
 * coup d'œil sans avoir à cliquer.
 */

import React, { useMemo } from 'react';
import type { Lead, NextAction } from '../../lib/types';
import { Card, Button } from '../ui';
import { Calendar, AlertCircle, Truck, CalendarCheck2 } from 'lucide-react';
import { useAllFiches } from '../../contexts/FichesContext';
import { parseFicheSlots, type ParsedSlot } from '../../lib/appointments';

export interface TodayViewProps {
  leads: Lead[];
  onEditLead: (lead: Lead) => void;
  onDeleteLead: (leadId: string) => void;
  onUpdateStage: (leadId: string, newStage: Lead['stage']) => void;
  onViewLead?: (lead: Lead) => void;
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

export function TodayView({ leads, onEditLead, onViewLead }: TodayViewProps) {
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

  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <div className="flex items-baseline gap-3">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Activité</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {totalCount} élément{totalCount > 1 ? 's' : ''} à traiter
        </span>
      </div>

      {totalCount === 0 && (
        <Card padding="lg">
          <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
            <CalendarCheck2 size={24} />
            <p>Rien de prévu. Ajoute une relance ou un rendez-vous Autoglass sur une fiche.</p>
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
            onOpenLead={openLead}
          />
        );
      })}
    </div>
  );
}

function BucketSection({
  bucket,
  items,
  onOpenLead,
}: {
  bucket: Bucket;
  items: ActivityItem[];
  onOpenLead: (l: Lead) => void;
}) {
  const isOverdue = bucket === 'overdue';
  const icon = isOverdue ? (
    <AlertCircle className="text-red-500" size={18} />
  ) : bucket === 'today' ? (
    <Calendar className="text-blue-500" size={18} />
  ) : (
    <Calendar className="text-gray-400 dark:text-gray-500" size={18} />
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
      <div
        className={`flex items-center gap-2 mb-3 pb-2 border-b ${
          isOverdue
            ? 'border-red-200 dark:border-red-900/40'
            : 'border-gray-200 dark:border-gray-800'
        }`}
      >
        {icon}
        <h2
          className={`text-lg font-semibold ${
            isOverdue ? 'text-red-700 dark:text-red-300' : 'text-gray-900 dark:text-gray-100'
          }`}
        >
          {BUCKET_LABELS[bucket]}
        </h2>
        <span className="text-sm text-gray-500 dark:text-gray-400">({items.length})</span>
      </div>

      {byDay ? (
        <div className="space-y-4">
          {byDay.map(([dayKey, dayItems]) => (
            <div key={dayKey}>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
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
    <Card padding="md" hover onClick={() => onOpenLead(lead)}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0 flex-1">
          <div
            className={`flex-shrink-0 mt-0.5 w-8 h-8 rounded-md flex items-center justify-center ${
              isAppt
                ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300'
                : overdue
                ? 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-300'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            {isAppt ? <Truck size={16} /> : <Calendar size={16} />}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-medium text-gray-900 dark:text-gray-100 truncate">{lead.name}</h3>
              {lead.company && lead.company !== lead.name && (
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate">{lead.company}</span>
              )}
            </div>
            <div
              className={`mt-1 text-sm ${
                overdue
                  ? 'text-red-700 dark:text-red-300'
                  : isAppt
                  ? 'text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {isAppt ? (
                <span className="inline-flex items-center gap-2">
                  <span className="font-medium">RDV Autoglass</span>
                  {item.slot.vehiclePlate && (
                    <span className="font-mono text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">
                      {item.slot.vehiclePlate}
                    </span>
                  )}
                  {item.slot.note && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">— {item.slot.note}</span>
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
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDayHeader(item.when)}
            </span>
          )}
          {timeLabel && (
            <span
              className={`text-sm font-semibold ${
                overdue
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-gray-900 dark:text-gray-100'
              }`}
            >
              {timeLabel}
            </span>
          )}
          <Button size="sm" onClick={(e) => { e.stopPropagation(); onOpenLead(lead); }}>
            Voir
          </Button>
        </div>
      </div>
    </Card>
  );
}
