export const motionTiming = {
  instant: 0.12,
  fast: 0.18,
  normal: 0.26,
  medium: 0.34,
  slow: 0.48,
};

export const motionEase = {
  standard: [0.22, 1, 0.36, 1],
  smooth: [0.16, 1, 0.3, 1],
  softExit: [0.4, 0, 0.2, 1],
  linear: 'linear',
};

export const motionSprings = {
  gentle: { type: 'spring', stiffness: 220, damping: 28, mass: 0.8 },
  card: { type: 'spring', stiffness: 260, damping: 24, mass: 0.75 },
  reward: { type: 'spring', stiffness: 300, damping: 22, mass: 0.72 },
};

export const motionTransitions = {
  enter: { duration: motionTiming.normal, ease: motionEase.standard },
  exit: { duration: motionTiming.fast, ease: motionEase.softExit },
  scene: { duration: motionTiming.medium, ease: motionEase.smooth },
  progress: { duration: motionTiming.slow, ease: motionEase.standard },
  modal: { duration: motionTiming.normal, ease: motionEase.smooth },
  shimmer: { duration: 1.2, ease: motionEase.linear, repeat: Infinity },
};

export const staggerPresets = {
  fast: { staggerChildren: 0.04, delayChildren: 0.02 },
  soft: { staggerChildren: 0.08, delayChildren: 0.05 },
  narrative: { staggerChildren: 0.12, delayChildren: 0.08 },
};

export const entryPresets = {
  fadeIn: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: motionTransitions.enter,
  },
  fadeUp: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: motionTransitions.enter,
  },
  fadeDown: {
    initial: { opacity: 0, y: -12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
    transition: motionTransitions.enter,
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.97 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.98 },
    transition: motionTransitions.enter,
  },
  softPop: {
    initial: { opacity: 0, scale: 0.92 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.92 },
    transition: motionSprings.gentle,
  },
};

export const scenePresets = {
  context: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: motionTransitions.scene,
  },
  learning: {
    initial: { opacity: 0, y: 16 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -10 },
    transition: motionTransitions.scene,
  },
  challenge: {
    initial: { opacity: 0, y: 18, scale: 0.99 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -12, scale: 0.995 },
    transition: motionTransitions.scene,
  },
  decision: {
    initial: { opacity: 0, y: 20, scale: 0.985 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -14, scale: 0.99 },
    transition: motionTransitions.scene,
  },
  simulation: {
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -12 },
    transition: motionTransitions.scene,
  },
  reflection: {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -8 },
    transition: motionTransitions.scene,
  },
  result: {
    initial: { opacity: 0, y: 12, scale: 0.992 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.994 },
    transition: motionTransitions.scene,
  },
  reward: {
    initial: { opacity: 0, y: 8, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.96 },
    transition: motionSprings.reward,
  },
};

export const cardMotion = {
  static: {
    whileHover: undefined,
    whileTap: undefined,
  },
  interactive: {
    whileHover: { y: -3, scale: 1.008 },
    whileTap: { scale: 0.995 },
  },
  featured: {
    whileHover: { y: -4, scale: 1.01 },
    whileTap: { scale: 0.994 },
  },
  reward: {
    whileHover: { y: -4, scale: 1.012 },
    whileTap: { scale: 0.992 },
  },
};

export const microInteraction = {
  buttonTap: { scale: 0.97 },
  buttonHover: { y: -1 },
  stepAdvance: { scale: [1, 1.06, 1] },
  rewardPop: { scale: [0.94, 1.04, 1] },
};

export const modalPresets = {
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: motionTransitions.modal,
  },
  panel: {
    initial: { opacity: 0, y: 16, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 12, scale: 0.98 },
    transition: motionTransitions.modal,
  },
};

export const progressMotion = {
  fill: {
    initial: { width: 0 },
    transition: motionTransitions.progress,
  },
  shimmer: {
    animate: { x: ['-120%', '340%'] },
    transition: motionTransitions.shimmer,
  },
};

export const rewardBurst = {
  container: {
    initial: { opacity: 0, scale: 0.86 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        ...motionSprings.reward,
        staggerChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.92,
      transition: motionTransitions.exit,
    },
  },
  sparkle: {
    initial: { opacity: 0, y: 6, scale: 0.6 },
    animate: {
      opacity: [0, 1, 0],
      y: [6, -12, -18],
      scale: [0.6, 1, 0.85],
      transition: { duration: 0.9, ease: motionEase.smooth },
    },
  },
};

export const floatingXP = {
  initial: { opacity: 0, y: 8, scale: 0.9 },
  animate: {
    opacity: [0, 1, 1, 0],
    y: [8, -6, -14, -26],
    scale: [0.9, 1, 1, 0.95],
    transition: { duration: 1.15, ease: motionEase.smooth },
  },
  exit: { opacity: 0, y: -26, transition: motionTransitions.exit },
};

export const pathProgress = {
  path: {
    initial: { pathLength: 0, opacity: 0.4 },
    animate: (progress = 0) => ({
      pathLength: Math.max(0, Math.min(1, progress)),
      opacity: 1,
      transition: {
        ...motionTransitions.progress,
        duration: 0.8,
      },
    }),
  },
};

export const nodePulse = {
  active: {
    scale: [1, 1.08, 1],
    boxShadow: [
      '0 0 0px rgba(236,72,153,0.35)',
      '0 0 22px rgba(236,72,153,0.55)',
      '0 0 0px rgba(236,72,153,0.35)',
    ],
    transition: {
      duration: 1.8,
      repeat: Infinity,
      ease: motionEase.smooth,
    },
  },
};

export const unlockReveal = {
  initial: { opacity: 0, scale: 0.9, filter: 'blur(4px)' },
  animate: {
    opacity: 1,
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      ...motionSprings.gentle,
      duration: 0.4,
    },
  },
};

export function stageToSemantic(stepId) {
  switch (stepId) {
    case 'contexto':
      return 'context';
    case 'capacitacao':
      return 'learning';
    case 'decisao':
      return 'decision';
    case 'simulacao':
      return 'simulation';
    case 'resultado':
      return 'result';
    default:
      return 'context';
  }
}
