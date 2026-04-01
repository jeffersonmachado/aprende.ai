import {
  Brain,
  CheckCircle2,
  Crown,
  Gem,
  Lock,
  Play,
  Rocket,
  Sparkles,
  Star,
  Trophy
} from 'lucide-react';

const ICON_MAP = {
  brain: Brain,
  play: Play,
  trophy: Trophy,
  rocket: Rocket,
  star: Star,
  sparkles: Sparkles,
  gem: Gem,
  crown: Crown
};

export function getNodeIconComponent(icon) {
  return ICON_MAP[icon] || Star;
}

export function withDefaultPositions(steps = []) {
  return steps.map((step, index) => {
    if (step.position) return step;
    const total = Math.max(1, steps.length - 1);
    const progress = index / total;
    const xBase = 18 + (Math.sin(progress * Math.PI * 2.2) * 28 + 32);
    const yBase = 14 + progress * 72;

    return {
      ...step,
      position: {
        x: Math.max(12, Math.min(88, xBase)),
        y: Math.max(10, Math.min(92, yBase))
      }
    };
  });
}

export function normalizeJourneyUiState(inputState) {
  const sourceSteps = Array.isArray(inputState?.steps) ? inputState.steps : [];
  const steps = withDefaultPositions(sourceSteps).map((step, index) => {
    const status = step.status || (index === 0 ? 'active' : 'locked');
    return {
      ...step,
      status,
      unlocked: step.unlocked ?? status !== 'locked',
      xp: Number(step.xp || 40),
      reward: step.reward || 'Reforco de repertorio',
      icon: step.icon || 'star'
    };
  });

  const completed = steps.filter((step) => step.status === 'completed').length;

  return {
    ...inputState,
    steps,
    progress: Number.isFinite(inputState?.progress) ? inputState.progress : (steps.length ? Math.round((completed / steps.length) * 100) : 0),
    xpTotal: Number(inputState?.xpTotal || 0),
    level: Number(inputState?.level || 1),
    streak: Number(inputState?.streak || 1),
    lastCompletedAt: inputState?.lastCompletedAt || null,
    rewards: Array.isArray(inputState?.rewards)
      ? inputState.rewards
      : Array.isArray(inputState?.rewardsState?.items)
        ? inputState.rewardsState.items
        : []
  };
}

export function buildPath(steps) {
  if (!steps.length) return '';
  const start = steps[0].position;
  let path = `M ${start.x} ${start.y}`;

  for (let i = 1; i < steps.length; i += 1) {
    const prev = steps[i - 1].position;
    const current = steps[i].position;
    const drift = i % 2 === 0 ? 9 : -9;
    const cp1x = prev.x + drift;
    const cp1y = prev.y + (current.y - prev.y) * 0.35;
    const cp2x = current.x - drift;
    const cp2y = prev.y + (current.y - prev.y) * 0.65;
    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${current.x} ${current.y}`;
  }

  return path;
}

export function statusClasses(status) {
  if (status === 'completed') {
    return 'border-emerald-300 bg-emerald-50 text-emerald-800 shadow-md';
  }
  if (status === 'active') {
    return 'border-rose-300 bg-white text-rose-700 shadow-glow';
  }
  if (status === 'available') {
    return 'border-orange-200 bg-white text-orange-700 shadow-soft';
  }
  return 'border-muted-200/80 bg-muted-100/80 text-muted-400 opacity-75 backdrop-blur-sm';
}

export function rarityClass(rarity) {
  if (rarity === 'epic') {
    return 'border-amber-300 from-amber-100 via-orange-100 to-rose-100';
  }
  if (rarity === 'rare') {
    return 'border-sky-300 from-sky-100 via-cyan-100 to-indigo-100';
  }
  return 'border-accent-200 from-rose-100 via-orange-100 to-amber-100';
}
