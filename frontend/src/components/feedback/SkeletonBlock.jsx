import React from 'react';
import { cn } from '../../lib/cn';

/**
 * SkeletonBlock - Placeholder de carregamento
 */
const SkeletonBlock = React.forwardRef(
  ({ className, count = 1, ...props }, ref) => {
    return (
      <>
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            ref={i === 0 ? ref : null}
            className={cn(
              'state-skeleton-shell rounded-lg h-24 bg-muted-100 dark:bg-dark-700',
              'animate-shimmer',
              className
            )}
            {...(i === 0 ? props : {})}
          />
        ))}
      </>
    );
  }
);

SkeletonBlock.displayName = 'SkeletonBlock';

export default SkeletonBlock;
