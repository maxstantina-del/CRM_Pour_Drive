/**
 * Button primitive — typed with the design tokens.
 *
 * Ne hardcoder aucune couleur — utiliser les tokens sémantiques (primary,
 * success, warning, danger). Variants alignés sur Monday/Linear : primary
 * plein, secondary neutre, ghost discret, danger rouge, outline contour.
 */

import React, { ButtonHTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = 'left',
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed select-none';

  const variantClass: Record<string, string> = {
    primary:
      'bg-primary text-white hover:bg-primary-hover active:bg-primary-active shadow-xs',
    secondary:
      'bg-surface-2 text-[color:var(--color-text)] border border-border hover:bg-[color:var(--color-border-subtle)] hover:border-border-strong',
    success:
      'bg-success text-white hover:bg-success-hover shadow-xs',
    danger:
      'bg-danger text-white hover:bg-danger-hover shadow-xs',
    ghost:
      'bg-transparent text-[color:var(--color-text-body)] hover:bg-[color:var(--color-surface-2)] hover:text-[color:var(--color-text)]',
    outline:
      'bg-transparent border border-border-strong text-[color:var(--color-text-body)] hover:bg-[color:var(--color-surface-2)] hover:border-[color:var(--color-text-muted)]',
  };

  const sizeClass: Record<string, string> = {
    xs: 'h-7 px-2 text-[12px] gap-1',
    sm: 'h-8 px-3 text-[13px] gap-1.5',
    md: 'h-9 px-3.5 text-[13px] gap-2',
    lg: 'h-11 px-5 text-[14px] gap-2',
  };

  const isIconOnly = !children && icon;
  const iconOnlyPad = isIconOnly
    ? size === 'xs' ? 'w-7 px-0'
      : size === 'sm' ? 'w-8 px-0'
      : size === 'lg' ? 'w-11 px-0'
      : 'w-9 px-0'
    : '';

  return (
    <button
      className={cn(
        base,
        variantClass[variant],
        sizeClass[size],
        iconOnlyPad,
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Spinner />}
      {!loading && icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>}
      {children}
      {!loading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-80"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}
