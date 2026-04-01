import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ExperienceCard from './ExperienceCard';
import Progress from '../ui/Progress';
import { entryPresets, motionSprings, scenePresets } from '../../lib/motion/index.js';

const StageWrapper = ({ stageKey, title, subtitle, completed = 0, total = 0, children, variant = 'destaque', loading = false, stageSemantic = 'context' }) => {
  const progressValue = total > 0 ? Math.round((completed / total) * 100) : 0;
  const currentStage = Math.min(total || 1, Math.max(1, completed + 1));
  const isDone = total > 0 && completed >= total;
  const sceneVariant = scenePresets[stageSemantic] || scenePresets.context;

  return (
    <ExperienceCard
      kicker="Jornada Guiada"
      title={title}
      subtitle={subtitle}
      variant={variant}
      active={!isDone}
      loading={loading}
      footer={(
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="rounded-full bg-primary-100 px-2 py-1 font-semibold text-primary-700 dark:bg-primary-900/30 dark:text-primary-300">
              Etapa {currentStage} de {Math.max(total, 1)}
            </span>
            <span className="rounded-full bg-secondary-100 px-2 py-1 font-semibold text-secondary-700 dark:bg-secondary-900/30 dark:text-secondary-300">
              Evolução {progressValue}%
            </span>
          </div>
          <Progress value={progressValue} showValue={false} tone={isDone ? 'success' : 'primary'} />
          {isDone && (
            <motion.div
              initial={entryPresets.softPop.initial}
              animate={entryPresets.softPop.animate}
              transition={motionSprings.reward}
              className="rounded-lg bg-success-100 px-2 py-1 text-xs font-semibold text-success-700 dark:bg-success-900/30 dark:text-success-300"
            >
              Etapa concluída com sucesso
            </motion.div>
          )}
        </div>
      )}
      interactive
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={stageKey}
          initial={sceneVariant.initial}
          animate={sceneVariant.animate}
          exit={sceneVariant.exit}
          transition={sceneVariant.transition}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </ExperienceCard>
  );
};

export default StageWrapper;
