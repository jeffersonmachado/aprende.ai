import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../lib/cn';
import { entryPresets, motionTransitions } from '../../lib/motion/index.js';

/**
 * Tabs - Componente de abas
 */
export const Tabs = ({
  tabs = [],
  defaultTab = 0,
  onTabChange,
  className,
  variant = 'outline',
  ...props
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleTabChange = (idx) => {
    setActiveTab(idx);
    onTabChange?.(idx);
  };

  const variants = {
    outline: 'border-b border-muted-200 dark:border-dark-700',
    pills: 'gap-2 bg-muted-100 dark:bg-dark-800 p-1 rounded-lg',
  };

  return (
    <div className={cn('w-full', className)} {...props}>
      {/* Tab buttons */}
      <div
        className={cn(
          'flex',
          variant === 'outline' ? 'border-b' : 'inline-flex bg-muted-100 dark:bg-dark-800 p-1 rounded-lg'
        )}
      >
        {tabs.map((tab, idx) => {
          const isActive = idx === activeTab;
          return (
            <button
              key={idx}
              onClick={() => handleTabChange(idx)}
              className={cn(
                'relative px-4 py-2 font-medium transition-colors whitespace-nowrap',
                variant === 'outline' &&
                'border-b-2 pb-3 -mb-1',
                isActive
                  ? variant === 'outline'
                    ? 'border-primary-600 text-primary-600 dark:border-primary-400 dark:text-primary-400'
                    : 'bg-white text-primary-600 dark:bg-dark-700 dark:text-primary-400 rounded'
                  : 'border-transparent text-muted-600 hover:text-muted-900 dark:text-muted-400 dark:hover:text-muted-200'
              )}
            >
              {isActive && variant === 'outline' && (
                <motion.div
                  layoutId="underline"
                  className="absolute inset-0 border-b-2 border-primary-600 dark:border-primary-400"
                />
              )}
              <span className="relative">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait" initial={false}>
        {tabs[activeTab]?.content && (
          <motion.div
            key={`tab-content-${activeTab}`}
            initial={entryPresets.fadeUp.initial}
            animate={entryPresets.fadeUp.animate}
            exit={entryPresets.fadeUp.exit}
            transition={motionTransitions.enter}
            className="py-6"
          >
            {tabs[activeTab].content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

Tabs.displayName = 'Tabs';

export default Tabs;
