import { motion } from 'framer-motion';
import { Card } from '../ui/index.js';
import { cn } from '../../lib/cn.js';
import { pathProgress } from '../../lib/motion/index.js';
import JourneyNode from './JourneyNode.jsx';
import { buildPath } from './journeyEngine.utils.js';

export default function JourneyMapCanvas({ steps, selectedStepId, onSelectStep, compact, mobile, progress }) {
  const compactMode = compact || mobile;
  const svgPath = buildPath(steps);

  return (
    <Card className={cn('relative overflow-hidden rounded-3xl border-primary-100/80 bg-white/90 shadow-card', compact && 'rounded-2xl p-4')}>
      <div className="absolute -left-20 -top-20 h-52 w-52 rounded-full bg-rose-200/40 blur-3xl" />
      <div className="absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-orange-200/40 blur-3xl" />

      {compactMode ? (
        <div className="relative z-10 space-y-2">
          {steps.map((step, index) => (
            <JourneyNode
              key={step.id}
              step={step}
              index={index}
              selected={step.id === selectedStepId}
              onSelect={onSelectStep}
              compactMode
            />
          ))}
        </div>
      ) : (
        <div className="relative z-10 h-[420px] w-full">
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full">
            <path d={svgPath} stroke="rgba(236,72,153,0.2)" strokeWidth="1.2" fill="none" />
            <motion.path
              d={svgPath}
              stroke="url(#journeyGradient)"
              strokeWidth="1.8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="1"
              custom={progress / 100}
              initial={pathProgress.path.initial}
              animate={pathProgress.path.animate(progress / 100)}
            />
            <defs>
              <linearGradient id="journeyGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="50%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#fb7185" />
              </linearGradient>
            </defs>
          </svg>

          {steps.map((step, index) => (
            <JourneyNode
              key={step.id}
              step={step}
              index={index}
              selected={step.id === selectedStepId}
              onSelect={onSelectStep}
              compactMode={false}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
