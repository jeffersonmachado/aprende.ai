import { motion } from 'framer-motion';
import { CheckCircle2, Lock } from 'lucide-react';
import { cn } from '../../lib/cn.js';
import { nodePulse, unlockReveal } from '../../lib/motion/index.js';
import { getNodeIconComponent, statusClasses } from './journeyEngine.utils.js';

function NodeIcon({ step }) {
  const Icon = getNodeIconComponent(step.icon);

  if (step.status === 'completed') {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (step.status === 'locked') {
    return <Lock className="h-4 w-4" />;
  }

  return <Icon className="h-4 w-4" />;
}

export default function JourneyNode({ step, index, selected, onSelect, compactMode }) {
  if (compactMode) {
    return (
      <motion.button
        type="button"
        className={cn(
          'flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left',
          statusClasses(step.status),
          selected && 'ring-2 ring-rose-300/60'
        )}
        onClick={() => onSelect(step)}
        disabled={step.status === 'locked'}
        initial={step.status !== 'locked' ? unlockReveal.initial : false}
        animate={step.status !== 'locked' ? unlockReveal.animate : false}
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <NodeIcon step={step} />
          {step.title}
        </span>
        <span className="text-xs font-semibold">+{step.xp} XP</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      className={cn(
        'absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-3 py-2 text-left backdrop-blur-md transition-all',
        statusClasses(step.status),
        selected && 'ring-2 ring-rose-300/70'
      )}
      style={{ left: `${step.position.x}%`, top: `${step.position.y}%`, width: '184px' }}
      onClick={() => onSelect(step)}
      disabled={step.status === 'locked'}
      animate={step.status === 'active' ? nodePulse.active : undefined}
      initial={step.status !== 'locked' ? unlockReveal.initial : false}
      whileInView={step.status !== 'locked' ? unlockReveal.animate : false}
      viewport={{ once: true, amount: 0.2 }}
    >
      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 font-semibold text-muted-700">
          <NodeIcon step={step} />
          Etapa {index + 1}
        </span>
        <span className="font-semibold">+{step.xp} XP</span>
      </div>
      <p className="text-sm font-semibold leading-tight">{step.title}</p>
      <p className="text-xs opacity-80">{step.description}</p>
    </motion.button>
  );
}
