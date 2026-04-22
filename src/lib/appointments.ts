/**
 * Helpers to parse fiche.availability strings and surface the most relevant
 * appointment for a given lead — used by pipeline cards, table view, etc.
 *
 * Storage format (see FicheFormModal): slots separated by ';;', each slot is
 * 'YYYY-MM-DD[ HH:MM][ | note]'. One fiche can hold N slots; one lead can
 * hold N fiches → we find the next upcoming slot across everything.
 */

import type { Fiche } from '../services/fichesService';

export interface ParsedSlot {
  when: Date; // normalized to local midnight if no time
  hasTime: boolean;
  note: string;
  ficheId: string;
  vehiclePlate: string | null;
}

function parseSlot(raw: string, fiche: Fiche): ParsedSlot | null {
  const m = raw.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}:\d{2}))?(?:\s*\|\s*(.*))?$/);
  if (!m) return null;
  const [, y, mo, d, time, note] = m;
  const when = new Date(`${y}-${mo}-${d}T${time || '00:00'}`);
  if (isNaN(when.getTime())) return null;
  return {
    when,
    hasTime: !!time,
    note: (note ?? '').trim(),
    ficheId: fiche.id,
    vehiclePlate: fiche.vehiclePlate,
  };
}

export function parseFicheSlots(fiche: Fiche): ParsedSlot[] {
  if (!fiche.availability) return [];
  return fiche.availability
    .split(';;')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => parseSlot(s, fiche))
    .filter((x): x is ParsedSlot => x !== null);
}

/**
 * Across all fiches on a lead, find the earliest slot still in the future
 * (or the earliest overall if none are in the future — we still want to show
 * the most recent past appointment rather than nothing).
 */
export function getNextAppointmentForLead(fiches: Fiche[] | undefined): ParsedSlot | null {
  if (!fiches || fiches.length === 0) return null;
  const all: ParsedSlot[] = [];
  for (const f of fiches) all.push(...parseFicheSlots(f));
  if (all.length === 0) return null;
  const now = Date.now();
  const upcoming = all.filter((s) => s.when.getTime() >= now - 24 * 3600 * 1000); // grace 1 day
  if (upcoming.length > 0) {
    upcoming.sort((a, b) => a.when.getTime() - b.when.getTime());
    return upcoming[0];
  }
  // everything is in the past — show the most recent
  all.sort((a, b) => b.when.getTime() - a.when.getTime());
  return all[0];
}

export function countAppointmentsForLead(fiches: Fiche[] | undefined): number {
  if (!fiches) return 0;
  let n = 0;
  for (const f of fiches) n += parseFicheSlots(f).length;
  return n;
}

/**
 * Compact French label: 'Ven. 25 avr. à 14h' or 'Ven. 25 avr.' without time.
 */
export function formatSlotCompact(slot: ParsedSlot): string {
  const day = slot.when.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  if (!slot.hasTime) return day;
  const hh = slot.when.getHours().toString().padStart(2, '0');
  const mm = slot.when.getMinutes().toString().padStart(2, '0');
  const time = mm === '00' ? `${hh}h` : `${hh}h${mm}`;
  return `${day} à ${time}`;
}
