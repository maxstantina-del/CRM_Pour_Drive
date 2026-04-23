/**
 * Header — barre supérieure resserrée.
 * Gauche : breadcrumb + titre de page dynamique.
 * Droite : bouton primaire Nouveau Lead + badge Activité + cloche Notifications
 * + menu ⋯ (Import / Export / Backup / Restaurer) + Avatar utilisateur.
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Plus,
  Upload,
  Download,
  Save,
  RotateCcw,
  Calendar,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import { Button, Tooltip } from '../ui';
import { UserMenu } from '../auth/UserMenu';
import { NotificationsBell } from '../notifications';
import { useAllFiches } from '../../contexts/FichesContext';
import { getActivityCounts } from '../../lib/activityCounts';
import type { Lead } from '../../lib/types';
import { cn } from '../../lib/utils';

export interface HeaderProps {
  leads: Lead[];
  /** Libellé principal affiché dans le breadcrumb (ex. "Pipeline", "Tableau"). */
  pageTitle: string;
  /** Sous-titre / contexte affiché à côté du titre (ex. nom du pipeline actif). */
  pageContext?: string;
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
  pageTitle,
  pageContext,
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
    <header className="h-14 shrink-0 bg-surface border-b border-border px-4 flex items-center justify-between gap-4">
      {/* Breadcrumb + titre dynamique */}
      <div className="min-w-0 flex items-center gap-1.5">
        <h1 className="text-[15px] font-semibold tracking-tight text-[color:var(--color-text)] truncate">
          {pageTitle}
        </h1>
        {pageContext && (
          <>
            <ChevronRight
              size={14}
              className="text-[color:var(--color-text-subtle)] shrink-0"
              aria-hidden
            />
            <span className="text-[13px] text-[color:var(--color-text-muted)] truncate">
              {pageContext}
            </span>
          </>
        )}
      </div>

      {/* Actions droite */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Button size="sm" variant="primary" icon={<Plus size={14} />} onClick={onNewLead}>
          Nouveau Lead
        </Button>

        {onGoToActivity && (
          <ActivityBadge
            total={total}
            todayCount={todayCount}
            overdueCount={overdueCount}
            hasOverdue={hasOverdue}
            onClick={onGoToActivity}
          />
        )}

        <NotificationsBell onOpenLead={onOpenLead} />

        <MoreMenu
          onImport={onImport}
          onExport={onExport}
          onBackup={onBackup}
          onRestore={onRestore}
        />

        <UserMenu />
      </div>
    </header>
  );
}

function ActivityBadge({
  total,
  todayCount,
  overdueCount,
  hasOverdue,
  onClick,
}: {
  total: number;
  todayCount: number;
  overdueCount: number;
  hasOverdue: boolean;
  onClick: () => void;
}) {
  const tooltipLabel = hasOverdue
    ? `${overdueCount} en retard · ${todayCount} aujourd'hui`
    : total > 0
    ? `${todayCount} tâche${todayCount > 1 ? 's' : ''} aujourd'hui`
    : "Aujourd'hui";

  return (
    <Tooltip label={tooltipLabel} side="bottom">
      <button
        type="button"
        onClick={onClick}
        className={cn(
          'relative flex items-center gap-1.5 h-8 px-2 rounded-sm text-[13px] font-medium transition-colors',
          hasOverdue
            ? 'text-danger hover:bg-danger-soft'
            : total > 0
            ? 'text-primary hover:bg-primary-soft'
            : 'text-[color:var(--color-text-muted)] hover:bg-surface-2'
        )}
      >
        <Calendar size={15} />
        <span>Activité</span>
        {total > 0 && (
          <span
            className={cn(
              'inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold leading-none',
              hasOverdue ? 'bg-danger text-white' : 'bg-primary text-white'
            )}
          >
            {total}
          </span>
        )}
      </button>
    </Tooltip>
  );
}

function MoreMenu({
  onImport,
  onExport,
  onBackup,
  onRestore,
}: {
  onImport: () => void;
  onExport: () => void;
  onBackup: () => void;
  onRestore: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handle = (fn: () => void) => () => {
    setOpen(false);
    fn();
  };

  return (
    <div className="relative" ref={ref}>
      <Tooltip label="Plus d'actions" side="bottom">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-haspopup="menu"
          aria-expanded={open}
          className="h-8 w-8 flex items-center justify-center rounded-sm text-[color:var(--color-text-muted)] hover:bg-surface-2 hover:text-[color:var(--color-text)]"
        >
          <MoreHorizontal size={16} />
        </button>
      </Tooltip>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1.5 w-56 bg-surface border border-border rounded-md shadow-md z-dropdown overflow-hidden animate-fade-in"
        >
          <div className="p-1">
            <MoreItem icon={<Download size={14} />} onClick={handle(onImport)}>
              Importer des leads
            </MoreItem>
            <MoreItem icon={<Upload size={14} />} onClick={handle(onExport)}>
              Exporter en CSV
            </MoreItem>
          </div>
          <div className="border-t border-border p-1">
            <MoreItem icon={<Save size={14} />} onClick={handle(onBackup)}>
              Sauvegarder tout
            </MoreItem>
            <MoreItem icon={<RotateCcw size={14} />} onClick={handle(onRestore)}>
              Restaurer une sauvegarde
            </MoreItem>
          </div>
        </div>
      )}
    </div>
  );
}

function MoreItem({
  icon,
  children,
  onClick,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-sm text-[13px] text-[color:var(--color-text-body)] hover:bg-surface-2 hover:text-[color:var(--color-text)]"
    >
      <span className="text-[color:var(--color-text-muted)]">{icon}</span>
      <span className="flex-1 text-left">{children}</span>
    </button>
  );
}
