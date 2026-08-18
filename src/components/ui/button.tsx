import React from 'react';
import { cn } from '../../lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98]';

    const variants = {
      primary:
        'bg-primary-600 text-white shadow-sm hover:bg-primary-700 active:bg-primary-800',
      secondary:
        'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300',
      outline:
        'border border-border bg-white text-gray-700 hover:bg-surface-subtle active:bg-surface-hover shadow-subtle',
      ghost:
        'text-gray-700 hover:bg-gray-100 hover:text-gray-900 active:bg-gray-200',
      danger:
        'bg-critical text-white shadow-sm hover:bg-rose-700 active:bg-rose-800',
      success:
        'bg-success text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800',
    };

    const sizes = {
      xs: 'h-7 px-2 text-xs rounded-sm gap-1',
      sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
      md: 'h-9 px-3.5 text-sm rounded-md gap-2',
      lg: 'h-11 px-5 text-base rounded-md gap-2.5',
      icon: 'h-9 w-9 rounded-md justify-center p-0',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';
