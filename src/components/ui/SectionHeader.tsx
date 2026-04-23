/**
 * SectionHeader primitive — titre de section uniforme partout (vues, modals,
 * panels). Typo, espacement, slot actions droit — aligné sur Monday/Linear.
 *
 * Usage :
 *   <SectionHeader
 *     eyebrow="Pipeline Chablais"
 *     title="Leads actifs"
 *     count={93}
 *     actions={<Button>Nouveau lead</Button>}
 *   />
 */

import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface SectionHeaderProps {
  /** Petite ligne au-dessus du titre (kicker / breadcrumb). */
  eyebrow?: ReactNode;
  /** Titre principal. */
  title: ReactNode;
  /** Compteur affiché après le titre sous forme de badge neutre. */
  count?: number | string;
  /** Sous-ligne sous le titre (phrase descriptive). */
  subtitle?: ReactNode;
  /** Slot d'actions alignées à droite (boutons, filtres…). */
  actions?: ReactNode;
  /** Icône décorative avant le titre. */
  icon?: ReactNode;
  /** Taille visuelle — `page` pour les titres de vue, `section` pour les sections internes. */
  size?: 'page' | 'section' | 'compact';
  className?: string;
}

export function SectionHeader({
  eyebrow,
  title,
  count,
  subtitle,
  actions,
  icon,
  size = 'section',
  className,
}: SectionHeaderProps) {
  const titleClass =
    size === 'page' ? 'heading-lg' : size === 'compact' ? 'heading-sm' : 'heading-md';

  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-3',
        size === 'page' ? 'pb-4 border-b border-border mb-4' : 'mb-3',
        className
      )}
    >
      <div className="min-w-0 flex-1">
        {eyebrow && <p className="text-caption mb-1">{eyebrow}</p>}
        <div className="flex items-center gap-2 flex-wrap">
          {icon && <span className="shrink-0 text-[color:var(--color-text-muted)]">{icon}</span>}
          <h2 className={titleClass}>{title}</h2>
          {count !== undefined && (
            <span className="chip chip-neutral text-[11px] font-semibold">{count}</span>
          )}
        </div>
        {subtitle && (
          <p className="mt-1 text-[13px] text-[color:var(--color-text-muted)]">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
