import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '../../lib/cn';

const Alert = React.forwardRef(
  (
    {
      variant = 'info',
      title,
      description,
      onClose,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const variants = {
      info: {
        bg: 'bg-blue-50 dark:bg-blue-900/20',
        border: 'border-blue-200 dark:border-blue-800',
        icon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />,
        text: 'text-blue-800 dark:text-blue-300',
        title: 'text-blue-900 dark:text-blue-100',
      },
      success: {
        bg: 'bg-success-50 dark:bg-success-900/20',
        border: 'border-success-200 dark:border-success-800',
        icon: <CheckCircle className="w-5 h-5 text-success-600 dark:text-success-400" />,
        text: 'text-success-800 dark:text-success-300',
        title: 'text-success-900 dark:text-success-100',
      },
      warning: {
        bg: 'bg-warning-50 dark:bg-warning-900/20',
        border: 'border-warning-200 dark:border-warning-800',
        icon: <AlertTriangle className="w-5 h-5 text-warning-600 dark:text-warning-400" />,
        text: 'text-warning-800 dark:text-warning-300',
        title: 'text-warning-900 dark:text-warning-100',
      },
      destructive: {
        bg: 'bg-destructive-50 dark:bg-destructive-900/20',
        border: 'border-destructive-200 dark:border-destructive-800',
        icon: <AlertCircle className="w-5 h-5 text-destructive-600 dark:text-destructive-400" />,
        text: 'text-destructive-800 dark:text-destructive-300',
        title: 'text-destructive-900 dark:text-destructive-100',
      },
    };

    const style = variants[variant];

    return (
      <div
        ref={ref}
        className={cn(
          'state-alert-shell flex gap-4 rounded-lg border p-4',
          style.bg,
          style.border,
          className
        )}
        role="alert"
        {...props}
      >
        <div className="state-alert-icon flex-shrink-0 pt-0.5">{style.icon}</div>
        <div className="flex-1">
          {title && (
            <h3 className={cn('font-semibold', style.title)}>
              {title}
            </h3>
          )}
          <p className={cn('text-sm', style.text, title && 'mt-1')}>
            {description || children}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className={cn(
              'state-alert-close flex-shrink-0 opacity-50 hover:opacity-100 transition-opacity',
              style.text
            )}
            aria-label="Fechar alerta"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }
);

Alert.displayName = 'Alert';

export default Alert;
