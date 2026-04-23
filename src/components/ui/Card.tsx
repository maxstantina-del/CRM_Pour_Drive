/**
 * Card primitive — surfaces sémantiques alignées sur les tokens.
 *
 *  - `default`  : surface standard, bordure fine, ombre xs
 *  - `raised`   : surface surélevée, ombre sm (ex. modales, drawers)
 *  - `panel`    : surface imbriquée, fond gris subtil, pas d'ombre
 *  - `outlined` : contour 1px plus marqué, pas d'ombre
 */

import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'raised' | 'panel' | 'outlined' | 'elevated';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

const variantClass: Record<NonNullable<CardProps['variant']>, string> = {
  default: 'bg-surface border border-border shadow-xs',
  raised: 'bg-surface border border-border shadow-sm',
  panel: 'bg-surface-2 border border-border-subtle',
  outlined: 'bg-surface border border-border-strong',
  // Legacy alias kept to avoid breaking existing call sites.
  elevated: 'bg-surface border border-border shadow-md',
};

const paddingClass: Record<NonNullable<CardProps['padding']>, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

export function Card({
  variant = 'default',
  padding = 'md',
  hover = false,
  className,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        'rounded-md transition-colors',
        variantClass[variant],
        paddingClass[padding],
        hover && 'cursor-pointer hover:border-border-strong hover:shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('pb-3 border-b border-border flex items-center justify-between gap-3', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('heading-sm', className)} {...props}>
      {children}
    </h3>
  );
}

export function CardBody({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('py-3', className)} {...props}>
      {children}
    </div>
  );
}

export function CardFooter({ children, className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('pt-3 border-t border-border', className)} {...props}>
      {children}
    </div>
  );
}
