import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/cn';
import { progressMotion } from '../../lib/motion/index.js';

const Progress = React.forwardRef(
  ({ className, value = 0, max = 100, showValue = false, tone = 'primary', variant, loading = false, ...props }, ref) => {
    const safeMax = Number(max) > 0 ? Number(max) : 100;
    const rawPercent = (Number(value) / safeMax) * 100;
    const percent = Math.max(0, Math.min(100, Number.isFinite(rawPercent) ? rawPercent : 0));

    const tones = {
      primary: 'from-primary-500 via-secondary-500 to-primary-600 shadow-primary-500/35',
      success: 'from-success-500 to-success-700 shadow-success-500/30',
      warning: 'from-warning-500 to-warning-700 shadow-warning-500/30',
      xp: 'from-amber-400 via-orange-500 to-rose-500 shadow-orange-500/30',
      journey: 'from-primary-500 via-sky-500 to-cyan-500 shadow-sky-500/30',
      competency: 'from-emerald-500 via-green-500 to-teal-600 shadow-emerald-500/30',
    };

    const resolvedTone = variant || tone;

    return (
      <div ref={ref} className={cn('w-full', className)} {...props}>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted-200 dark:bg-dark-700">
          {loading ? (
            <motion.div
              className="h-full w-1/3 rounded-full bg-gradient-to-r from-primary-400 to-secondary-500"
              animate={progressMotion.shimmer.animate}
              transition={progressMotion.shimmer.transition}
            />
          ) : (
            <motion.div
              className={cn('h-full rounded-full bg-gradient-to-r shadow-lg', tones[resolvedTone] || tones.primary)}
              initial={progressMotion.fill.initial}
              animate={{ width: `${percent}%` }}
              transition={progressMotion.fill.transition}
            />
          )}
        </div>
        {showValue && (
          <p className="mt-1 text-xs font-medium text-muted-600 dark:text-muted-400">{Math.round(percent)}%</p>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export default Progress;
