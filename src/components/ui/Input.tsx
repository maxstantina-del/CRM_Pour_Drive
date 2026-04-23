/**
 * Input + Textarea primitives aligned on the design tokens.
 * Uses focus-visible ring via tokens, consistent height with Button sizes.
 */

import React, { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  inputSize?: 'sm' | 'md' | 'lg';
}

const inputSizeClass = {
  sm: 'h-8 px-2.5 text-[13px]',
  md: 'h-9 px-3 text-[13px]',
  lg: 'h-11 px-3.5 text-[14px]',
} as const;

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, icon, fullWidth = false, inputSize = 'md', className, type, ...props }, ref) => {
    const inputId = props.id || `input-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-[12px] font-medium text-[color:var(--color-text-body)]"
          >
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-subtle)]">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type ?? 'text'}
            className={cn(
              'w-full rounded-md border transition-colors',
              'bg-surface text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-subtle)]',
              'focus:outline-none focus:border-primary focus:shadow-focus',
              'disabled:bg-[color:var(--color-surface-2)] disabled:cursor-not-allowed disabled:text-[color:var(--color-text-subtle)]',
              error
                ? 'border-danger focus:border-danger focus:shadow-focus'
                : 'border-border hover:border-border-strong',
              icon ? 'pl-9' : '',
              inputSizeClass[inputSize],
              className
            )}
            {...props}
          />
        </div>

        {error && <p className="text-[12px] text-danger">{error}</p>}
        {helperText && !error && (
          <p className="text-[12px] text-[color:var(--color-text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

/**
 * Textarea variant
 */
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, helperText, fullWidth = false, className, ...props }, ref) => {
    const textareaId = props.id || `textarea-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className={cn('flex flex-col gap-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={textareaId}
            className="text-[12px] font-medium text-[color:var(--color-text-body)]"
          >
            {label}
            {props.required && <span className="text-danger ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            'w-full px-3 py-2 rounded-md border transition-colors resize-vertical text-[13px]',
            'bg-surface text-[color:var(--color-text)] placeholder:text-[color:var(--color-text-subtle)]',
            'focus:outline-none focus:border-primary focus:shadow-focus',
            'disabled:bg-[color:var(--color-surface-2)] disabled:cursor-not-allowed disabled:text-[color:var(--color-text-subtle)]',
            error
              ? 'border-danger focus:border-danger focus:shadow-focus'
              : 'border-border hover:border-border-strong',
            className
          )}
          {...props}
        />

        {error && <p className="text-[12px] text-danger">{error}</p>}
        {helperText && !error && (
          <p className="text-[12px] text-[color:var(--color-text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
