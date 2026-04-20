/**
 * Import wizard for CSV/JSON/XLSX files.
 * Reports progress and per-row errors via the onImport callback contract.
 */

import { useEffect, useState, type ChangeEvent } from 'react';
import * as XLSX from 'xlsx';
import type { Lead, LeadStage } from '../../lib/types';
import { Modal, ModalFooter, Button } from '../ui';
import { Upload, FileText, CheckCircle, AlertTriangle } from 'lucide-react';
import { readFileAsText } from '../../lib/utils';

export interface ImportProgress {
  processed: number;
  total: number;
}

export interface ImportOutcome {
  inserted: number;
  errors: Array<{ index: number; message: string }>;
}

export interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (
    leads: Partial<Lead>[],
    onProgress: (p: ImportProgress) => void
  ) => Promise<ImportOutcome>;
  currentPipelineId: string;
  pipelines?: Array<{ id: string; name: string }>;
}

function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[_\s-]+/g, ' ')
    .trim();
}

function mapHeaderToField(header: string): keyof Lead | null {
  const n = normalizeHeader(header);
  if (n.includes('contact name') || n.includes('nom contact') || n.includes('nom du contact') || n === 'contact') return 'contactName';
  if (n.includes('nom') || n.includes('name') || n.includes('projet') || n.includes('project')) return 'name';
  if (n.includes('email') || n.includes('mail') || n.includes('courriel')) return 'email';
  if (n.includes('phone') || n.includes('telephone') || n.includes('tel') || n.includes('mobile')) return 'phone';
  if (n.includes('entreprise') || n.includes('company') || n.includes('societe')) return 'company';
  if (n.includes('siret')) return 'siret';
  if (n.includes('adresse') || n.includes('address') || n.includes('rue')) return 'address';
  if (n.includes('ville') || n.includes('city')) return 'city';
  if (n.includes('code postal') || n.includes('zip') || n.includes('postal code') || n === 'cp') return 'zipCode';
  if (n.includes('pays') || n.includes('country')) return 'country';
  if (n.includes('valeur') || n.includes('value') || n.includes('montant') || n.includes('amount')) return 'value';
  if (n.includes('probabilite') || n.includes('probability') || n.includes('prob')) return 'probability';
  if (n.includes('notes') || n.includes('note') || n.includes('commentaire') || n.includes('comment')) return 'notes';
  if (n.includes('stage') || n.includes('etape') || n.includes('statut') || n.includes('status')) return 'stage';
  return null;
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

function normalizeStage(raw: unknown): LeadStage {
  if (!raw) return 'new';
  const key = normalizeHeader(String(raw));
  return STAGE_ALIASES[key] ?? 'new';
}

function buildLead(
  fieldMap: Map<number, keyof Lead>,
  row: unknown[],
  pipelineId: string
): Partial<Lead> | null {
  const lead: Partial<Lead> = { pipelineId };
  fieldMap.forEach((field, idx) => {
    const value = row[idx];
    if (value === undefined || value === null || value === '') return;
    const str = String(value).trim();
    if (field === 'value' || field === 'probability') {
      const num = parseFloat(str);
      if (!isNaN(num)) (lead as any)[field] = num;
    } else if (field === 'stage') {
      lead.stage = normalizeStage(str);
    } else {
      (lead as any)[field] = str;
    }
  });
  if (!lead.name && !lead.company) return null;
  return lead;
}

async function parseXLSX(file: File, pipelineId: string): Promise<Partial<Lead>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) throw new Error('Empty file');
        const wb = XLSX.read(data, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1, defval: '' });
        if (rows.length < 2) return resolve([]);
        const headers = rows[0];
        const fieldMap = new Map<number, keyof Lead>();
        headers.forEach((h, i) => {
          const f = mapHeaderToField(String(h));
          if (f) fieldMap.set(i, f);
        });
        const leads: Partial<Lead>[] = [];
        for (let i = 1; i < rows.length; i++) {
          const lead = buildLead(fieldMap, rows[i], pipelineId);
          if (lead) leads.push(lead);
        }
        resolve(leads);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsBinaryString(file);
  });
}

function parseCSV(content: string, pipelineId: string): Partial<Lead>[] {
  const lines = content.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map((h) => h.trim());
  const fieldMap = new Map<number, keyof Lead>();
  headers.forEach((h, i) => {
    const f = mapHeaderToField(h);
    if (f) fieldMap.set(i, f);
  });
  const leads: Partial<Lead>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',').map((v) => v.trim());
    const lead = buildLead(fieldMap, values, pipelineId);
    if (lead) leads.push(lead);
  }
  return leads;
}

type Phase = 'idle' | 'parsing' | 'importing' | 'done';

