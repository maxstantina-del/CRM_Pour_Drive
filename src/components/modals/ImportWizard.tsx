/**
 * Import wizard: file select → parse preview → manual mapping → bulk insert → report.
 * Separates parsing (importParsers) from UI state so the mapping step can be shown safely.
 */

import { useEffect, useState, type ChangeEvent } from 'react';
import type { Lead } from '../../lib/types';
import { Modal, ModalFooter, Button } from '../ui';
import { Upload, FileText, CheckCircle, AlertTriangle, ArrowLeft } from 'lucide-react';
import {
  type LeadField,
  type PreviewData,
  parseFilePreview,
  autoDetectMapping,
  applyMapping,
  isMappingValid,
  isMappingAutoSkippable,
  buildPreview,
} from '../../lib/importParsers';
import { ImportMappingPanel } from './ImportMappingPanel';

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

type Phase = 'idle' | 'parsing' | 'mapping' | 'importing' | 'done';

export function ImportWizard({ isOpen, onClose, onImport, currentPipelineId, pipelines = [] }: ImportWizardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [preview, setPreview] = useState<PreviewData | null>(null);
  const [mapping, setMapping] = useState<Record<number, LeadField>>({});
  const [progress, setProgress] = useState<ImportProgress>({ processed: 0, total: 0 });
  const [outcome, setOutcome] = useState<ImportOutcome | null>(null);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(currentPipelineId);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => setSelectedPipelineId(currentPipelineId), [currentPipelineId]);

  const reset = () => {
    setFile(null);
    setPhase('idle');
    setPreview(null);
    setMapping({});
    setProgress({ processed: 0, total: 0 });
    setOutcome(null);
    setParseError(null);
  };

  const handleClose = () => {
    if (phase === 'parsing' || phase === 'importing') return;
    reset();
    onClose();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const runImport = async (
    data: PreviewData,
    finalMapping: Record<number, LeadField>,
    pipelineId: string
  ) => {
    const leads = applyMapping(data.headers, data.rows, finalMapping, pipelineId);
    if (leads.length === 0) {
      setParseError('Aucun lead valide avec le mapping actuel.');
      setPhase('mapping');
      return;
    }
    setPhase('importing');
    setProgress({ processed: 0, total: leads.length });
    try {
      const result = await onImport(leads, setProgress);
      setOutcome(result);
      setPhase('done');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setOutcome({ inserted: 0, errors: [{ index: -1, message: msg }] });
      setPhase('done');
    }
  };

  /** Parse file then auto-skip to import if mapping is strong; otherwise show mapping. */
  const handleParseAndImport = async () => {
    if (!file || !selectedPipelineId) return;
    setPhase('parsing');
    setParseError(null);
    try {
      const data = await parseFilePreview(file);
      if (data.rows.length === 0) throw new Error('Aucune ligne de données.');
      const auto = autoDetectMapping(data.headers);
      setPreview(data);
      setMapping(auto);
      if (isMappingAutoSkippable(auto)) {
        await runImport(data, auto, selectedPipelineId);
      } else {
        setPhase('mapping');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de lecture';
      setParseError(msg);
      setPhase('idle');
    }
  };

  /** Force the mapping screen even when auto-detection would have been enough. */
  const handleParseShowMapping = async () => {
    if (!file || !selectedPipelineId) return;
    setPhase('parsing');
    setParseError(null);
    try {
      const data = await parseFilePreview(file);
      if (data.rows.length === 0) throw new Error('Aucune ligne de données.');
      setPreview(data);
      setMapping(autoDetectMapping(data.headers));
      setPhase('mapping');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur de lecture';
      setParseError(msg);
      setPhase('idle');
    }
  };

  const handleBackToFile = () => {
    setPreview(null);
    setMapping({});
    setPhase('idle');
  };

  const handleHeaderRowShift = (nextIndex: number) => {
    if (!preview) return;
    const next = buildPreview(preview.allRows, nextIndex, preview.fileName);
    setPreview(next);
    setMapping(autoDetectMapping(next.headers));
  };

  const handleConfirmMapping = async () => {
    if (!preview || !isMappingValid(mapping) || !selectedPipelineId) return;
    await runImport(preview, mapping, selectedPipelineId);
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

  const pct = progress.total > 0 ? Math.round((progress.processed / progress.total) * 100) : 0;

  const modalSize = phase === 'mapping' ? 'lg' : 'md';

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Importer des Leads" size={modalSize}>
      <div className="space-y-6">
        {phase === 'idle' && (
          <>
            <div className="text-center">
              <Upload className="mx-auto text-gray-400 mb-4" size={48} />
              <p className="text-sm text-gray-600">Formats : Excel (.xlsx, .xls), CSV, JSON</p>
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

            {parseError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {parseError}
              </div>
            )}
          </>
        )}

        {phase === 'parsing' && (
          <div className="text-center py-8">
            <p className="text-sm font-medium text-gray-900">Analyse du fichier…</p>
          </div>
        )}

        {phase === 'mapping' && preview && (
          <ImportMappingPanel
            preview={preview}
            mapping={mapping}
            onMappingChange={setMapping}
            onHeaderRowChange={handleHeaderRowShift}
          />
        )}

        {phase === 'importing' && (
          <div className="text-center py-8 space-y-4">
            <p className="text-sm font-medium text-gray-900">
              Import en cours : {progress.processed} / {progress.total}
            </p>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className="h-3 bg-indigo-600 transition-all duration-200"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{pct}% — n'interrompez pas la fenêtre.</p>
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
            <Button variant="outline" onClick={handleParseShowMapping} disabled={!file || !selectedPipelineId}>
              Vérifier le mapping
            </Button>
            <Button variant="primary" onClick={handleParseAndImport} disabled={!file || !selectedPipelineId}>
              Importer
            </Button>
          </>
        )}
        {phase === 'mapping' && (
          <>
            <Button variant="ghost" icon={<ArrowLeft size={14} />} onClick={handleBackToFile}>
              Retour
            </Button>
            <Button variant="primary" onClick={handleConfirmMapping} disabled={!isMappingValid(mapping)}>
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
