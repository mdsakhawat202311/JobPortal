'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

/* ─────────────────────────────────────────────
   INPUT
────────────────────────────────────────────── */
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, className, id, type, placeholder, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-[13px] font-medium mb-1.5 transition-colors',
              error ? 'text-red-500' : 'text-[var(--text-secondary)]'
            )}
          >
            {label}
            {props.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div
              className={cn(
                'absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none transition-colors duration-200',
                error ? 'text-red-400' : 'text-[var(--text-muted)]'
              )}
              aria-hidden="true"
            >
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            placeholder={placeholder || label || ''}
            aria-invalid={!!error}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            className={cn(
              // Base
              'w-full rounded-xl border bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm',
              'outline-none transition-all duration-200',
              // Sizing
              'h-11 px-3.5',
              // Placeholder
              'placeholder:text-[var(--text-muted)] placeholder:text-sm',
              // States
              'hover:border-[var(--border-hover)]',
              'focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 focus:bg-[var(--bg-card)]',
              // Icon padding
              icon && 'pl-10',
              (iconRight || isPassword) && 'pr-10',
              // Error
              error
                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10'
                : 'border-[var(--border)]',
              // Disabled
              'disabled:opacity-50 disabled:cursor-not-allowed',
              className
            )}
            {...props}
          />
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-md text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]/30"
              tabIndex={-1}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          ) : iconRight ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" aria-hidden="true">
              {iconRight}
            </div>
          ) : null}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            role="alert"
            className="flex items-center gap-1.5 mt-1.5 text-[13px] text-red-500"
          >
            <AlertCircle size={13} className="shrink-0" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-[var(--text-muted)] mt-1.5">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = 'Input';

/* ─────────────────────────────────────────────
   TEXTAREA
────────────────────────────────────────────── */
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, placeholder, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-[13px] font-medium mb-1.5 transition-colors',
              error ? 'text-red-500' : 'text-[var(--text-secondary)]'
            )}
          >
            {label}
            {props.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          placeholder={placeholder || label || ''}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            'w-full rounded-xl border bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm',
            'outline-none transition-all duration-200',
            'px-3.5 py-2.5',
            'placeholder:text-[var(--text-muted)] placeholder:text-sm',
            'hover:border-[var(--border-hover)]',
            'focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 focus:bg-[var(--bg-card)]',
            'resize-y min-h-[80px]',
            error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10'
              : 'border-[var(--border)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          {...props}
        />
        {error && (
          <p id={`${inputId}-error`} role="alert" className="flex items-center gap-1.5 mt-1.5 text-[13px] text-red-500">
            <AlertCircle size={13} className="shrink-0" />
            {error}
          </p>
        )}
        {hint && !error && (
          <p id={`${inputId}-hint`} className="text-xs text-[var(--text-muted)] mt-1.5">
            {hint}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

/* ─────────────────────────────────────────────
   SELECT
────────────────────────────────────────────── */
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, placeholder, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'block text-[13px] font-medium mb-1.5 transition-colors',
              error ? 'text-red-500' : 'text-[var(--text-secondary)]'
            )}
          >
            {label}
            {props.required && <span className="text-red-400 ml-0.5">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          aria-invalid={!!error}
          className={cn(
            'w-full rounded-xl border bg-[var(--bg-elevated)] text-[var(--text-primary)] text-sm',
            'outline-none transition-all duration-200',
            'h-11 px-3.5',
            'hover:border-[var(--border-hover)]',
            'focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--accent)]/15 focus:bg-[var(--bg-card)]',
            'appearance-none cursor-pointer',
            error
              ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10'
              : 'border-[var(--border)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className
          )}
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'right 12px center',
            paddingRight: '36px',
          }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && (
          <p role="alert" className="flex items-center gap-1.5 mt-1.5 text-[13px] text-red-500">
            <AlertCircle size={13} className="shrink-0" />
            {error}
          </p>
        )}
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Input, Textarea, Select };
