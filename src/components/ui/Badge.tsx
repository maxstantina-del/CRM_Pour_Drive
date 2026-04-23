/**
 * Badge primitive — chip sémantique aligné sur les tokens.
 *
 * Deux systèmes coexistent :
 *  - `tone` (nouveau) : primary / success / warning / danger / info / neutral
 *    — à préférer, utilise les tokens CSS.
 *  - `variant` (legacy) : accepte n'importe quelle StageColor string (blue,
 *    green, purple, etc.) utilisée par les pipelines custom de l'utilisateur.
 *    Mapping interne vers les tons sémantiques les plus proches.
 */

import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import type { StageColor } from '../../lib/types';

export type BadgeTone = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  /** Nouvelle API sémantique — préférer à `variant`. */
  tone?: BadgeTone;
  /** Legacy color key (StageColor). Si fourni, remplace `tone`. */
  variant?: StageColor | 'default';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  icon?: React.ReactNode;
}

const toneClass: Record<BadgeTone, string> = {
  primary: 'bg-primary-soft text-primary-soft-text',
  success: 'bg-success-soft text-success-soft-text',
  warning: 'bg-warning-soft text-warning-soft-text',
  danger: 'bg-danger-soft text-danger-soft-text',
  info: 'bg-info-soft text-info-soft-text',
  neutral: 'bg-surface-2 text-[color:var(--color-text-body)] border border-border',
};

function variantToTone(variant: string): BadgeTone {
  switch (variant) {
    case 'blue':
    case 'indigo':
      return 'primary';
    case 'green':
    case 'emerald':
      return 'success';
    case 'yellow':
    case 'amber':
    case 'orange':
      return 'warning';
    case 'red':
    case 'pink':
      return 'danger';
    case 'purple':
    case 'violet':
      return 'info';
    default:
      return 'neutral';
  }
}

const sizeClass = {
  sm: 'px-1.5 py-0.5 text-[11px] gap-1 h-5',
  md: 'px-2 py-0.5 text-[12px] gap-1.5 h-6',
  lg: 'px-2.5 py-1 text-[13px] gap-1.5 h-7',
};

export function Badge({
  tone,
  variant,
  size = 'md',
  rounded = true,
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  const effectiveTone: BadgeTone = tone ?? (variant ? variantToTone(variant) : 'neutral');

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium whitespace-nowrap',
        rounded ? 'rounded-full' : 'rounded-sm',
        toneClass[effectiveTone],
        sizeClass[size],
        className
      )}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
