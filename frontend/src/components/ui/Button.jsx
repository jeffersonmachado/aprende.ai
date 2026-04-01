import React from 'react';
import { cn } from '../../lib/cn';

const Button = React.forwardRef(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      disabled = false,
      isLoading = false,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'state-button-shell inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary:
        'bg-primary-600 text-white shadow-md shadow-primary-500/25 hover:bg-primary-700 hover:shadow-lg hover:shadow-primary-500/30 active:bg-primary-800 dark:bg-primary-700 dark:hover:bg-primary-600',
      secondary:
        'bg-secondary-100 text-secondary-800 border border-secondary-200 hover:bg-secondary-200 active:bg-secondary-300 dark:bg-secondary-900/30 dark:border-secondary-700/40 dark:text-secondary-100 dark:hover:bg-secondary-900/50',
      ghost:
        'text-muted-700 hover:bg-muted-100 active:bg-muted-200 dark:text-muted-300 dark:hover:bg-dark-800 dark:active:bg-dark-700',
      destructive:
        'bg-destructive-600 text-white hover:bg-destructive-700 active:bg-destructive-800 dark:bg-destructive-900 dark:hover:bg-destructive-800',
      outline:
        'border border-primary-200 text-primary-700 hover:bg-primary-50 active:bg-primary-100 dark:border-primary-800/50 dark:text-primary-300 dark:hover:bg-primary-900/20',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
      xl: 'px-8 py-4 text-xl',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], isLoading && 'state-button-loading', className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <svg
            className="w-5 h-5 animate-spin"
            fill="none"
            stroke="currentColor"
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
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
