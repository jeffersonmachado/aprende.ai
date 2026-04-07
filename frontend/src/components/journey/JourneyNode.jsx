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

function getNodeStageLabel(step, index) {
  if (step?.kind === 'boss') return 'Boss';

  const text = `${step?.title || ''} ${step?.description || ''}`.toLowerCase();
  if (/inicio|start|abertura/.test(text)) return 'Inicio';
  if (/analis|diagnost/.test(text)) return 'Analise';
  if (/decis|escolha/.test(text)) return 'Decisao';
  if (/twist|reviravolta|crise|alerta/.test(text)) return 'Reviravolta';
  if (/estrateg|plano|execu/.test(text)) return 'Estrategia';
  return `Etapa ${index + 1}`;
}

function getNodeStatusLabel(status) {
  if (status === 'completed') return 'Concluido';
  if (status === 'active') return 'Atual';
  if (status === 'available') return 'Liberado';
  return 'Bloqueado';
}

export default function JourneyNode({ step, index, selected, onSelect, compactMode }) {
  const isBoss = step?.kind === 'boss' || /boss|final/i.test(step?.title || '') || step?.icon === 'crown' || step?.icon === 'trophy';
  const isActive = step?.status === 'active';
  const stageLabel = getNodeStageLabel(step, index);
  const statusLabel = getNodeStatusLabel(step?.status);

  if (compactMode) {
    return (
      <motion.button
        type="button"
        className={cn(
          'flex w-full items-center justify-between rounded-2xl border px-3 py-2 text-left journey-node-compact',
          statusClasses(step.status),
          selected && 'ring-2 ring-rose-300/60',
          isBoss && 'journey-node-boss'
        )}
        onClick={() => onSelect(step)}
        disabled={step.status === 'locked'}
        initial={step.status !== 'locked' ? unlockReveal.initial : false}
        animate={step.status !== 'locked' ? unlockReveal.animate : false}
      >
        <div>
          <span className="flex items-center gap-2 text-sm font-medium">
            <NodeIcon step={step} />
            {step.title}
          </span>
          <span className="journey-node-meta">{stageLabel} · {statusLabel}</span>
        </div>
        <span className="text-xs font-semibold">+{step.xp} XP</span>
      </motion.button>
    );
  }

  return (
    <motion.button
      type="button"
      className={cn(
        'absolute -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-3 py-2 text-left backdrop-blur-md transition-all journey-node',
        statusClasses(step.status),
        selected && 'ring-2 ring-rose-300/70',
        isActive && 'journey-node-live',
        isBoss && 'journey-node-boss'
      )}
      style={{ left: `${step.position.x}%`, top: `${step.position.y}%`, width: isBoss ? '204px' : '188px' }}
      onClick={() => onSelect(step)}
      disabled={step.status === 'locked'}
      animate={step.status === 'active' ? nodePulse.active : undefined}
      initial={step.status !== 'locked' ? unlockReveal.initial : false}
      whileInView={step.status !== 'locked' ? unlockReveal.animate : false}
      viewport={{ once: true, amount: 0.2 }}
    >
      {isActive ? <div className="journey-node-aura" aria-hidden="true" /> : null}
      <div className="mb-1 flex items-center justify-between gap-2 text-xs">
        <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-1 font-semibold text-muted-700">
          <NodeIcon step={step} />
          {stageLabel}
        </span>
        <span className="font-semibold">{statusLabel}</span>
      </div>
      <p className="text-sm font-semibold leading-tight">{step.title}</p>
      <p className="text-xs opacity-80">{step.description}</p>
      <div className="journey-node-meta-row">
        <span className="journey-node-meta">+{step.xp} XP</span>
        {isBoss ? <span className="journey-node-meta journey-node-meta-boss">Climax</span> : null}
      </div>
    </motion.button>
  );
}
