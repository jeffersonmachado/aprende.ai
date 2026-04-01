import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../lib/cn';

/**
 * Navigation - Menu de navegação sidebar
 * Com highlight automático da rota ativa
 */
export const Navigation = ({ items = [], className, ...props }) => {
  const location = useLocation();

  return (
    <nav className={cn('space-y-1 px-2', className)} {...props}>
      {items.map((item) => {
        const isActive = location.pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              'flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 group',
              isActive
                ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300'
                : 'text-muted-600 hover:bg-muted-100 dark:text-muted-400 dark:hover:bg-dark-800'
            )}
          >
            {Icon && (
              <Icon className={cn(
                'w-5 h-5 flex-shrink-0 transition-colors',
                isActive ? 'text-primary-600 dark:text-primary-400' : 'text-muted-500 dark:text-muted-500 group-hover:text-muted-700'
              )} />
            )}
            <span className="font-medium text-sm">{item.label}</span>
            {item.badge && (
              <span className="ml-auto px-2 py-0.5 rounded-full bg-primary-500/20 text-xs font-semibold text-primary-600 dark:text-primary-400">
                {item.badge}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

Navigation.displayName = 'Navigation';

export default Navigation;
