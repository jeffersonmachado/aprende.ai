const STEP_BLUEPRINT = [
  { id: '1', title: 'Abertura', description: 'Defina o desafio real e o impacto esperado.', xp: 40, reward: 'Briefing cognitivo', icon: 'play', position: { x: 14, y: 16 } },
  { id: '2', title: 'Contexto', description: 'Mapeie restricoes e sinais do ambiente.', xp: 45, reward: 'Radar de contexto', icon: 'brain', position: { x: 36, y: 24 } },
  { id: '3', title: 'Perfil', description: 'Ajuste estrategia ao seu perfil de decisao.', xp: 45, reward: 'Espelho de perfil', icon: 'star', position: { x: 62, y: 17 } },
  { id: '4', title: 'Objetivo', description: 'Converta intencao em objetivo verificavel.', xp: 50, reward: 'Marco de foco', icon: 'rocket', position: { x: 84, y: 27 } },
  { id: '5', title: 'Estilo', description: 'Ative o estilo de aprendizagem dominante.', xp: 50, reward: 'Booster de estilo', icon: 'sparkles', position: { x: 70, y: 41 } },
  { id: '6', title: 'Diagnostico', description: 'Leia sinais de lacuna e oportunidade.', xp: 55, reward: 'Scanner de lacunas', icon: 'brain', position: { x: 45, y: 35 } },
  { id: '7', title: 'Plano', description: 'Desenhe sequencia de execucao sob pressao.', xp: 60, reward: 'Blueprint tatico', icon: 'gem', position: { x: 20, y: 44 } },
  { id: '8', title: 'Trilha', description: 'Escolha rota de menor risco e maior aprendizado.', xp: 60, reward: 'Trilha desbloqueada', icon: 'rocket', position: { x: 14, y: 60 } },
  { id: '9', title: 'Cenario', description: 'Simule decisoes com variaveis reais.', xp: 65, reward: 'Simulador premium', icon: 'trophy', position: { x: 35, y: 68 } },
  { id: '10', title: 'Resultado', description: 'Interprete consequencias e trade-offs.', xp: 65, reward: 'Leitura de resultado', icon: 'star', position: { x: 56, y: 61 } },
  { id: '11', title: 'Mentoria', description: 'Refine criterios com provocacao do mentor IA.', xp: 70, reward: 'Insight de mentor', icon: 'crown', position: { x: 78, y: 69 } },
  { id: '12', title: 'Reforco', description: 'Consolide padrao de decisao replicavel.', xp: 70, reward: 'Modulo reforco', icon: 'sparkles', position: { x: 64, y: 82 } },
  { id: '13', title: 'Competencias', description: 'Mensure evolucao de assertividade e risco.', xp: 75, reward: 'Painel de competencias', icon: 'gem', position: { x: 39, y: 86 } },
  { id: '14', title: 'Proximo passo', description: 'Escalone para o proximo desafio cognitivo.', xp: 80, reward: 'Passaporte de fase', icon: 'rocket', position: { x: 20, y: 79 } },
  { id: '15', title: 'Resumo', description: 'Feche ciclo com clareza de progresso e rito.', xp: 90, reward: 'Badge estrategista', icon: 'crown', position: { x: 84, y: 88 } }
];

const XP_ACTIONS = {
  complete_step: 55,
  streak_bonus: 10
};

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

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

export function calculateLevelAndXP(xpTotal = 0) {
  const safeXP = Math.max(0, asNumber(xpTotal, 0));
  return {
    xpTotal: safeXP,
    level: Math.floor(Math.sqrt(safeXP / 100)) + 1
  };
}

export function calculateProgress(steps = []) {
  const safeSteps = safeArray(steps);
  const completed = safeSteps.filter((step) => step.status === 'completed').length;
  const progress = safeSteps.length > 0 ? Math.round((completed / safeSteps.length) * 100) : 0;
  const unlockedSteps = safeSteps.filter((step) => step.status !== 'locked').map((step) => String(step.id));

  return {
    progress,
    unlockedSteps,
    completedSteps: safeSteps.filter((step) => step.status === 'completed').map((step) => String(step.id))
  };
}

