import React from 'react';
import { cn } from '../../lib/cn';
import Button from '../ui/Button';

/**
 * EmptyState - Componente para estados vazios
 * Exibe quando não há dados disponíveis
 */
const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'empty-state state-empty-shell flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      {...props}
    >
      {Icon && (
        <div className="state-empty-icon mb-4 p-4 rounded-full bg-muted-100 dark:bg-dark-800">
          <Icon className="w-8 h-8 text-muted-600 dark:text-muted-400" />
        </div>
      )}

      {title && (
        <h3 className="state-empty-title mb-2 text-lg font-semibold text-muted-900 dark:text-white">
          {title}
        </h3>
      )}

      {description && (
        <p className="state-empty-description mb-6 text-muted-600 dark:text-muted-400 max-w-sm">
          {description}
        </p>
      )}

      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
