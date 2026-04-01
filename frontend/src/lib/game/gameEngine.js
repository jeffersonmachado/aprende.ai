const XP_ACTIONS = {
  complete_step: 55,
  perfect_step: 80,
  bonus_reward: 25,
  daily_login: 15,
  streak_bonus: 10,
};

function startOfDay(date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

function computeStreak(lastCompletedAt, now = new Date()) {
  if (!lastCompletedAt) return 1;

  const previous = startOfDay(lastCompletedAt);
  const today = startOfDay(now);
  const days = Math.round((today - previous) / 86400000);

  if (days === 0) return 1;
  if (days === 1) return 2;
  return 1;
}

export function calculateLevelFromXP(xpTotal = 0) {
  const safeXP = Math.max(0, Number(xpTotal) || 0);
  return Math.floor(Math.sqrt(safeXP / 100)) + 1;
}

export function calculateXP(action, payload = {}) {
  const base = XP_ACTIONS[action] || 5;
  const qualityMultiplier = payload.quality === 'high' ? 1.2 : payload.quality === 'low' ? 0.85 : 1;
  const complexityBonus = Math.max(0, Number(payload.complexity || 0)) * 4;

  return Math.round(base * qualityMultiplier + complexityBonus);
}

export function processStepCompletion(stepId, state) {
  const now = new Date();
  const steps = Array.isArray(state?.steps) ? state.steps : [];
  const currentIndex = steps.findIndex((step) => step.id === stepId);

  if (currentIndex < 0) {
    return {
      xpGained: 0,
      leveledUp: false,
      newLevel: state?.level || 1,
      unlocked: [],
      streak: state?.streak || 0,
      nextState: state,
    };
  }

  const current = steps[currentIndex];
  const alreadyCompleted = current.status === 'completed';

  if (alreadyCompleted) {
    return {
      xpGained: 0,
      leveledUp: false,
      newLevel: state?.level || 1,
      unlocked: [],
      streak: state?.streak || 0,
      nextState: state,
    };
  }

  const streak = computeStreak(state?.lastCompletedAt, now);
  const streakBonusXP = Math.max(0, streak - 1) * XP_ACTIONS.streak_bonus;
  const xpGained = calculateXP('complete_step', { complexity: current.xp ? Math.floor(current.xp / 40) : 0 }) + streakBonusXP;

  const xpTotal = (state?.xpTotal || 0) + xpGained;
  const previousLevel = state?.level || calculateLevelFromXP(state?.xpTotal || 0);
  const newLevel = calculateLevelFromXP(xpTotal);
  const leveledUp = newLevel > previousLevel;

  const unlocked = [];
  const nextSteps = steps.map((step, index) => {
    if (step.id === stepId) {
      return { ...step, status: 'completed', unlocked: true };
    }

    if (index === currentIndex + 1 && (step.status === 'locked' || !step.unlocked)) {
      unlocked.push(step.id);
      return { ...step, status: 'active', unlocked: true };
    }

    if (index > currentIndex + 1 && !step.unlocked) {
      return { ...step, status: 'locked', unlocked: false };
    }

    if (step.status === 'active') {
      return { ...step, status: 'available', unlocked: true };
    }

    return step;
  });

  const completedCount = nextSteps.filter((step) => step.status === 'completed').length;
  const progress = nextSteps.length > 0 ? Math.round((completedCount / nextSteps.length) * 100) : 0;

  return {
    xpGained,
    leveledUp,
    newLevel,
    unlocked,
    streak,
    nextState: {
      ...state,
      steps: nextSteps,
      xpTotal,
      level: newLevel,
      streak,
      progress,
      lastCompletedAt: now.toISOString(),
    },
  };
}
