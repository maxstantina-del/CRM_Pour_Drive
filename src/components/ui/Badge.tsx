/**
 * Reusable Badge component
 */

import React, { HTMLAttributes } from 'react';
import { cn } from '../../lib/utils';
import type { StageColor } from '../../lib/types';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: StageColor | 'default';
  size?: 'sm' | 'md' | 'lg';
  rounded?: boolean;
  icon?: React.ReactNode;
}

export function Badge({
  variant = 'default',
  size = 'md',
  rounded = false,
  icon,
  className,
  children,
  ...props
}: BadgeProps) {
  const variantStyles: Record<string, string> = {
    default: 'bg-gray-100 text-gray-800 border-gray-300',
    blue: 'bg-blue-100 text-blue-800 border-blue-300',
    yellow: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    green: 'bg-green-100 text-green-800 border-green-300',
    purple: 'bg-purple-100 text-purple-800 border-purple-300',
    orange: 'bg-orange-100 text-orange-800 border-orange-300',
    red: 'bg-red-100 text-red-800 border-red-300',
    gray: 'bg-gray-100 text-gray-800 border-gray-300',
    pink: 'bg-pink-100 text-pink-800 border-pink-300',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-300'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs gap-1',
    md: 'px-2.5 py-1 text-sm gap-1.5',
    lg: 'px-3 py-1.5 text-base gap-2'
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border',
        rounded ? 'rounded-full' : 'rounded-md',
        variantStyles[variant] || variantStyles.default,
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}
