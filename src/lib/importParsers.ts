/**
 * Pure import parsing helpers. Separates file reading from lead construction
 * so the UI can show a preview + let the user adjust the column mapping.
 */

import * as XLSX from 'xlsx';
import type { Lead, LeadStage } from './types';
import { readFileAsText } from './utils';

export type LeadField =
  | 'name'
  | 'contactName'
  | 'email'
  | 'phone'
  | 'company'
  | 'siret'
  | 'address'
  | 'city'
  | 'zipCode'
  | 'country'
  | 'stage'
  | 'value'
  | 'probability'
  | 'notes';

export const LEAD_FIELD_LABELS: Record<LeadField, string> = {
  name: 'Nom',
  contactName: 'Nom du contact',
  email: 'Email',
  phone: 'Téléphone',
  company: 'Entreprise',
  siret: 'SIRET',
  address: 'Adresse',
  city: 'Ville',
  zipCode: 'Code postal',
  country: 'Pays',
  stage: 'Étape',
  value: 'Valeur (€)',
  probability: 'Probabilité (%)',
  notes: 'Notes',
};

export const LEAD_FIELDS_ORDER: LeadField[] = [
  'name', 'company', 'contactName', 'email', 'phone',
  'address', 'city', 'zipCode', 'country', 'siret',
  'stage', 'value', 'probability', 'notes',
];

export interface PreviewData {
  headers: string[];
  rows: unknown[][];
  fileName: string;
}

export function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\s-]+/g, ' ')
    .trim();
}

export function autoDetectField(header: string): LeadField | null {
  const n = normalizeHeader(header);
  // Priority: "Enseigne" / "Nom commercial" = primary display name (name)
  if (n.includes('enseigne') || n.includes('nom commercial') || n.includes('nom d enseigne')) return 'name';
  // Legal name / entity → company
  if (n.includes('entreprise') || n.includes('company') || n.includes('societe') || n.includes('denomination') || n.includes('raison sociale')) return 'company';
  // Contact person
  if (n.includes('contact name') || n.includes('nom contact') || n.includes('nom du contact') || n.includes('representant') || n === 'contact' || n.includes('dirigeant') || n.includes('gerant')) return 'contactName';
  // Generic name fallback (project / lead name)
  if (n === 'nom' || n === 'name' || n.includes('projet') || n.includes('project') || n.includes('lead')) return 'name';
  if (n.includes('email') || n.includes('mail') || n.includes('courriel')) return 'email';
  if (n.includes('phone') || n.includes('telephone') || n.includes('tel') || n.includes('mobile') || n.includes('fixe') || n.includes('portable')) return 'phone';
  if (n.includes('siret') || n.includes('siren')) return 'siret';
  if (n.includes('adresse') || n.includes('address') || n.includes('rue')) return 'address';
  if (n.includes('ville') || n.includes('city') || n.includes('commune')) return 'city';
  if (n.includes('code postal') || n.includes('zip') || n.includes('postal code') || n === 'cp') return 'zipCode';
  if (n.includes('pays') || n.includes('country')) return 'country';
  if (n.includes('valeur') || n.includes('value') || n.includes('montant') || n.includes('amount') || n.includes('ca ') || n === 'ca') return 'value';
  if (n.includes('probabilite') || n.includes('probability') || n.includes('prob')) return 'probability';
  if (n.includes('notes') || n.includes('note') || n.includes('commentaire') || n.includes('comment') || n.includes('remarque')) return 'notes';
  if (n.includes('stage') || n.includes('etape') || n.includes('statut') || n.includes('status')) return 'stage';
  return null;
}

export function autoDetectMapping(headers: string[]): Record<number, LeadField> {
  const used = new Set<LeadField>();
  const mapping: Record<number, LeadField> = {};
  headers.forEach((h, i) => {
    const f = autoDetectField(String(h ?? ''));
    // prefer the first occurrence; later headers with the same auto-detect don't overwrite
    if (f && !used.has(f)) {
      mapping[i] = f;
      used.add(f);
    }
  });
  return mapping;
}

const STAGE_ALIASES: Record<string, LeadStage> = {
  nouveau: 'new', new: 'new',
  contacte: 'contacted', contacted: 'contacted',
  qualifie: 'qualified', qualified: 'qualified',
  rdv: 'meeting', meeting: 'meeting', 'rdv planifie': 'meeting',
  proposition: 'proposal', proposal: 'proposal',
  negociation: 'negotiation', negotiation: 'negotiation',
  gagne: 'won', won: 'won', closed_won: 'closed_won',
  perdu: 'lost', lost: 'lost', closed_lost: 'closed_lost',
};

export function normalizeStage(raw: unknown): LeadStage {
  if (!raw) return 'new';
  const key = normalizeHeader(String(raw));
  return STAGE_ALIASES[key] ?? 'new';
}

function parseNumberLoose(str: string): number | null {
  // "12 000 €" → 12000, "12,50" → 12.5, "1.234,56" stays best-effort
  const cleaned = str.replace(/[^\d.,\-]/g, '').replace(/\s/g, '');
  if (!cleaned) return null;
  const normalized =
    cleaned.includes(',') && !cleaned.includes('.')
      ? cleaned.replace(',', '.')
      : cleaned;
  const n = parseFloat(normalized);
  return Number.isFinite(n) ? n : null;
}

