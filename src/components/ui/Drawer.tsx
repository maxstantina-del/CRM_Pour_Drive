/**
 * Drawer — panneau latéral coulissant (Monday/Linear/Odoo style).
 *
 * Slide depuis la droite, avec backdrop semi-transparent. Ferme sur Escape
 * ou clic outside. Bloque le scroll body pendant qu'il est ouvert.
 *
 * Usage :
 *   <Drawer isOpen={open} onClose={close} width="lg">
 *     <DrawerHeader>...</DrawerHeader>
 *     <DrawerBody>...</DrawerBody>
 *     <DrawerFooter>...</DrawerFooter>
 *   </Drawer>
 */

import React, { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Slot rendu dans le drawer. */
  children: ReactNode;
  /** Largeur : sm=420, md=560, lg=720, xl=880, fit = auto. */
  width?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
  /** Libellé accessible pour lecteurs d'écran. */
  ariaLabel?: string;
}

const widthMap: Record<NonNullable<DrawerProps['width']>, string> = {
  sm: 'w-full max-w-[420px]',
  md: 'w-full max-w-[560px]',
  lg: 'w-full max-w-[720px]',
  xl: 'w-full max-w-[880px]',
};

export function Drawer({
  isOpen,
  onClose,
  children,
  width = 'lg',
  closeOnBackdrop = true,
  closeOnEscape = true,
  ariaLabel,
}: DrawerProps) {
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isOpen, onClose, closeOnEscape]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={closeOnBackdrop ? onClose : undefined}
            className="fixed inset-0 bg-black/45 backdrop-blur-[2px] z-drawer"
            aria-hidden
          />

          {/* Panel */}
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={ariaLabel}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              'fixed top-0 right-0 bottom-0 z-drawer flex flex-col',
              'bg-surface border-l border-border shadow-xl',
              widthMap[width]
            )}
          >
            {children}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

export interface DrawerHeaderProps {
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function DrawerHeader({ children, onClose, className }: DrawerHeaderProps) {
  return (
    <div
      className={cn(
        'shrink-0 flex items-start justify-between gap-3 px-5 py-4 border-b border-border bg-surface',
        className
      )}
    >
      <div className="min-w-0 flex-1">{children}</div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer"
          className="shrink-0 p-1.5 rounded-sm text-[color:var(--color-text-muted)] hover:bg-surface-2 hover:text-[color:var(--color-text)]"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}

export function DrawerBody({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('flex-1 overflow-y-auto', className)}>
      {children}
    </div>
  );
}

export function DrawerFooter({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'shrink-0 flex items-center justify-end gap-2 px-5 py-3 border-t border-border bg-surface',
        className
      )}
    >
      {children}
    </div>
  );
}
