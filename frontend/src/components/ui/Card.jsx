import React from 'react';
import { cn } from '../../lib/cn';

/**
 * Card - Componente container simples para agrupamento
 * Uso: <Card title="Título"><conteúdo/></Card>
 */
const Card = React.forwardRef(
  ({ className, title, action, children, variant = 'default', as = 'section', ...props }, ref) => {
    const Tag = as;
    const variants = {
      default: 'bg-white border border-muted-200 dark:bg-dark-800 dark:border-dark-700',
      elevated: 'bg-white border border-muted-100 shadow-sm dark:bg-dark-800 dark:border-dark-700 dark:shadow-dark',
      ghost: 'border border-muted-200 dark:border-dark-700',
    };

    return (
      <Tag
        ref={ref}
        className={cn(
          'rounded-lg p-5 transition-all',
          variants[variant],
          className
        )}
        {...props}
      >
        {/* Header com título e ação */}
        {title && (
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-muted-100 dark:border-dark-700">
            <h3 className="text-lg font-semibold text-muted-900 dark:text-muted-50">
              {title}
            </h3>
            {action && <div className="text-sm">{action}</div>}
          </div>
        )}

        {/* Conteúdo */}
        <div className="space-y-3">{children}</div>
      </Tag>
    );
  }
);

Card.displayName = 'Card';

export default Card;
