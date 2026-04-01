import React from 'react';
import { cn } from '../../lib/cn';

/**
 * StatCard - Card para exibir estatísticas
 * Uso: <StatCard label="Progresso" value="75%" helper="Jornada atual" />
 */
const StatCard = React.forwardRef(
  ({ className, label, value, helper, icon: Icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg p-5 bg-white border border-muted-200 dark:bg-dark-800 dark:border-dark-700',
          'flex flex-col gap-2 hover:shadow-md transition-all',
          className
        )}
        {...props}
      >
        {/* Label */}
        <div className="text-xs font-semibold text-muted-500 dark:text-muted-400 uppercase tracking-wide">
          {label}
        </div>

        {/* Valor principal */}
        <div className="flex items-baseline gap-2">
          <div className="text-3xl font-bold text-muted-900 dark:text-muted-50">
            {value}
          </div>
          {Icon && (
            <div className="text-primary-600 dark:text-primary-400">
              <Icon className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Helper text */}
        {helper && (
          <div className="text-xs text-muted-600 dark:text-muted-400">
            {helper}
          </div>
        )}
      </div>
    );
  }
);

StatCard.displayName = 'StatCard';

export default StatCard;
