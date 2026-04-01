import React from 'react';
import { cn } from '../../lib/cn';

/**
 * Skeleton - Component para loading com skeleton animation
 * Simula elemento que está carregando
 */
const Skeleton = ({
  className,
  variant = 'box',
  count = 1,
  ...props
}) => {
  const variants = {
    box: 'h-12 w-full rounded-lg',
    circle: 'h-12 w-12 rounded-full',
    text: 'h-4 w-full rounded',
    'text-lg': 'h-6 w-full rounded',
  };

  return (
    <>
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={cn(
            'animate-pulse rounded bg-gradient-to-r from-muted-200 via-muted-100 to-muted-200 dark:from-dark-700 dark:via-dark-600 dark:to-dark-700',
            variants[variant],
            className
          )}
          {...props}
        />
      ))}
    </>
  );
};

export default Skeleton;