export function applyMapping(
  headers: string[],
  rows: unknown[][],
  mapping: Record<number, LeadField>,
  pipelineId: string
): Partial<Lead>[] {
  const entries = Object.entries(mapping)
    .map(([idx, field]) => [Number(idx), field] as [number, LeadField])
    .filter(([idx]) => idx < headers.length);

  const out: Partial<Lead>[] = [];
  for (const row of rows) {
    const lead: Partial<Lead> = { pipelineId };
    for (const [idx, field] of entries) {
      const value = row[idx];
      if (value === undefined || value === null || value === '') continue;
      const str = String(value).trim();
      if (!str) continue;
      if (field === 'value' || field === 'probability') {
        const n = parseNumberLoose(str);
        if (n !== null) (lead as Record<string, unknown>)[field] = n;
      } else if (field === 'stage') {
        lead.stage = normalizeStage(str);
      } else {
        (lead as Record<string, unknown>)[field] = str;
      }
    }
    if (!lead.name && !lead.company) continue; // one of them is required
    out.push(lead);
  }
  return out;
}

export function countImportable(
  headers: string[],
  rows: unknown[][],
  mapping: Record<number, LeadField>
): { importable: number; skipped: number } {
  const nameIdx = Object.entries(mapping).find(([, f]) => f === 'name')?.[0];
  const companyIdx = Object.entries(mapping).find(([, f]) => f === 'company')?.[0];
  if (nameIdx === undefined && companyIdx === undefined) {
    return { importable: 0, skipped: rows.length };
  }
  let importable = 0;
  let skipped = 0;
  for (const row of rows) {
    const hasName = nameIdx !== undefined && !!String(row[Number(nameIdx)] ?? '').trim();
    const hasCompany = companyIdx !== undefined && !!String(row[Number(companyIdx)] ?? '').trim();
    if (hasName || hasCompany) importable++;
    else skipped++;
  }
  return { importable, skipped };
}

export function isMappingValid(mapping: Record<number, LeadField>): boolean {
  const fields = new Set(Object.values(mapping));
  return fields.has('name') || fields.has('company');
}

/**
 * True when auto-detection is confident enough to skip the manual mapping step:
 * must have name OR company AND at least one contact channel (email/phone) or address.
 */
export function isMappingAutoSkippable(mapping: Record<number, LeadField>): boolean {
  const fields = new Set(Object.values(mapping));
  const hasIdentity = fields.has('name') || fields.has('company');
  const hasContact = fields.has('email') || fields.has('phone') || fields.has('address') || fields.has('city');
  return hasIdentity && hasContact;
}

async function readArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as ArrayBuffer);
    r.onerror = () => reject(new Error('Failed to read file'));
    r.readAsArrayBuffer(file);
  });
}

async function parseJSONPreview(file: File): Promise<PreviewData> {
  const text = await readFileAsText(file);
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error('JSON doit être un tableau de leads.');
  if (parsed.length === 0) return { headers: [], rows: [], fileName: file.name };

  const keySet = new Set<string>();
  for (const obj of parsed) {
    if (obj && typeof obj === 'object') {
      Object.keys(obj as Record<string, unknown>).forEach((k) => keySet.add(k));
    }
  }
  const headers = Array.from(keySet);
  const rows = parsed.map((obj) =>
    headers.map((k) => (obj as Record<string, unknown>)[k] ?? '')
  );
  return { headers, rows, fileName: file.name };
}

export async function parseFilePreview(file: File): Promise<PreviewData> {
  const fname = file.name.toLowerCase();
  const ftype = file.type;

  if (fname.endsWith('.json') || ftype === 'application/json') {
    return parseJSONPreview(file);
  }

  // XLSX handles .xlsx/.xls/.csv (auto-detects delimiter, supports quoted strings).
  const buf = await readArrayBuffer(file);
  const wb = XLSX.read(buf, { type: 'array', raw: false });
  if (wb.SheetNames.length === 0) throw new Error('Fichier vide ou illisible.');
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rawRows = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1, defval: '', raw: false });
  if (rawRows.length < 2) throw new Error('Le fichier doit avoir une ligne d\'en-tête et au moins une ligne de données.');

  const headers = (rawRows[0] as unknown[]).map((h) => String(h ?? '').trim());
  const rows = rawRows.slice(1) as unknown[][];
  return { headers, rows, fileName: file.name };
}

/** Extract up to N non-empty sample values per column, truncated. */
export function sampleValues(rows: unknown[][], colIdx: number, max = 3, maxLen = 30): string[] {
  const out: string[] = [];
  for (const row of rows) {
    if (out.length >= max) break;
    const v = row[colIdx];
    if (v === undefined || v === null) continue;
    const s = String(v).trim();
    if (!s) continue;
    out.push(s.length > maxLen ? s.slice(0, maxLen) + '…' : s);
  }
  return out;
}
