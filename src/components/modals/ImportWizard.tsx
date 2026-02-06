/**
 * Import wizard for CSV/JSON/XLSX files
 */

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import type { Lead } from '../../lib/types';
import { Modal, ModalFooter, Button } from '../ui';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { readFileAsText } from '../../lib/utils';

export interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (leads: Partial<Lead>[]) => void;
  currentPipelineId: string;
  pipelines?: Array<{ id: string; name: string }>;
}

/**
 * Normalize header for intelligent column mapping
 * Handles: snake_case, camelCase, spaces, accents, etc.
 */
function normalizeHeader(header: string): string {
  return header
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/[_\s-]+/g, ' ') // Replace underscores, spaces, hyphens with space
    .trim();
}

/**
 * Map a column header to a Lead field
 */
function mapHeaderToField(header: string): keyof Lead | null {
  const normalized = normalizeHeader(header);

  // Name / Nom / Project name
  if (
    normalized.includes('nom') ||
    normalized.includes('name') ||
    normalized.includes('projet') ||
    normalized.includes('project')
  ) {
    return 'name';
  }

  // Contact name / Nom du contact
  if (
    normalized.includes('contact name') ||
    normalized.includes('nom contact') ||
    normalized.includes('nom du contact') ||
    normalized === 'contact'
  ) {
    return 'contactName';
  }

  // Email / E-mail / Courriel
  if (normalized.includes('email') || normalized.includes('mail') || normalized.includes('courriel')) {
    return 'email';
  }

  // Phone / Téléphone / Tel
  if (
    normalized.includes('phone') ||
    normalized.includes('telephone') ||
    normalized.includes('tel') ||
    normalized.includes('mobile')
  ) {
    return 'phone';
  }

  // Company / Entreprise / Société
  if (
    normalized.includes('entreprise') ||
    normalized.includes('company') ||
    normalized.includes('societe') ||
    normalized.includes('society')
  ) {
    return 'company';
  }

  // SIRET
  if (normalized.includes('siret')) {
    return 'siret';
  }

  // Address / Adresse
  if (normalized.includes('adresse') || normalized.includes('address') || normalized.includes('rue')) {
    return 'address';
  }

  // City / Ville
  if (normalized.includes('ville') || normalized.includes('city')) {
    return 'city';
  }

  // Zip code / Code postal
  if (
    normalized.includes('code postal') ||
    normalized.includes('zip') ||
    normalized.includes('postal code') ||
    normalized.includes('cp')
  ) {
    return 'zipCode';
  }

  // Country / Pays
  if (normalized.includes('pays') || normalized.includes('country')) {
    return 'country';
  }

  // Value / Valeur / Montant
  if (
    normalized.includes('valeur') ||
    normalized.includes('value') ||
    normalized.includes('montant') ||
    normalized.includes('amount')
  ) {
    return 'value';
  }

  // Probability / Probabilité
  if (normalized.includes('probabilite') || normalized.includes('probability') || normalized.includes('prob')) {
    return 'probability';
  }

  // Notes / Commentaires / Comments
  if (
    normalized.includes('notes') ||
    normalized.includes('note') ||
    normalized.includes('commentaire') ||
    normalized.includes('comment')
  ) {
    return 'notes';
  }

  // Stage / Étape / Statut
  if (
    normalized.includes('stage') ||
    normalized.includes('etape') ||
    normalized.includes('statut') ||
    normalized.includes('status')
  ) {
    return 'stage';
  }

  return null;
}

