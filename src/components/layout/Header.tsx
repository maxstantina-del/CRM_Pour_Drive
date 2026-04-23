/**
 * Header component with action buttons
 */

import React, { useMemo } from 'react';
import {
  Plus,
  Upload,
  Download,
  Save,
  RotateCcw,
  Calendar,
} from 'lucide-react';
import { Button } from '../ui';
import { UserMenu } from '../auth/UserMenu';
import { NotificationsBell } from '../notifications';
import { useAllFiches } from '../../contexts/FichesContext';
import { getActivityCounts } from '../../lib/activityCounts';
import type { Lead } from '../../lib/types';

export interface HeaderProps {
  leads: Lead[];
  onNewLead: () => void;
  onImport: () => void;
  onExport: () => void;
  onBackup: () => void;
  onRestore: () => void;
  onOpenLead?: (leadId: string) => void;
  onGoToActivity?: () => void;
}

export function Header({
  leads,
  onNewLead,
  onImport,
  onExport,
  onBackup,
  onRestore,
  onOpenLead,
  onGoToActivity,
}: HeaderProps) {
  const { fichesByLead } = useAllFiches();
  const { today: todayCount, overdue: overdueCount } = useMemo(
    () => getActivityCounts(leads, fichesByLead),
    [leads, fichesByLead]
  );
  const total = todayCount + overdueCount;
  const hasOverdue = overdueCount > 0;
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gestion des Leads</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
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
          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

          <Button
            variant="ghost"
            size="sm"
            icon={<Download size={16} />}
            onClick={onImport}
            title="Importer des leads (CSV, JSON)"
          >
            Import
          </Button>

          <Button
            variant="ghost"
            size="sm"
            icon={<Upload size={16} />}
            onClick={onExport}
            title="Exporter en CSV"
          >
            Export CSV
          </Button>

          {/* Backup Actions */}
          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

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

          <div className="h-8 w-px bg-gray-300 dark:bg-gray-700 mx-1" />

          {onGoToActivity && (
            <button
              type="button"
              onClick={onGoToActivity}
              title={
                hasOverdue
                  ? `${overdueCount} en retard · ${todayCount} aujourd'hui`
                  : `${todayCount} tâche${todayCount > 1 ? 's' : ''} aujourd'hui`
              }
              className={`relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-sm font-medium transition-colors ${
                hasOverdue
                  ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50'
                  : total > 0
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50'
                  : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              }`}
            >
              <Calendar size={16} />
              <span>Activité</span>
              {total > 0 && (
                <span
                  className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-xs font-bold ${
                    hasOverdue
                      ? 'bg-red-600 text-white'
                      : 'bg-blue-600 text-white'
                  }`}
                >
                  {total}
                </span>
              )}
            </button>
          )}

          <NotificationsBell onOpenLead={onOpenLead} />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
