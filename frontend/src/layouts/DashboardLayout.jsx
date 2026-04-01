import React from 'react';
import { cn } from '../lib/cn';

/**
 * DashboardLayout - Layout de grid responsivo para dashboard
 * Suporta rearranjo automático de cards
 */
export const DashboardLayout = React.forwardRef(
  (
    {
      className,
      columns = 3,
      gap = 6,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'grid gap-4 md:gap-6 w-full',
          'grid-cols-1',
          'md:grid-cols-2',
          columns >= 3 && 'lg:grid-cols-3',
          columns >= 4 && 'xl:grid-cols-4',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

DashboardLayout.displayName = 'DashboardLayout';

export default DashboardLayout;
