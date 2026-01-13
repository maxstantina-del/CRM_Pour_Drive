import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ArrowRight, Check, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { Lead } from '../../lib/types';

interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (leads: Partial<Lead>[]) => Promise<void>;
}

type ImportStep = 'upload' | 'mapping' | 'preview';

interface ColumnMapping {
  csvHeader: string;
  field: keyof Lead | 'ignore';
}

const CRM_FIELDS: { key: keyof Lead; label: string; required?: boolean }[] = [
  { key: 'name', label: 'Nom du projet / Lead', required: true },
  { key: 'contactName', label: 'Nom du contact' },
  { key: 'jobTitle', label: 'Poste' },
  { key: 'company', label: 'Entreprise' },
  { key: 'siret', label: 'SIRET' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Téléphone (Fixe)' },
  { key: 'mobile', label: 'Téléphone (Mobile)' },
  { key: 'address', label: 'Adresse (Rue)' },
  { key: 'postalCode', label: 'Code Postal' },
  { key: 'city', label: 'Ville' },
  { key: 'country', label: 'Pays' },
  { key: 'source', label: 'Source (ex: Google)' },
  { key: 'value', label: 'Valeur (€)' },
  { key: 'website', label: 'Site Web' },
  { key: 'linkedin', label: 'LinkedIn' },
  { key: 'offerUrl', label: 'Lien Offre' },
  { key: 'stage', label: 'Étape (slug)' },
  { key: 'notes', label: 'Notes' },
];

const FIELD_ALIASES: Record<string, keyof Lead> = {
  // Contact name aliases
  'nom complet': 'contactName',
  'prenom': 'contactName',
  'prénom': 'contactName',
  'contact': 'contactName',
  'nom du contact': 'contactName',
  'full name': 'contactName',
  'first name': 'contactName',
  'last name': 'contactName',
  'name': 'contactName',

  // Project/Lead name aliases
  'nom': 'name',
  'projet': 'name',
  'nom du projet': 'name',
  'titre': 'name',
  'sujet': 'name',
  'lead': 'name',
  'prospect': 'name',
  'exemple offre': 'name',

  // Job Title aliases
  'poste': 'jobTitle',
  'fonction': 'jobTitle',
  'titre du poste': 'jobTitle',
  'job': 'jobTitle',
  'job title': 'jobTitle',
  'position': 'jobTitle',
  'role': 'jobTitle',
  'rôle': 'jobTitle',

  // Company aliases
  'societe': 'company',
  'société': 'company',
  'entreprise': 'company',
  'nom entreprise': 'company',
  'nom de l\'entreprise': 'company',
  'nom de la société': 'company',
  'company name': 'company',
  'business name': 'company',
  'domaine': 'company',
  'organization': 'company',
  'organisation': 'company',
  'compagnie': 'company',
  'raison sociale': 'company',
  'company': 'company',
  'firm': 'company',

  // Siret
  'siret': 'siret',
  'siren': 'siret',
  'tva': 'siret',
  'vat': 'siret',
  'numero tva': 'siret',
  'numéro tva': 'siret',

  // Phone aliases
  'telephone': 'phone',
  'téléphone': 'phone',
  'tel': 'phone',
  'tél': 'phone',
  'fixe': 'phone',
  'tel fixe': 'phone',
  'telephone societe': 'phone',
  
  // Mobile aliases
  'mobile': 'mobile',
  'portable': 'mobile',
  'cell': 'mobile',
  'gsm': 'mobile',
  'telephone portable': 'mobile',
  'téléphone portable': 'mobile',

  // Email aliases
  'email': 'email',
  'e-mail': 'email',
  'courriel': 'email',
  'mail': 'email',
  'adresse email': 'email',

  // Address aliases
  'adresse': 'address',
  'rue': 'address',
  'address': 'address',
  'street': 'address',
  'voie': 'address',
  'localisation': 'address',

  // City aliases
  'ville': 'city',
  'city': 'city',
  'commune': 'city',
  'localite': 'city',
  'town': 'city',

  // Postal Code aliases
  'code postal': 'postalCode',
  'cp': 'postalCode',
  'zip': 'postalCode',
  'zip code': 'postalCode',
  'postal code': 'postalCode',
  'code': 'postalCode',

  // Country aliases
  'pays': 'country',
  'country': 'country',
  'nation': 'country',

  // Website aliases
  'site': 'website',
  'site web': 'website',
  'website': 'website',
  'url': 'website',
  'lien': 'website',
  'web': 'website',

  // LinkedIn aliases
  'linkedin': 'linkedin',
  'li': 'linkedin',
  'profil linkedin': 'linkedin',
  'url linkedin': 'linkedin',

  // Source aliases
  'source': 'source',
  'origine': 'source',
  'canal': 'source',
  'provenance': 'source',

  // Notes aliases
  'notes': 'notes',
  'description': 'notes',
  'commentaire': 'notes',
  'remarques': 'notes',
  'infos': 'notes',
  'details': 'notes',
};

export function ImportWizard({ isOpen, onClose, onImport }: ImportWizardProps) {
  const [step, setStep] = useState<ImportStep>('upload');
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [viewMode, setViewMode] = useState<'csv' | 'crm'>('crm');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.name.endsWith('.csv')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        parseCSV(text);
      };
      reader.readAsText(file);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    // Basic CSV parser (handles quotes roughly)
    const lines = text.split(/\r?\n/).filter(line => line.trim());
    if (lines.length < 2) return;

    const headers = lines[0].split(/[;,]/).map(h => h.trim().replace(/^"|"$/g, ''));
    
    const data = lines.slice(1).map(line => {
      const values = line.split(/[;,]/).map(v => v.trim().replace(/^"|"$/g, ''));
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] || '';
        return obj;
      }, {} as any);
    });

    setHeaders(headers);
    setCsvData(data);
    
    // Auto-map fields
    const initialMappings: ColumnMapping[] = headers.map(header => {
      const normalizedHeader = header.toLowerCase().trim();
      const matchedField = FIELD_ALIASES[normalizedHeader];
      
      // Special logic for full name splitting if needed, but for now simple mapping
      if (matchedField) {
        return { csvHeader: header, field: matchedField };
      }
      
      return { csvHeader: header, field: 'ignore' };
    });

    setMappings(initialMappings);
    setStep('mapping');
  };

  const updateMapping = (index: number, field: string) => {
    const newMappings = [...mappings];
    newMappings[index] = { 
      ...newMappings[index], 
      field: field as keyof Lead | 'ignore' 
    };
    setMappings(newMappings);
  };

  const handleFieldAssignment = (crmField: keyof Lead, headerIndex: string) => {
    const newMappings = [...mappings];
    // Remove this field from other mappings
    newMappings.forEach(m => {
        if (m.field === crmField) m.field = 'ignore';
    });

    if (headerIndex !== '') {
        const idx = parseInt(headerIndex);
        if (!isNaN(idx) && idx >= 0 && idx < newMappings.length) {
            newMappings[idx].field = crmField;
        }
    }
    setMappings(newMappings);
  };

  const processImport = async () => {
    setIsProcessing(true);
    try {
      const leads: Partial<Lead>[] = csvData.map(row => {
        const lead: any = {};
        
        mappings.forEach(mapping => {
          if (mapping.field !== 'ignore') {
            const value = row[mapping.csvHeader];
            if (value) {
                // Handle numeric values
                if (mapping.field === 'value') {
                    lead[mapping.field] = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
                } else {
                    lead[mapping.field] = value;
                }
            }
          }
        });

        // Set default name if missing but contact exists
        if (!lead.name && lead.contactName) {
            lead.name = `Lead ${lead.contactName}`;
        } else if (!lead.name && lead.company) {
            lead.name = `Projet ${lead.company}`;
        }

        return lead;
      }).filter(l => l.name || l.contactName || l.company); // Filter empty rows

      await onImport(leads);
      onClose();
      // Reset state
      setStep('upload');
      setCsvData([]);
    } catch (error) {
      console.error('Import failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-[#1a1d21] w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl flex flex-col border border-white/10"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="text-accent-blue" />
              Importer des leads
            </h2>
            <p className="text-gray-400 text-sm mt-1">
              {step === 'upload' && 'Étape 1 : Sélectionnez votre fichier CSV'}
              {step === 'mapping' && 'Étape 2 : Vérifiez la correspondance des colonnes'}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {step === 'upload' && (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`h-full flex flex-col items-center justify-center space-y-6 py-12 border-2 border-dashed rounded-xl transition-colors ${
                isDragging 
                  ? 'border-accent-blue bg-accent-blue/10' 
                  : 'border-white/10 bg-white/5'
              }`}
            >
              <div className="w-20 h-20 bg-accent-blue/10 rounded-full flex items-center justify-center">
                <Upload size={40} className="text-accent-blue" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-medium text-white mb-2">
                  Glissez-déposez votre fichier CSV ici
                </h3>
                <p className="text-gray-400 mb-6">ou cliquez pour parcourir vos fichiers</p>
                <input
                  type="file"
                  accept=".csv"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2.5 bg-accent-blue hover:bg-accent-blue/80 text-white rounded-lg font-medium transition-colors"
                >
                  Sélectionner un fichier
                </button>
              </div>
              <div className="text-xs text-gray-500 mt-4">
                Formats acceptés : .csv (séparateur virgule ou point-virgule)
              </div>
            </div>
          )}

          {step === 'mapping' && (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Correspondance des champs</h3>
                    <div className="flex gap-2 bg-dark-900 p-1 rounded-lg border border-white/10">
                        <button
                            onClick={() => setViewMode('crm')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${ viewMode === 'crm' 
                                ? 'bg-accent-blue text-white' 
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            Vue par Champs CRM
                        </button>
                        <button
                            onClick={() => setViewMode('csv')}
                            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${ viewMode === 'csv' 
                                ? 'bg-accent-blue text-white' 
                                : 'bg-white/5 text-gray-400 hover:bg-white/10'
                            }`}
                        >
                            Vue par Colonnes CSV
                        </button>
                    </div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex gap-3 text-yellow-200 text-sm">
                    <AlertCircle size={20} className="shrink-0" />
                    <p>Associez les colonnes de votre fichier aux champs du CRM.</p>
                </div>

                <div className="space-y-4">
                    {viewMode === 'csv' ? (
                        mappings.map((mapping, index) => (
                            <div key={index} className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center p-3 bg-white/5 rounded-lg border border-white/5">
                                <div className="text-sm font-medium text-white truncate" title={mapping.csvHeader}>
                                    {mapping.csvHeader}
                                </div>
                                <ArrowRight size={16} className="text-gray-500" />
                                <select
                                    value={mapping.field}
                                    onChange={(e) => updateMapping(index, e.target.value)}
                                    className="bg-dark-900 border border-white/10 rounded px-3 py-2 text-sm text-gray-300 focus:border-accent-blue outline-none"
                                >
                                    <option value="ignore" className="text-gray-500">IGNORER</option>
                                    {CRM_FIELDS.map(field => (
                                        <option key={field.key} value={field.key}>
                                            {field.label} {field.required ? '*' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        ))
                    ) : (
                        [...CRM_FIELDS].sort((a, b) => {
                            const isMappedA = mappings.some(m => m.field === a.key);
                            const isMappedB = mappings.some(m => m.field === b.key);
                            if (isMappedA && !isMappedB) return -1;
                            if (!isMappedA && isMappedB) return 1;
                            return 0;
                        }).map((crmField) => {
                            const assignedHeaderIndex = mappings.findIndex(m => m.field === crmField.key);
                            
                            return (
                                <div key={crmField.key} className="grid grid-cols-[1fr,auto,1fr] gap-4 items-center p-3 bg-white/5 rounded-lg border border-white/5">
                                    <div className="text-sm font-medium text-white">
                                        {crmField.label} {crmField.required && <span className="text-red-400">*</span>}
                                    </div>
                                    <ArrowRight size={16} className="text-gray-500" />
                                    <select
                                        value={assignedHeaderIndex !== -1 ? assignedHeaderIndex : ''}
                                        onChange={(e) => handleFieldAssignment(crmField.key, e.target.value)}
                                        className={`bg-dark-900 border border-white/10 rounded px-3 py-2 text-sm focus:border-accent-blue outline-none ${ assignedHeaderIndex !== -1 ? 'text-accent-blue font-medium' : 'text-gray-500'}`}
                                    >
                                        <option value="">-- Non assigné --</option>
                                        {headers.map((header, idx) => (
                                            <option key={idx} value={idx}>
                                                {header}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex justify-end gap-3 bg-white/5">
          {step !== 'upload' && (
            <button
              onClick={() => setStep('upload')}
              className="px-4 py-2 text-gray-300 hover:text-white transition-colors"
            >
              Retour
            </button>
          )}

          {step === 'mapping' && (
            <button
              onClick={processImport}
              disabled={isProcessing}
              className="px-6 py-2 bg-accent-blue hover:bg-accent-blue/80 text-white rounded-lg font-medium flex items-center gap-2 transition-colors shadow-lg shadow-accent-blue/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Traitement en cours...
                </>
              ) : (
                <>
                  <Check size={18} />
                  Importer {csvData.length} leads
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}