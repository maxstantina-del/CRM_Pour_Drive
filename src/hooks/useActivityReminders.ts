/**
 * Schedule browser notifications 10 minutes before every upcoming activity
 * (lead.nextActions + fiches appointments) that has a specific time.
 *
 * Limitation : nécessite que l'onglet CRM reste ouvert (même en arrière-plan).
 * Hors-navigateur = besoin d'un Service Worker + push côté serveur, pas fait
 * ici. L'app rafraîchit les timers à chaque changement de leads/fiches, donc
 * ajouter/supprimer un RDV re-planifie aussitôt.
 */

import { useEffect, useRef } from 'react';
import type { Lead } from '../lib/types';
import type { Fiche } from '../services/fichesService';
import { parseFicheSlots } from '../lib/appointments';

const LEAD_TIME_IN_WINDOW = 24 * 3600 * 1000; // only schedule events within 24h
const REMINDER_OFFSET_MS = 10 * 60 * 1000;     // 10 minutes before

interface ScheduledEvent {
  /** Stable id so we don't trigger the same event twice after re-renders. */
  key: string;
  when: Date;
  title: string;
  body: string;
}

function showNotification(title: string, body: string) {
  if (typeof window === 'undefined' || !('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  try {
    new Notification(title, { body, icon: '/favicon.ico', tag: title });
  } catch {
    /* ignore browser quirks */
  }
}

export function useActivityReminders(
  leads: Lead[],
  fichesByLead: Map<string, Fiche[]>
) {
  /** Tracks event keys already fired so we don't re-notify after a re-render. */
  const firedKeys = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;

    const leadById = new Map(leads.map((l) => [l.id, l]));
    const events: ScheduledEvent[] = [];
    const now = Date.now();

    for (const lead of leads) {
      if (!lead.nextActions) continue;
      for (const action of lead.nextActions) {
        if (action.completed || !action.dueDate) continue;
        // Only schedule for entries with explicit time (ISO with 'T' or 'HH:MM')
        const hasTime = /T\d{2}:\d{2}|\s\d{2}:\d{2}/.test(action.dueDate);
        if (!hasTime) continue;
        const when = new Date(action.dueDate);
        if (isNaN(when.getTime())) continue;
        events.push({
          key: `action:${lead.id}:${action.id}:${action.dueDate}`,
          when,
          title: `Dans 10 min — ${lead.company || lead.name}`,
          body: action.text,
        });
      }
    }

    for (const [leadId, fiches] of fichesByLead) {
      const lead = leadById.get(leadId);
      if (!lead) continue;
      for (const fiche of fiches) {
        for (const slot of parseFicheSlots(fiche)) {
          if (!slot.hasTime) continue;
          const plate = slot.vehiclePlate ? ` — ${slot.vehiclePlate}` : '';
          const note = slot.note ? ` — ${slot.note}` : '';
          events.push({
            key: `fiche:${fiche.id}:${slot.when.toISOString()}`,
            when: slot.when,
            title: `Dans 10 min — RDV Autoglass ${lead.company || lead.name}`,
            body: `${slot.when.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}${plate}${note}`,
          });
        }
      }
    }

    const timers: ReturnType<typeof setTimeout>[] = [];

    for (const event of events) {
      if (firedKeys.current.has(event.key)) continue;
      const triggerAt = event.when.getTime() - REMINDER_OFFSET_MS;
      const delay = triggerAt - now;
      // Skip: already past, or too far ahead (we'll schedule later as the hook
      // re-runs whenever leads change or a day passes).
      if (delay <= 0 || delay > LEAD_TIME_IN_WINDOW) continue;
      const timer = setTimeout(() => {
        firedKeys.current.add(event.key);
        showNotification(event.title, event.body);
      }, delay);
      timers.push(timer);
    }

    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, [leads, fichesByLead]);
}

/**
 * Ask the user to allow notifications. Returns the new permission state.
 * Called from the UI toggle — don't auto-prompt on mount (annoying UX).
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'denied';
  if (Notification.permission !== 'default') return Notification.permission;
  try {
    return await Notification.requestPermission();
  } catch {
    return 'denied';
  }
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}
