/**
 * Header component with action buttons
 */

import React from 'react';
import {
  Plus,
  Upload,
  Download,
  Save,
  RotateCcw
} from 'lucide-react';
import { Button } from '../ui';

export interface HeaderProps {
  onNewLead: () => void;
  onImport: () => void;
  onExport: () => void;
  onBackup: () => void;
  onRestore: () => void;
}

export function Header({
  onNewLead,
  onImport,
  onExport,
  onBackup,
  onRestore
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Gestion des Leads</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Gérez vos prospects et suivez votre pipeline de vente
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Primary Action */}
          <Button
            variant="primary"
            icon={<Plus size={18} />}
            onClick={onNewLead}
          >
            Nouveau Lead
          </Button>

          {/* Import/Export Actions */}
          <div className="h-8 w-px bg-gray-300 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            icon={<Upload size={16} />}
            onClick={onImport}
            title="Importer des leads (CSV, JSON)"
          >
            Import
          </Button>

          <Button
            variant="ghost"
            size="sm"
            icon={<Download size={16} />}
            onClick={onExport}
            title="Exporter en CSV"
          >
            Export CSV
          </Button>

          {/* Backup Actions */}
          <div className="h-8 w-px bg-gray-300 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            icon={<Save size={16} />}
            onClick={onBackup}
            title="Sauvegarder toutes les données"
          >
            Backup
          </Button>

          <Button
            variant="ghost"
            size="sm"
            icon={<RotateCcw size={16} />}
            onClick={onRestore}
            title="Restaurer depuis une sauvegarde"
          >
            Restaurer
          </Button>
        </div>
      </div>
    </header>
  );
}