export function ImportWizard({ isOpen, onClose, onImport, currentPipelineId, pipelines = [] }: ImportWizardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [selectedPipelineId, setSelectedPipelineId] = useState<string>(currentPipelineId);

  // ✅ FIX: Sync selectedPipelineId avec currentPipelineId quand il change
  React.useEffect(() => {
    setSelectedPipelineId(currentPipelineId);
  }, [currentPipelineId]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

168

    /**
       * Normalize stage value to match CRM pipeline stages
          * Maps unknown stages to "Nouveau" (default)
             */
    function normalizeStage(stage: string | undefined): string {
          if (!stage) return 'Nouveau';

                const normalized = stage.toLowerCase().trim();

          // Valid stages in the CRM
          const validStages = [
                  'Nouveau',
                  'Contacté',
                  'Qualifié',
                  'RDV Planifié',
                  'Proposition',
                  'Négociation',
                  'Gagné',
                  'Perdu'
                ];

          // Check if the stage matches any valid stage (case insensitive)
          const matchedStage = validStages.find(
                  validStage => validStage.toLowerCase() === normalized
                        );

          if (matchedStage) {
                  return matchedStage;
          }

                // Default to "Nouveau" for any unknown stage
                console.log(`⚠️  Unknown stage "${stage}" mapped to "Nouveau"`);
          return 'Nouveau';
    }
  
  
   * Parse XLSX file using SheetJS
   */
  const parseXLSX = async (file: File): Promise<Partial<Lead>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          if (!data) throw new Error('Failed to read file');

          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convert to JSON with header row
          const jsonData = XLSX.utils.sheet_to_json(worksheet, {
            header: 1,
            defval: ''
          }) as string[][];

          if (jsonData.length < 2) {
            resolve([]);
            return;
          }

          const headers = jsonData[0];
          const leads: Partial<Lead>[] = [];

          // Map headers to Lead fields
          const fieldMap = new Map<number, keyof Lead>();
          headers.forEach((header, index) => {
            const field = mapHeaderToField(String(header));
            if (field) {
              fieldMap.set(index, field);
            }
          });

          // Parse data rows
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            const lead: Partial<Lead> = { pipelineId: selectedPipelineId };

            fieldMap.forEach((field, colIndex) => {
              const value = row[colIndex];
              if (value === undefined || value === null || value === '') return;

              const stringValue = String(value).trim();

              // Type conversion based on field
              if (field === 'value' || field === 'probability') {
                const numValue = parseFloat(stringValue);
                if (!isNaN(numValue)) {
                  (lead as any)[field] = numValue;
                }

            });
          } else {
                            // Normalize stage value
                            if (field === 'stage') {
                                                (lead as any)[field] = normalizeStage(stringValue);
                            } else {
                                                (lead as any)[field] = stringValue;
                            }
          }

          resolve(leads);
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsBinaryString(file);
    });
  };

  /**
   * Parse CSV file
   */
  const parseCSV = (content: string): Partial<Lead>[] => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim());
    const leads: Partial<Lead>[] = [];

    // Map headers to Lead fields
    const fieldMap = new Map<number, keyof Lead>();
    headers.forEach((header, index) => {
      const field = mapHeaderToField(header);
      if (field) {
        fieldMap.set(index, field);
      }
    });

    // Parse data rows
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const lead: Partial<Lead> = { pipelineId: currentPipelineId };

      fieldMap.forEach((field, colIndex) => {
        const value = values[colIndex] || '';
        if (!value) return;

        // Type conversion based on field
        if (field === 'value' || field === 'probability') {
          const numValue = parseFloat(value);
          if (!isNaN(numValue)) {
            (lead as any)[field] = numValue;
          }
                // Normalize stage value
                if (field === 'stage') {
                            (lead as any)[field] = normalizeStage(value);
                } else {

                }
                } else {
          (lead as any)[field] = value;
        }
      });

      // Only add if we have at least a name or company
      if (lead.name || lead.company) {
        leads.push(lead);
      }
    }

    return leads;
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      let leads: Partial<Lead>[] = [];

      console.log('Starting import for file:', file.name, 'Size:', file.size, 'bytes', 'Type:', file.type);

      const fileName = file.name.toLowerCase();
      const fileType = file.type;

      if (
        fileName.endsWith('.xlsx') ||
        fileName.endsWith('.xls') ||
        fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        fileType === 'application/vnd.ms-excel'
      ) {
        console.log('Detected Excel file');
        leads = await parseXLSX(file);
      } else if (fileName.endsWith('.csv') || fileType === 'text/csv') {
        console.log('Detected CSV file');
        const content = await readFileAsText(file);
        leads = parseCSV(content);
      } else if (fileName.endsWith('.json') || fileType === 'application/json') {
        console.log('Detected JSON file');
        const content = await readFileAsText(file);
        leads = JSON.parse(content);
      } else {
        throw new Error(
          `Format de fichier non supporté: "${file.name}" (type: ${file.type}).\n\nUtilisez CSV, Excel (.xlsx/.xls) ou JSON`
        );
      }

      console.log('Parsed leads:', leads.length);

      if (leads.length === 0) {
        alert(
          'Aucun lead trouvé dans le fichier.\n\n' +
            'Vérifiez que votre fichier contient :\n' +
            '- Une première ligne avec des en-têtes\n' +
            '- Au moins une colonne "Nom", "Name", "Entreprise" ou "Company"\n' +
            '- Des données dans les lignes suivantes'
        );
        return;
      }

      console.log('Importing', leads.length, 'leads...');
      console.log('Sample lead:', leads[0]);
      onImport(leads);
      onClose();
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(
        `Erreur lors de l'import:\n\n${errorMessage}\n\n` +
          'Vérifiez le format de votre fichier et consultez la console (F12) pour plus de détails.'
      );
    } finally {
      setImporting(false);
      setFile(null);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Importer des Leads" size="md">
      <div className="space-y-6">
        <div className="text-center">
          <Upload className="mx-auto text-gray-400 mb-4" size={48} />
          <p className="text-sm text-gray-600">
            Formats supportés: Excel (.xlsx, .xls), CSV, JSON
          </p>
        </div>

        {pipelines.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📌 Pipeline de destination
            </label>
            <select
              value={selectedPipelineId}
              onChange={(e) => setSelectedPipelineId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {pipelines.map((pipeline) => (
                <option key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept=".csv,.json,.xlsx,.xls,text/csv,application/json,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
            {file ? (
              <>
                <CheckCircle className="text-green-500 mb-2" size={32} />
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
              </>
            ) : (
              <>
                <FileText className="text-gray-400 mb-2" size={32} />
                <p className="text-sm font-medium text-gray-900">Cliquez pour sélectionner un fichier</p>
                <p className="text-xs text-gray-500 mt-1">ou glissez-déposez votre fichier ici</p>
              </>
            )}
          </label>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium mb-2">📋 Colonnes reconnues automatiquement:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>Nom/Name, Contact, Email, Téléphone/Phone</li>
            <li>Entreprise/Company, SIRET, Adresse/Address</li>
            <li>Ville/City, Code postal/Zip, Pays/Country</li>
            <li>Valeur/Value, Probabilité, Notes, Stage</li>
          </ul>
          <p className="mt-2 text-xs text-blue-600">
            ✨ Fonctionne avec snake_case, camelCase, espaces et accents !
          </p>
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={importing}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleImport} disabled={!file || importing} loading={importing}>
          Importer
        </Button>
      </ModalFooter>
    </Modal>
  );
}