export function ImportWizard({ isOpen, onClose, onImport, currentPipelineId, pipelines = [] }: ImportWizardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState<ImportProgress>({ processed: 0, total: 0 });
  const [outcome, setOutcome] = useState<ImportOutcome | null>(null);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(currentPipelineId);

  useEffect(() => setSelectedPipelineId(currentPipelineId), [currentPipelineId]);

  const reset = () => {
    setFile(null);
    setPhase('idle');
    setProgress({ processed: 0, total: 0 });
    setOutcome(null);
  };

  const handleClose = () => {
    if (phase === 'importing') return;
    reset();
    onClose();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const downloadErrorReport = () => {
    if (!outcome || outcome.errors.length === 0) return;
    const csv = ['index,message', ...outcome.errors.map((e) => `${e.index},"${e.message.replace(/"/g, '""')}"`)].join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `import_errors_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async () => {
    if (!file || !selectedPipelineId) return;
    setPhase('parsing');
    setOutcome(null);

    try {
      const fname = file.name.toLowerCase();
      const ftype = file.type;
      let leads: Partial<Lead>[] = [];

      if (fname.endsWith('.xlsx') || fname.endsWith('.xls') ||
          ftype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          ftype === 'application/vnd.ms-excel') {
        leads = await parseXLSX(file, selectedPipelineId);
      } else if (fname.endsWith('.csv') || ftype === 'text/csv') {
        leads = parseCSV(await readFileAsText(file), selectedPipelineId);
      } else if (fname.endsWith('.json') || ftype === 'application/json') {
        leads = JSON.parse(await readFileAsText(file));
      } else {
        throw new Error(`Format non supporté: ${file.name}`);
      }

      if (leads.length === 0) {
        throw new Error('Aucun lead détecté. Vérifie les en-têtes (Nom, Email, Téléphone…).');
      }

      setPhase('importing');
      setProgress({ processed: 0, total: leads.length });

      const result = await onImport(leads, (p) => setProgress(p));
      setOutcome(result);
      setPhase('done');
    } catch (error) {
      setPhase('idle');
      const msg = error instanceof Error ? error.message : 'Erreur inconnue';
      setOutcome({ inserted: 0, errors: [{ index: -1, message: msg }] });
    }
  };

  const pct = progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importer des Leads" size="md">
      <div className="space-y-6">
        {phase === 'idle' && (
          <>
            <div className="text-center">
              <Upload className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-sm text-gray-600">Formats: Excel (.xlsx, .xls), CSV, JSON</p>
            </div>

            {pipelines.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pipeline de destination</label>
                <select
                  value={selectedPipelineId}
                  onChange={(e) => setSelectedPipelineId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {pipelines.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                accept=".csv,.json,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                {file ? (
                  <>
                    <CheckCircle className="text-green-500 mb-2" size={32} />
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(1)} KB</p>
                  </>
                ) : (
                  <>
                    <FileText className="text-gray-400 mb-2" size={32} />
                    <p className="text-sm font-medium text-gray-900">Sélectionner un fichier</p>
                  </>
                )}
              </label>
            </div>
          </>
        )}

        {(phase === 'parsing' || phase === 'importing') && (
          <div className="text-center py-8 space-y-4">
            <p className="text-sm font-medium text-gray-900">
              {phase === 'parsing' ? 'Lecture du fichier…' : `Import en cours: ${progress.processed} / ${progress.total}`}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 bg-indigo-600 transition-all duration-200"
                style={{ width: `${phase === 'parsing' ? 5 : pct}%` }}
              />
            </div>
            {phase === 'importing' && (
              <p className="text-xs text-gray-500">
                {pct}% — n'interrompez pas la fenêtre.
              </p>
            )}
          </div>
        )}

        {phase === 'done' && outcome && (
          <div className="space-y-3">
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-emerald-800">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">{outcome.inserted} leads importés</span>
              </div>
            </div>
            {outcome.errors.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-800 mb-2">
                  <AlertTriangle className="w-5 h-5" />
                  <span className="font-medium">{outcome.errors.length} erreurs</span>
                </div>
                <button onClick={downloadErrorReport} className="text-sm text-amber-700 underline">
                  Télécharger le rapport CSV
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <ModalFooter>
        {phase === 'idle' && (
          <>
            <Button variant="ghost" onClick={handleClose}>Annuler</Button>
            <Button variant="primary" onClick={handleImport} disabled={!file || !selectedPipelineId}>
              Importer
            </Button>
          </>
        )}
        {(phase === 'parsing' || phase === 'importing') && (
          <Button variant="ghost" disabled>Veuillez patienter…</Button>
        )}
        {phase === 'done' && (
          <Button variant="primary" onClick={handleClose}>Fermer</Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
