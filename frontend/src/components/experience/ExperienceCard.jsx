import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '../ui';
import { cn } from '../../lib/cn';
import { cardMotion, entryPresets } from '../../lib/motion/index.js';

const variantStyles = {
  default: 'border-primary-100/70 dark:border-primary-900/40',
  active: 'border-primary-300 bg-gradient-to-br from-primary-50/80 to-white dark:from-primary-900/30 dark:to-dark-900 ring-2 ring-primary-300/60 shadow-premium',
  success: 'border-success-300 bg-gradient-to-br from-success-50/90 to-white dark:from-success-900/25 dark:to-dark-900',
  warning: 'border-warning-300 bg-gradient-to-br from-warning-50/90 to-white dark:from-warning-900/20 dark:to-dark-900',
  decision: 'border-secondary-300 bg-gradient-to-br from-secondary-50/80 to-white dark:from-secondary-900/25 dark:to-dark-900',
  result: 'border-success-300 bg-gradient-to-br from-success-50/90 to-white dark:from-success-900/25 dark:to-dark-900',
  mentor: 'border-primary-300 bg-gradient-to-br from-secondary-50/80 via-primary-50/70 to-white dark:from-secondary-900/20 dark:via-primary-900/20 dark:to-dark-900',
  destaque: 'border-primary-300 bg-gradient-to-br from-primary-50/80 to-white dark:from-primary-900/30 dark:to-dark-900',
  decisao: 'border-secondary-300 bg-gradient-to-br from-secondary-50/80 to-white dark:from-secondary-900/25 dark:to-dark-900',
  resultado: 'border-success-300 bg-gradient-to-br from-success-50/90 to-white dark:from-success-900/25 dark:to-dark-900',
};

const ExperienceCard = React.forwardRef(
  (
    {
      className,
      kicker,
      title,
      subtitle,
      children,
      footer,
      interactive = false,
      active = false,
      variant = 'default',
      loading = false,
      motionRole = 'static',
      ...props
    },
    ref
  ) => {
    const resolvedRole = active ? 'featured' : (interactive ? 'interactive' : motionRole);
    const resolvedMotion = cardMotion[resolvedRole] || cardMotion.static;

    return (
      <motion.div
        initial={entryPresets.fadeUp.initial}
        animate={entryPresets.fadeUp.animate}
        exit={entryPresets.fadeUp.exit}
        transition={entryPresets.fadeUp.transition}
        whileHover={resolvedMotion.whileHover}
        whileTap={resolvedMotion.whileTap}
      >
        <Card
          ref={ref}
          variant="elevated"
          className={cn(
            'rounded-2xl relative overflow-hidden bg-experience-gradient shadow-card transition-all',
            variantStyles[variant] || variantStyles.default,
            active && 'ring-2 ring-primary-400 shadow-premium',
            className
          )}
          {...props}
        >
          <div className="pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full bg-primary-300/30 blur-2xl" />

          {(kicker || title || subtitle) && (
            <header className="space-y-1 relative">
              {kicker && <p className="text-xs uppercase tracking-[0.12em] font-semibold text-primary-700 dark:text-primary-300">{kicker}</p>}
              {title && <h3 className="text-xl font-semibold text-muted-900 dark:text-muted-50">{title}</h3>}
              {subtitle && <p className="text-sm text-muted-700 dark:text-muted-300">{subtitle}</p>}
            </header>
          )}

          <div className="pt-2 relative">
            {loading ? (
              <div className="space-y-2 animate-pulse">
                <div className="h-4 rounded bg-primary-100 dark:bg-primary-900/30" />
                <div className="h-4 w-5/6 rounded bg-primary-100 dark:bg-primary-900/30" />
                <div className="h-4 w-4/6 rounded bg-primary-100 dark:bg-primary-900/30" />
              </div>
            ) : (
              children
            )}
          </div>

          {footer && <footer className="pt-3 mt-2 border-t border-muted-200/70 dark:border-dark-700/70">{footer}</footer>}
        </Card>
      </motion.div>
    );
  }
);

ExperienceCard.displayName = 'ExperienceCard';

export default ExperienceCard;
