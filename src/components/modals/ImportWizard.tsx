/**
 * Import wizard for CSV/JSON/Excel files
 */

import React, { useState } from 'react';
import type { Lead } from '../../lib/types';
import { Modal, ModalFooter, Button } from '../ui';
import { Upload, FileText, CheckCircle } from 'lucide-react';
import { readFileAsText } from '../../lib/utils';
import * as XLSX from 'xlsx';

export interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (leads: Partial<Lead>[]) => void;
  currentPipelineId: string;
}

export function ImportWizard({ isOpen, onClose, onImport, currentPipelineId }: ImportWizardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const parseCSV = (content: string): Partial<Lead>[] => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const leads: Partial<Lead>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      const lead: Partial<Lead> = { pipelineId: currentPipelineId };

      headers.forEach((header, index) => {
        const value = values[index] || '';
        // Map common CSV headers to Lead fields
        if (header.includes('nom') || header.includes('name')) lead.name = value;
        if (header.includes('contact')) lead.contactName = value;
        if (header.includes('email')) lead.email = value;
        if (header.includes('phone') || header.includes('téléphone')) lead.phone = value;
        if (header.includes('entreprise') || header.includes('company')) lead.company = value;
        if (header.includes('siret')) lead.siret = value;
        if (header.includes('ville') || header.includes('city')) lead.city = value;
        if (header.includes('adresse') || header.includes('address')) lead.address = value;
        if (header.includes('code postal') || header.includes('zip')) lead.zipCode = value;
        if (header.includes('pays') || header.includes('country')) lead.country = value;
        if (header.includes('valeur') || header.includes('value')) lead.value = parseFloat(value) || 0;
        if (header.includes('notes')) lead.notes = value;
      });

      if (lead.name) {
        leads.push(lead);
      }
    }

    return leads;
  };

  const parseExcel = (file: File): Promise<Partial<Lead>[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = e.target?.result;
          // Utiliser ArrayBuffer au lieu de binary string
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { defval: '' });

          console.log('Excel headers detected:', jsonData.length > 0 ? Object.keys(jsonData[0]) : 'No data');
          console.log('First row sample:', jsonData[0]);

          const leads: Partial<Lead>[] = jsonData.map((row: any) => {
            // Mapper les colonnes de manière flexible
            const lead: Partial<Lead> = {
              // Nom du projet (requis)
              name: row['Nom du projet'] || row['Nom'] || row['Name'] || row['name'] ||
                    row['Projet'] || row['projet'] || '',

              // Contact
              contactName: row['Nom du contact'] || row['Contact'] || row['contact'] ||
                          row['Nom contact'] || row['contact_name'] || row['contactName'] || '',

              // Email
              email: row['Email'] || row['email'] || row['E-mail'] || row['e-mail'] || '',

              // Téléphone
              phone: row['Téléphone'] || row['Phone'] || row['phone'] || row['Tel'] ||
                    row['tel'] || row['Telephone'] || row['mobile'] || '',

              // Entreprise
              company: row['Entreprise'] || row['Company'] || row['company'] ||
                      row['entreprise'] || row['Société'] || row['société'] || '',

              // SIRET
              siret: row['SIRET'] || row['Siret'] || row['siret'] || '',

              // Adresse
              address: row['Adresse'] || row['Address'] || row['address'] || row['adresse'] || '',

              // Ville
              city: row['Ville'] || row['City'] || row['city'] || row['ville'] || '',

              // Code postal
              zipCode: String(row['Code postal'] || row['Zip'] || row['zip'] ||
                             row['Code Postal'] || row['CP'] || row['cp'] ||
                             row['postal_code'] || row['postalCode'] || ''),

              // Pays
              country: row['Pays'] || row['Country'] || row['country'] || row['pays'] || 'France',

              // Valeur
              value: parseFloat(String(row['Valeur'] || row['Value'] || row['value'] ||
                                      row['valeur'] || row['Montant'] || row['montant'] || 0)),

              // Notes
              notes: row['Notes'] || row['notes'] || row['Note'] || row['note'] ||
                    row['Description'] || row['description'] || '',

              // Stage (si présent dans le fichier)
              stage: row['stage'] || row['Stage'] || row['Étape'] || undefined,

              // Pipeline ID
              pipelineId: currentPipelineId
            };

            return lead;
          }).filter((lead: Partial<Lead>) => {
            // Vérifier qu'il y a au moins un nom ou une entreprise
            const hasData = lead.name || lead.company || lead.contactName;
            if (!hasData) {
              console.warn('Lead skipped (no name, company or contact):', lead);
            }
            return hasData;
          });

          console.log(`${leads.length} leads parsed from Excel file`);

          if (leads.length === 0) {
            reject(new Error('Aucun lead trouvé dans le fichier. Vérifiez que le fichier contient au moins une colonne "Nom", "Name", "Entreprise" ou "Company".'));
            return;
          }

          resolve(leads);
        } catch (error) {
          console.error('Excel parsing error:', error);
          reject(error);
        }
      };
      reader.onerror = (error) => {
        console.error('FileReader error:', error);
        reject(error);
      };
      // Utiliser readAsArrayBuffer au lieu de readAsBinaryString (obsolète)
      reader.readAsArrayBuffer(file);
    });
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    try {
      let leads: Partial<Lead>[] = [];

      console.log('Starting import for file:', file.name, 'Size:', file.size, 'bytes', 'Type:', file.type);

      // Détection plus robuste du type de fichier
      const fileName = file.name.toLowerCase();
      const fileType = file.type;
      const isExcel = fileName.endsWith('.xlsx') ||
                     fileName.endsWith('.xls') ||
                     fileType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
                     fileType === 'application/vnd.ms-excel';
      const isCSV = fileName.endsWith('.csv') || fileType === 'text/csv';
      const isJSON = fileName.endsWith('.json') || fileType === 'application/json';

      if (isCSV) {
        console.log('Detected CSV file');
        const content = await readFileAsText(file);
        leads = parseCSV(content);
      } else if (isJSON) {
        console.log('Detected JSON file');
        const content = await readFileAsText(file);
        leads = JSON.parse(content);
      } else if (isExcel) {
        console.log('Detected Excel file');
        leads = await parseExcel(file);
      } else {
        throw new Error(`Format de fichier non supporté: "${file.name}" (type: ${file.type}).\n\nUtilisez CSV, JSON, ou Excel (.xlsx, .xls)`);
      }

      console.log('Parsed leads:', leads.length);

      if (leads.length === 0) {
        alert('Aucun lead trouvé dans le fichier.\n\nVérifiez que votre fichier contient :\n- Une première ligne avec des en-têtes\n- Au moins une colonne "Nom", "Name", "Entreprise" ou "Company"\n- Des données dans les lignes suivantes');
        return;
      }

      if (leads.length > 0) {
        console.log('Importing', leads.length, 'leads...');
        onImport(leads);
        onClose();
      }
    } catch (error) {
      console.error('Import error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(`Erreur lors de l'import:\n\n${errorMessage}\n\nVérifiez le format de votre fichier et consultez la console (F12) pour plus de détails.`);
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
            Formats supportés: CSV, JSON, Excel (.xlsx, .xls)
          </p>
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <input
            type="file"
            accept="*/*"
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center"
          >
            {file ? (
              <>
                <CheckCircle className="text-green-500 mb-2" size={32} />
                <p className="text-sm font-medium text-gray-900">{file.name}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
              </>
            ) : (
              <>
                <FileText className="text-gray-400 mb-2" size={32} />
                <p className="text-sm font-medium text-gray-900">
                  Cliquez pour sélectionner un fichier
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  ou glissez-déposez votre fichier ici
                </p>
              </>
            )}
          </label>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
          <p className="font-medium mb-2">Format attendu:</p>
          <ul className="list-disc list-inside space-y-1 text-xs">
            <li>CSV: première ligne = en-têtes, lignes suivantes = données</li>
            <li>JSON: tableau d'objets avec les propriétés des leads</li>
            <li>Excel: première feuille avec en-têtes en première ligne</li>
          </ul>
        </div>
      </div>

      <ModalFooter>
        <Button variant="ghost" onClick={onClose} disabled={importing}>
          Annuler
        </Button>
        <Button
          variant="primary"
          onClick={handleImport}
          disabled={!file || importing}
          loading={importing}
        >
          Importer
        </Button>
      </ModalFooter>
    </Modal>
  );
}
