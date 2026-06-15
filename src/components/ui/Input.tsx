'use client';

import React, { forwardRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, iconRight, className, id, type, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full">
        <div className="relative group">
          {icon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--accent)] transition-colors z-10 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={inputType}
            placeholder=" " // Required for floating label peer-placeholder-shown
            className={cn(
              'peer w-full bg-[rgba(255,255,255,0.03)] border border-[var(--border)] rounded-xl px-4 pt-6 pb-2 text-[var(--text-primary)] text-base outline-none transition-all',
              'hover:border-[var(--border-hover)] focus:bg-[var(--bg-card)] focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent-subtle)]',
              icon && 'pl-11',
              (iconRight || isPassword) && 'pr-11',
              error && 'border-red-500/60 focus:border-red-500 focus:ring-red-500/10',
              className
            )}
            {...props}
          />
          {label && (
            <label 
              htmlFor={inputId} 
              className={cn(
                "absolute text-[var(--text-muted)] text-base duration-200 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] pointer-events-none",
                icon ? "left-11" : "left-4",
                "peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0",
                "peer-focus:scale-75 peer-focus:-translate-y-3 peer-focus:text-[var(--accent)]",
                error && "text-red-500 peer-focus:text-red-500"
              )}
            >
              {label}
              {props.required && <span className="text-red-400 ml-1">*</span>}
            </label>
          )}
          
          {isPassword ? (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          ) : iconRight && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
              {iconRight}
            </div>
          )}
        </div>
        {error && (
          <p className="text-sm text-red-500 mt-1.5 flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
            <AlertCircle size={14} /> {error}
          </p>
        )}
        {hint && !error && <p className="text-xs text-[var(--text-muted)] mt-1.5 ml-1">{hint}</p>}
      </div>
    );
  }
);
Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="input-label">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'input',
            error && 'border-red-500/60 focus:border-red-500',
            className
          )}
          {...props}
        />
        {error && <p className="input-error">{error}</p>}
        {hint && !error && <p className="text-xs text-[var(--text-muted)] mt-1">{hint}</p>}
      </div>
    );
  }
);
Textarea.displayName = 'Textarea';

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
          <label htmlFor={inputId} className="input-label">
            {label}
            {props.required && <span className="text-red-400 ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          id={inputId}
          className={cn(
            'input',
            'appearance-none cursor-pointer',
            error && 'border-red-500/60',
            className
          )}
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '36px' }}
          {...props}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        {error && <p className="input-error">{error}</p>}
      </div>
    );
  }
);
Select.displayName = 'Select';

export { Input, Textarea, Select };