function toRarity(index) {
  if ((index + 1) % 5 === 0) return 'epic';
  if ((index + 1) % 3 === 0) return 'rare';
  return 'common';
}

function mergeClaimState(existingRewards, nextRewards) {
  const claimedMap = new Map(
    safeArray(existingRewards)
      .filter((item) => item?.claimed)
      .map((item) => [String(item.id || item.key), item])
  );

  return nextRewards.map((reward) => {
    const claimedEntry = claimedMap.get(String(reward.id));
    if (!claimedEntry) {
      return reward;
    }

    return {
      ...reward,
      claimed: true,
      claimedAt: claimedEntry.claimedAt || reward.claimedAt || new Date().toISOString()
    };
  });
}

export function resolveRewards({ steps = [], existingRewards = [], streak = 1 }) {
  const now = new Date().toISOString();
  const rewards = [];

  safeArray(steps).forEach((step, index) => {
    if (step.status !== 'completed') {
      return;
    }

    rewards.push({
      id: `step-${String(step.id)}`,
      key: `step-${String(step.id)}`,
      type: 'badge',
      title: step.reward || `Reward da etapa ${step.id}`,
      description: `Recompensa desbloqueada ao concluir a etapa ${step.id}.`,
      rarity: toRarity(index),
      source: 'step',
      effect: {
        xpBonus: asNumber(step.xp, 0)
      },
      stepId: String(step.id),
      unlockedAt: now,
      claimedAt: null,
      claimed: false,
      status: 'unlocked'
    });
  });

  const completedCount = safeArray(steps).filter((step) => step.status === 'completed').length;
  [5, 10, 15].forEach((milestone) => {
    if (completedCount < milestone) {
      return;
    }

    rewards.push({
      id: `milestone-${milestone}`,
      key: `milestone-${milestone}`,
      type: 'chest',
      title: `Bau de marco ${milestone}`,
      description: `Marco de ${milestone} etapas concluido.`,
      rarity: milestone >= 10 ? 'epic' : 'rare',
      source: 'milestone',
      effect: {
        xpBonus: milestone * 5
      },
      stepId: null,
      unlockedAt: now,
      claimedAt: null,
      claimed: false,
      status: 'unlocked'
    });
  });

  if (asNumber(streak, 1) >= 3) {
    rewards.push({
      id: `streak-${String(streak)}`,
      key: `streak-${String(streak)}`,
      type: 'xp_bonus',
      title: `Ritmo ${streak} dias`,
      description: 'Bonus por consistencia de estudo.',
      rarity: streak >= 7 ? 'epic' : 'rare',
      source: 'streak',
      effect: {
        multiplier: streak >= 7 ? 1.25 : 1.1
      },
      stepId: null,
      unlockedAt: now,
      claimedAt: null,
      claimed: false,
      status: 'unlocked'
    });
  }

  return mergeClaimState(existingRewards, rewards);
}

function normalizeSteps(inputSteps, activeStepId = '1') {
  const completedSet = new Set(
    safeArray(inputSteps)
      .filter((step) => step?.status === 'completed')
      .map((step) => String(step.id))
  );

  return STEP_BLUEPRINT.map((base, index) => {
    let status = 'locked';

    if (completedSet.has(base.id)) {
      status = 'completed';
    } else if (base.id === String(activeStepId)) {
      status = 'active';
    } else {
      const previousIncomplete = STEP_BLUEPRINT.slice(0, index).some((step) => !completedSet.has(step.id));
      if (!previousIncomplete) {
        status = 'available';
      }
    }

    return {
      ...base,
      status,
      unlocked: status !== 'locked'
    };
  });
}

export function createInitialJourneyState(step = 1) {
  const safeStep = String(Math.max(1, Math.min(STEP_BLUEPRINT.length, asNumber(step, 1))));
  const steps = normalizeSteps([], safeStep);
  const progress = calculateProgress(steps);

  return {
    steps,
    progress: progress.progress,
    xpTotal: 0,
    level: 1,
    streak: 1,
    lastCompletedAt: null,
    rewards: [],
    unlockedSteps: progress.unlockedSteps
  };
}

