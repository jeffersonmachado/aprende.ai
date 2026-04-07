function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const EVENT_ALIAS = {
  journey_step_selected: 'step_selected',
  journey_step_completed: 'step_completed',
  journey_reward_claimed: 'reward_claimed',
  journey_state_sync: 'journey_synced',
  journey_completion_transition: 'journey_synced',
  gamified_onboarding_selected: 'step_selected',
  gamified_map_opened: 'journey_synced',
  gamified_mission_selected: 'step_selected',
  gamified_plot_selected: 'step_selected',
  gamified_dashboard_opened: 'journey_synced',
  gamified_result_opened: 'journey_synced'
};

export function mapFrontendToBackend(payload = {}) {
  const eventType = String(payload?.eventType || payload?.type || '').trim();

  return {
    ...payload,
    eventType: EVENT_ALIAS[eventType] || eventType || null,
    stepId: payload?.stepId ? String(payload.stepId) : null,
    xpGained: asNumber(payload?.xpGained, 0),
    level: asNumber(payload?.level, 1),
    streak: asNumber(payload?.streak, 1),
    metadata: payload?.metadata && typeof payload.metadata === 'object' ? payload.metadata : {}
  };
}

export function mapBackendToFrontend(payload = {}) {
  const rewards = safeArray(payload?.rewardsState?.items || payload?.journeyState?.rewards || payload?.rewards)
    .map((reward) => ({
      ...reward,
      key: reward.key || reward.id,
      status: reward.claimed ? 'claimed' : reward.unlockedAt ? 'unlocked' : 'locked'
    }));

  const journeyState = payload?.journeyState
    ? {
        ...payload.journeyState,
        rewards,
        rewardsState: {
          items: rewards,
          updatedAt: payload?.rewardsState?.updatedAt || new Date().toISOString()
        }
      }
    : null;

  return {
    ...payload,
    journeyState,
    progressState: payload?.progressState || {
      completedSteps: safeArray(journeyState?.steps).filter((step) => step.status === 'completed').map((step) => String(step.id)),
      xpTotal: asNumber(journeyState?.xpTotal, 0),
      level: asNumber(journeyState?.level, 1),
      streak: asNumber(journeyState?.streak, 1),
      lastCompletedAt: journeyState?.lastCompletedAt || null
    },
    rewardsState: {
      items: rewards,
      updatedAt: payload?.rewardsState?.updatedAt || null
    }
  };
}
