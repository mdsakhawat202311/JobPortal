'use client';

import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, icon, iconRight, className, children, disabled, ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center gap-2 font-semibold transition-all active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--accent)]/30 disabled:pointer-events-none disabled:opacity-50";
    
    const sizeClasses = {
      sm: "h-9 px-4 text-sm rounded-lg",
      md: "h-11 px-6 text-sm rounded-xl",
      lg: "h-14 px-8 text-base rounded-2xl"
    };

    const variantClasses = {
      primary: "bg-gradient-to-r from-[#6FBEB2] to-[#34908B] text-white shadow-lg shadow-[#34908B]/25 hover:shadow-[#34908B]/40 hover:from-[#5AA89D] hover:to-[#277A75] border border-white/10",
      secondary: "bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--border)] shadow-sm hover:bg-[var(--bg-card-hover)] hover:border-[var(--border-hover)]",
      ghost: "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-card-hover)]",
      danger: "bg-red-500 text-white shadow-lg shadow-red-500/25 hover:bg-red-400"
    };

    const classes = cn(
      baseClasses,
      sizeClasses[size],
      variantClasses[variant],
      className
    );

    return (
      <button
        ref={ref}
        className={classes}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={size === 'sm' ? 16 : 20} />
        ) : (
          <>
            {icon && <span className="shrink-0">{icon}</span>}
            {children}
            {iconRight && <span className="shrink-0">{iconRight}</span>}
          </>
        )}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button };
