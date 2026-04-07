import { motion } from 'framer-motion';
import { Card } from '../ui/index.js';
import { cn } from '../../lib/cn.js';
import { pathProgress } from '../../lib/motion/index.js';
import JourneyNode from './JourneyNode.jsx';
import { buildPath } from './journeyEngine.utils.js';

export default function JourneyMapCanvas({ steps, selectedStepId, onSelectStep, compact, mobile, progress }) {
  const compactMode = compact || mobile;
  const svgPath = buildPath(steps);
  const finalStep = steps[steps.length - 1] || null;

  return (
    <Card className={cn('journey-map-canvas relative overflow-hidden rounded-3xl border-primary-100/80 shadow-card', compact && 'rounded-2xl p-4')}>
      <div className="absolute -left-20 -top-20 h-52 w-52 rounded-full bg-rose-400/35 blur-3xl" />
      <div className="absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-orange-400/30 blur-3xl" />
      <div className="journey-map-stars" />
      <div className="journey-map-overlay-grid" />

      {!compactMode ? (
        <div className="journey-map-hud">
          <div>
            <span>Rota viva</span>
            <strong>{Math.round(progress || 0)}% da campanha</strong>
          </div>
          {finalStep ? (
            <div className="journey-map-boss-chip">
              <span>Climax</span>
              <strong>{finalStep.title}</strong>
            </div>
          ) : null}
        </div>
      ) : null}

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
            <path d={svgPath} stroke="rgba(251,113,133,0.24)" strokeWidth="1.2" fill="none" />
            <motion.path
              d={svgPath}
              stroke="url(#journeyGradient)"
              strokeWidth="2.2"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="1"
              custom={progress / 100}
              initial={pathProgress.path.initial}
              animate={pathProgress.path.animate(progress / 100)}
            />
            <defs>
              <linearGradient id="journeyGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="45%" stopColor="#ec4899" />
                <stop offset="100%" stopColor="#fb923c" />
              </linearGradient>
              <filter id="journeyTrailGlow">
                <feGaussianBlur stdDeviation="1.6" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
            <motion.path
              d={svgPath}
              stroke="url(#journeyGradient)"
              strokeWidth="4.8"
              fill="none"
              strokeLinecap="round"
              opacity="0.26"
              filter="url(#journeyTrailGlow)"
              custom={progress / 100}
              initial={pathProgress.path.initial}
              animate={pathProgress.path.animate(progress / 100)}
            />
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
