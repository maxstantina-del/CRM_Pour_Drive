/**
 * Tooltip primitive — CSS only, 120ms delay before showing.
 *
 * Usage :
 *   <Tooltip label="Exporter en PDF">
 *     <Button icon={<Download />} />
 *   </Tooltip>
 *
 * Note : évite le wrapping automatique, respecte le flex layout parent.
 * Fallback mobile : s'affiche au tap prolongé (comportement natif du title).
 */

import React, { useState, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface TooltipProps {
  label: ReactNode;
  children: ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const sideClass: Record<NonNullable<TooltipProps['side']>, string> = {
  top: 'bottom-full left-1/2 -translate-x-1/2 mb-1.5',
  bottom: 'top-full left-1/2 -translate-x-1/2 mt-1.5',
  left: 'right-full top-1/2 -translate-y-1/2 mr-1.5',
  right: 'left-full top-1/2 -translate-y-1/2 ml-1.5',
};

export function Tooltip({ label, children, side = 'top', className }: TooltipProps) {
  const [open, setOpen] = useState(false);
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      {open && (
        <span
          role="tooltip"
          className={cn(
            'pointer-events-none absolute z-[70] whitespace-nowrap rounded-sm px-2 py-1',
            'bg-[color:var(--color-text)] text-[color:var(--color-surface)]',
            'text-[11px] font-medium leading-tight shadow-md',
            'animate-fade-in',
            sideClass[side],
            className
          )}
        >
          {label}
        </span>
      )}
    </span>
  );
}
