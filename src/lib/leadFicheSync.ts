/**
 * Keep lead contact + address in sync with the fiches attached to it.
 *
 * Fiche-side : single string `interventionAddress` + contactName/Phone/Email.
 * Lead-side  : structured address (address / zipCode / city) + contactName /
 * phone / email.
 *
 * Strategy: derive a minimal Partial update for the target so we only write
 * what actually changed. Empty fiche fields don't wipe the lead (and vice
 * versa). Last-write-wins on genuine edits.
 */

import type { Lead } from './types';
import type { Fiche, FicheInput } from '../services/fichesService';

function nullable(s: string | null | undefined): string {
  return (s ?? '').trim();
}

function composeLeadAddress(lead: Lead): string {
  const parts: string[] = [];
  if (lead.address) parts.push(lead.address);
  if (lead.zipCode && lead.city) parts.push(`${lead.zipCode} ${lead.city}`);
  else if (lead.zipCode) parts.push(lead.zipCode);
  else if (lead.city) parts.push(lead.city);
  return parts.filter(Boolean).join(', ');
}

/**
 * Fields on a fiche input that mirror lead data. When the user edits a fiche,
 * propagate these differences back to the lead so everything stays aligned.
 */
export function diffLeadFromFicheInput(
  lead: Lead,
  input: FicheInput
): Partial<Lead> {
  const out: Partial<Lead> = {};

  if (input.contactName !== undefined) {
    const next = nullable(input.contactName);
    if (next && next !== nullable(lead.contactName)) out.contactName = next;
  }
  if (input.contactPhone !== undefined) {
    const next = nullable(input.contactPhone);
    if (next && next !== nullable(lead.phone)) out.phone = next;
  }
  if (input.contactEmail !== undefined) {
    const next = nullable(input.contactEmail);
    if (next && next !== nullable(lead.email)) out.email = next;
  }
  if (input.interventionAddress !== undefined) {
    const next = nullable(input.interventionAddress);
    const current = composeLeadAddress(lead) || nullable(lead.address);
    if (next && next !== current) {
      // We overwrite the street field with the full string the user typed in
      // the fiche. zipCode/city keep their structured value so filters keep
      // working — the user can still edit them separately on the lead form.
      out.address = next;
    }
  }
  return out;
}

/**
 * Reverse: when the lead is edited, push the same fields down to every fiche
 * attached to it, but only for fiches whose fields match the lead's PREVIOUS
 * value (so we don't crush manual per-fiche customizations).
 */
export function diffFicheFromLead(
  fiche: Fiche,
  prevLead: Lead,
  nextLead: Lead
): FicheInput {
  const out: FicheInput = {};

  const prevName = nullable(prevLead.contactName || prevLead.name);
  const nextName = nullable(nextLead.contactName || nextLead.name);
  if (prevName !== nextName && nullable(fiche.contactName) === prevName) {
    out.contactName = nextName || null;
  }

  if (prevLead.phone !== nextLead.phone && nullable(fiche.contactPhone) === nullable(prevLead.phone)) {
    out.contactPhone = nullable(nextLead.phone) || null;
  }
  if (prevLead.email !== nextLead.email && nullable(fiche.contactEmail) === nullable(prevLead.email)) {
    out.contactEmail = nullable(nextLead.email) || null;
  }

  const prevAddr = composeLeadAddress(prevLead);
  const nextAddr = composeLeadAddress(nextLead);
  if (prevAddr !== nextAddr && nullable(fiche.interventionAddress) === prevAddr) {
    out.interventionAddress = nextAddr || null;
  }
  return out;
}

export function hasAnyFicheSync(input: FicheInput): boolean {
  return (
    input.contactName !== undefined ||
    input.contactPhone !== undefined ||
    input.contactEmail !== undefined ||
    input.interventionAddress !== undefined
  );
}