export function normalizeJourneyState(inputState, fallbackStep = 1) {
  if (!inputState?.steps?.length) {
    return createInitialJourneyState(fallbackStep);
  }

  const safeStep = String(Math.max(1, Math.min(STEP_BLUEPRINT.length, asNumber(fallbackStep, 1))));
  const activeStep = safeArray(inputState.steps).find((item) => item?.status === 'active')?.id || safeStep;
  const steps = normalizeSteps(inputState.steps, activeStep);
  const progress = calculateProgress(steps);
  const totals = calculateLevelAndXP(asNumber(inputState?.xpTotal, 0));
  const rewards = resolveRewards({
    steps,
    existingRewards: safeArray(inputState?.rewards || inputState?.rewardsState?.items),
    streak: asNumber(inputState?.streak, 1)
  });

  return {
    ...inputState,
    steps,
    progress: progress.progress,
    xpTotal: totals.xpTotal,
    level: asNumber(inputState?.level, totals.level),
    streak: Math.max(1, asNumber(inputState?.streak, 1)),
    lastCompletedAt: inputState?.lastCompletedAt || null,
    rewards,
    unlockedSteps: progress.unlockedSteps
  };
}

export function applyStepCompletion(journeyState, stepId) {
  const state = normalizeJourneyState(journeyState, stepId);
  const steps = safeArray(state.steps);
  const currentIndex = steps.findIndex((step) => String(step.id) === String(stepId));

  if (currentIndex < 0) {
    return {
      nextState: state,
      result: {
        xpGained: 0,
        newLevel: state.level,
        leveledUp: false,
        streak: state.streak,
        unlocked: []
      }
    };
  }

  const selectedStep = steps[currentIndex];
  if (selectedStep.status === 'locked' || selectedStep.status === 'completed') {
    return {
      nextState: state,
      result: {
        xpGained: 0,
        newLevel: state.level,
        leveledUp: false,
        streak: state.streak,
        unlocked: []
      }
    };
  }

  const now = new Date();
  const streak = computeStreak(state.lastCompletedAt, now);
  const complexity = selectedStep.xp ? Math.floor(asNumber(selectedStep.xp, 0) / 40) : 0;
  const xpGained = XP_ACTIONS.complete_step + Math.max(0, complexity * 4) + Math.max(0, streak - 1) * XP_ACTIONS.streak_bonus;
  const xpTotal = asNumber(state.xpTotal, 0) + xpGained;
  const previousLevel = asNumber(state.level, calculateLevelAndXP(state.xpTotal).level);
  const nextLevelData = calculateLevelAndXP(xpTotal);
  const leveledUp = nextLevelData.level > previousLevel;

  const unlocked = [];
  const nextSteps = steps.map((step, index) => {
    if (String(step.id) === String(stepId)) {
      return { ...step, status: 'completed', unlocked: true };
    }

    if (index === currentIndex + 1 && step.status === 'locked') {
      unlocked.push(String(step.id));
      return { ...step, status: 'active', unlocked: true };
    }

    if (step.status === 'active') {
      return { ...step, status: 'available', unlocked: true };
    }

    return { ...step };
  });

  if (!nextSteps.some((step) => step.status === 'active')) {
    const nextAvailable = nextSteps.find((step) => step.status === 'available');
    if (nextAvailable) {
      const index = nextSteps.findIndex((step) => step.id === nextAvailable.id);
      nextSteps[index] = { ...nextSteps[index], status: 'active' };
    }
  }

  const progress = calculateProgress(nextSteps);
  const rewards = resolveRewards({
    steps: nextSteps,
    existingRewards: state.rewards,
    streak
  });

  const nextState = {
    ...state,
    steps: nextSteps,
    xpTotal,
    level: nextLevelData.level,
    streak,
    lastCompletedAt: now.toISOString(),
    progress: progress.progress,
    unlockedSteps: progress.unlockedSteps,
    rewards
  };

  return {
    nextState,
    result: {
      xpGained,
      newLevel: nextLevelData.level,
      leveledUp,
      streak,
      unlocked,
      rewardsUnlocked: rewards.filter((reward) => !reward.claimed)
    }
  };
}
