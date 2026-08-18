import React from 'react';
import { cn } from '../../lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, leftIcon, rightIcon, type = 'text', ...props }, ref) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-foreground-secondary">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          className={cn(
            'flex h-9 w-full rounded-md border border-border bg-white px-3 py-1 text-sm text-foreground shadow-subtle transition-colors',
            'placeholder:text-foreground-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-transparent',
            'disabled:cursor-not-allowed disabled:opacity-50',
            leftIcon && 'pl-9',
            rightIcon && 'pr-9',
            error && 'border-critical focus-visible:ring-critical',
            className
          )}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-foreground-secondary">
            {rightIcon}
          </div>
        )}
        {error && <p className="mt-1 text-xs text-critical font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
