/**
 * Counts today's and overdue activities across all leads + fiches.
 * Shared between the Activity view (as bucket totals) and the Header badge.
 */

import type { Lead } from './types';
import type { Fiche } from '../services/fichesService';
import { parseFicheSlots } from './appointments';

export interface ActivityCounts {
  today: number;
  overdue: number;
}

export function getActivityCounts(
  leads: Lead[],
  fichesByLead: Map<string, Fiche[]>
): ActivityCounts {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  let todayCount = 0;
  let overdueCount = 0;

  for (const lead of leads) {
    if (!lead.nextActions) continue;
    for (const action of lead.nextActions) {
      if (action.completed || !action.dueDate) continue;
      const when = new Date(action.dueDate);
      if (isNaN(when.getTime())) continue;
      const whenDay = new Date(when);
      whenDay.setHours(0, 0, 0, 0);
      if (whenDay < today) overdueCount++;
      else if (whenDay < tomorrow) todayCount++;
    }
  }

  for (const fiches of fichesByLead.values()) {
    for (const fiche of fiches) {
      for (const slot of parseFicheSlots(fiche)) {
        const whenDay = new Date(slot.when);
        whenDay.setHours(0, 0, 0, 0);
        if (whenDay < today) overdueCount++;
        else if (whenDay < tomorrow) todayCount++;
      }
    }
  }

  return { today: todayCount, overdue: overdueCount };
}
