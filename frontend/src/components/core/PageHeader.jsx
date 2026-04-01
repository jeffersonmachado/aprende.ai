import React from 'react';
import { cn } from '../../lib/cn';

/**
 * PageHeader - Header de página com eyebrow, título, descrição e ações
 */
const PageHeader = React.forwardRef(
  ({ className, eyebrow, title, description, actions, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col gap-3 mb-8 md:flex-row md:items-end md:justify-between',
          className
        )}
        {...props}
      >
        {/* Conteúdo principal */}
        <div className="flex-1">
          {eyebrow && (
            <p className="text-sm font-semibold text-primary-600 dark:text-primary-400 mb-1 uppercase tracking-wide">
              {eyebrow}
            </p>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-muted-900 dark:text-muted-50 mb-2">
            {title}
          </h1>
          {description && (
            <p className="text-muted-600 dark:text-muted-400 max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {/* Ações (buttons, filtros, etc) */}
        {actions && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            {actions}
          </div>
        )}
      </div>
    );
  }
);

PageHeader.displayName = 'PageHeader';

export default PageHeader;
