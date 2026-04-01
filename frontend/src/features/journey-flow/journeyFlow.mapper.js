function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function mapFrontendToBackend(payload = {}) {
  return {
    ...payload,
    stepId: payload?.stepId ? String(payload.stepId) : payload?.stepId,
    eventType: payload?.eventType || payload?.type || null,
    metadata: payload?.metadata && typeof payload.metadata === 'object' ? payload.metadata : {}
  };
}

export function mapBackendToFrontend(payload = {}) {
  const journeyState = payload?.journeyState
    ? {
        ...payload.journeyState,
        progress: asNumber(payload?.journeyState?.progress, 0),
        xpTotal: asNumber(payload?.journeyState?.xpTotal, 0),
        level: asNumber(payload?.journeyState?.level, 1),
        streak: asNumber(payload?.journeyState?.streak, 1),
        rewards: safeArray(payload?.journeyState?.rewards || payload?.rewardsState?.items)
      }
    : null;

  return {
    ...payload,
    journeyState,
    rewardsState: {
      items: safeArray(payload?.rewardsState?.items || journeyState?.rewards),
      updatedAt: payload?.rewardsState?.updatedAt || null
    }
  };
}
