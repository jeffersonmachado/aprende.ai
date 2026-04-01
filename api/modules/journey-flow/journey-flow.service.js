import { v4 as uuidv4 } from 'uuid';
import {
  JourneyEvent,
  JourneyReward,
  JourneyState,
  MentorState
} from '../../db/models/index.js';
import { recordGamificationEvent } from '../gamification/gamification.service.js';
import {
  applyStepCompletion,
  calculateProgress,
  createInitialJourneyState,
  normalizeJourneyState,
  resolveRewards
} from './journey-domain.service.js';
import { mapBackendToFrontend, mapFrontendToBackend } from './journey-flow.mapper.js';
import { trackTelemetryEvent } from './telemetry.service.js';

const MAX_TELEMETRY_EVENTS = 120;

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function deriveProgressFromJourneyState(journeyState) {
  const progress = calculateProgress(journeyState?.steps || []);
  return {
    completedSteps: progress.completedSteps,
    xpTotal: asNumber(journeyState?.xpTotal, 0),
    level: asNumber(journeyState?.level, 1),
    streak: asNumber(journeyState?.streak, 1),
    lastCompletedAt: journeyState?.lastCompletedAt || null
  };
}

function normalizeMentorState(input) {
  return {
    lastMessage: input?.lastMessage || null,
    tone: input?.tone || 'coach',
    updatedAt: input?.updatedAt || null,
    context: input?.context || null
  };
}

function normalizeRewardsState(input, journeyState) {
  const baseline = safeArray(input?.items || input).map((item) => ({
    id: String(item?.id || item?.key || ''),
    key: String(item?.key || item?.id || ''),
    type: item?.type || 'badge',
    title: item?.title || 'Reward',
    description: item?.description || null,
    rarity: item?.rarity || 'common',
    source: item?.source || 'step',
    stepId: item?.stepId ? String(item.stepId) : null,
    effect: item?.effect || item?.metadata || {},
    unlockedAt: item?.unlockedAt || null,
    claimedAt: item?.claimedAt || null,
    claimed: Boolean(item?.claimed || item?.status === 'claimed')
  }));

  if (!journeyState?.steps?.length) {
    return {
      items: baseline,
      updatedAt: input?.updatedAt || null
    };
  }

  return {
    items: resolveRewards({
      steps: journeyState.steps,
      existingRewards: baseline,
      streak: asNumber(journeyState?.streak, 1)
    }),
    updatedAt: new Date().toISOString()
  };
}

function normalizeProgressState(input, journeyState) {
  if (input && Array.isArray(input.completedSteps)) {
    return {
      completedSteps: input.completedSteps.map((item) => String(item)),
      xpTotal: asNumber(input.xpTotal, 0),
      level: asNumber(input.level, 1),
      streak: asNumber(input.streak, 1),
      lastCompletedAt: input.lastCompletedAt || null
    };
  }

  if (journeyState) {
    return deriveProgressFromJourneyState(journeyState);
  }

  return {
    completedSteps: [],
    xpTotal: 0,
    level: 1,
    streak: 1,
    lastCompletedAt: null
  };
}

function toLegacyShape(snapshot) {
  const activeStep = safeArray(snapshot?.journeyState?.steps).find((item) => item.status === 'active');

  return {
    step: asNumber(snapshot?.step, asNumber(activeStep?.id, 1)),
    form: snapshot?.form || null,
    decision: snapshot?.decision || null,
    updatedAt: snapshot?.updatedAt || null
  };
}

function normalizeSnapshot(payload = {}, previousStateJson = {}) {
  const previousSnapshot = previousStateJson?.journeyFlowSnapshot || null;
  const previousLegacy = previousStateJson?.journeyFlow || null;

  const fallbackStep = payload.step || previousSnapshot?.step || previousLegacy?.step || 1;
  const journeyState = normalizeJourneyState(payload.journeyState || previousSnapshot?.journeyState, fallbackStep);

  const progressState = normalizeProgressState(
    payload.progressState || previousSnapshot?.progressState,
    journeyState
  );
  const mentorState = normalizeMentorState(payload.mentorState || previousSnapshot?.mentorState);
  const rewardsState = normalizeRewardsState(payload.rewardsState || previousSnapshot?.rewardsState, journeyState);

  const activeStep = safeArray(journeyState?.steps).find((item) => item.status === 'active');
  const step = asNumber(payload.step, asNumber(activeStep?.id, asNumber(previousLegacy?.step, 1)));

  const normalized = {
    step,
    form: payload.form ?? previousLegacy?.form ?? null,
    decision: payload.decision ?? previousLegacy?.decision ?? null,
    updatedAt: new Date().toISOString(),
    journeyState,
    progressState,
    mentorState,
    rewardsState
  };

  return normalized;
}

function getTelemetryState(stateJson = {}) {
  const events = safeArray(stateJson?.journey_events || stateJson?.journeyTelemetry?.events);
  const lastEventAt = stateJson?.journeyTelemetry?.lastEventAt || null;
  return { events, lastEventAt };
}

async function trackJourneyTelemetryEvent(tenantId, userId, event) {
  const normalizedEvent = mapFrontendToBackend(event);
  if (!normalizedEvent?.eventType) {
    return null;
  }

  const tracked = await trackTelemetryEvent({
    tenantId,
    userId,
    payload: normalizedEvent
  });

  if (tracked.eventType === 'step_completed') {
    await recordGamificationEvent(tenantId, userId, {
      eventType: 'stage_completed',
      source: 'journey-flow',
      xpAwarded: asNumber(tracked?.xpGained, 0),
      metadata: {
        stepId: tracked?.stepId || null,
        level: asNumber(tracked?.level, 1),
        leveledUp: Boolean(normalizedEvent?.metadata?.leveledUp),
        unlocked: safeArray(normalizedEvent?.metadata?.unlocked)
      }
    });
  }

  if (tracked.eventType === 'journey_synced' && asNumber(normalizedEvent?.metadata?.toStep, 0) === 15) {
    await recordGamificationEvent(tenantId, userId, {
      eventType: 'journey_completed',
      source: 'journey-flow',
      metadata: {
        fromStep: normalizedEvent?.metadata?.fromStep || null,
        toStep: normalizedEvent?.metadata?.toStep || null
      }
    });
  }

  return { ok: true, type: tracked.eventType };
}

function buildApiResponse(snapshot, telemetry) {
  return mapBackendToFrontend({
    ...toLegacyShape(snapshot),
    journeyState: snapshot?.journeyState || null,
    progressState: snapshot?.progressState || {
      completedSteps: [],
      xpTotal: 0,
      level: 1,
      streak: 1,
      lastCompletedAt: null
    },
    mentorState: snapshot?.mentorState || normalizeMentorState(),
    rewardsState: snapshot?.rewardsState || { items: [], updatedAt: null },
    telemetrySummary: {
      eventsTracked: safeArray(telemetry?.events).length,
      lastEventAt: telemetry?.lastEventAt || null
    }
  });
}

async function persistSeparatedState({ tenantId, userId, state, snapshot, telemetryEvents }) {
  try {
    await JourneyReward.destroy({ where: { tenantId, userId } });
    const rewardRows = safeArray(snapshot?.rewardsState?.items)
      .filter((item) => item?.id || item?.key)
      .map((reward) => ({
        id: String(reward.id || reward.key),
        tenantId,
        userId,
        journeyStateId: state.id,
        type: reward.type || 'badge',
        title: reward.title || 'Reward',
        description: reward.description || null,
        rarity: reward.rarity || 'common',
        source: reward.source || 'step',
        stepId: reward.stepId || null,
        effect: reward.effect || {},
        unlockedAt: reward.unlockedAt || null,
        claimedAt: reward.claimedAt || null,
        claimed: Boolean(reward.claimed)
      }));

    if (rewardRows.length) {
      await JourneyReward.bulkCreate(rewardRows);
    }
  } catch {
    // fallback for environments not migrated yet
  }

  try {
    const mentor = await MentorState.findOne({ where: { tenantId, userId } });
    if (mentor) {
      await mentor.update({
        journeyStateId: state.id,
        lastMessage: snapshot?.mentorState?.lastMessage || null,
        tone: snapshot?.mentorState?.tone || 'coach',
        context: snapshot?.mentorState?.context || null
      });
    } else {
      await MentorState.create({
        id: uuidv4(),
        tenantId,
        userId,
        journeyStateId: state.id,
        lastMessage: snapshot?.mentorState?.lastMessage || null,
        tone: snapshot?.mentorState?.tone || 'coach',
        context: snapshot?.mentorState?.context || null
      });
    }
  } catch {
    // fallback for environments not migrated yet
  }

  try {
    await JourneyEvent.destroy({ where: { tenantId, userId } });
    const rows = safeArray(telemetryEvents).map((event) => ({
      id: event.id || uuidv4(),
      tenantId,
      userId,
      journeyId: state.id,
      eventType: event.eventType || event.type || 'journey_synced',
      stepId: event.stepId || null,
      xpGained: asNumber(event.xpGained, 0),
      level: asNumber(event.level, 1),
      streak: asNumber(event.streak, 1),
      metadata: event.metadata || {},
      createdAt: new Date(event.createdAt || event.at || new Date().toISOString()),
      updatedAt: new Date()
    }));
    if (rows.length) {
      await JourneyEvent.bulkCreate(rows);
    }
  } catch {
    // fallback for environments not migrated yet
  }
}

export async function getJourneyFlowState(tenantId, userId) {
  const state = await JourneyState.findOne({ where: { tenantId, userId } });

  if (!state) {
    const initialJourneyState = createInitialJourneyState(1);
    const snapshot = normalizeSnapshot({
      step: 1,
      journeyState: initialJourneyState,
      progressState: deriveProgressFromJourneyState(initialJourneyState),
      rewardsState: {
        items: initialJourneyState.rewards,
        updatedAt: null
      }
    }, {});
    return buildApiResponse(snapshot, { events: [], lastEventAt: null });
  }

  const rewardsFromTable = await JourneyReward.findAll({ where: { tenantId, userId }, raw: true }).catch(() => []);
  const mentorFromTable = await MentorState.findOne({ where: { tenantId, userId }, raw: true }).catch(() => null);

  const snapshot = normalizeSnapshot({
    journeyState: state.stateJson?.journey_state || state.stateJson?.journeyFlowSnapshot?.journeyState,
    rewardsState: {
      items: rewardsFromTable?.length ? rewardsFromTable : state.stateJson?.journey_rewards || state.stateJson?.journeyFlowSnapshot?.rewardsState?.items,
      updatedAt: state.stateJson?.journey_rewards_updated_at || state.stateJson?.journeyFlowSnapshot?.rewardsState?.updatedAt || null
    },
    mentorState: mentorFromTable
      ? {
          lastMessage: mentorFromTable.lastMessage,
          tone: mentorFromTable.tone,
          context: mentorFromTable.context,
          updatedAt: mentorFromTable.updatedAt
        }
      : state.stateJson?.mentor_state || state.stateJson?.journeyFlowSnapshot?.mentorState,
    progressState: state.stateJson?.journeyFlowSnapshot?.progressState,
    step: state.stateJson?.journeyFlowSnapshot?.step || 1
  }, state.stateJson || {});
  const telemetry = getTelemetryState(state.stateJson || {});
  return buildApiResponse(snapshot, telemetry);
}

export async function saveJourneyFlowState(tenantId, userId, payload) {
  const [state] = await JourneyState.findOrCreate({
    where: { tenantId, userId },
    defaults: {
      id: uuidv4(),
      tenantId,
      userId,
      journeyPlanId: null,
      currentStepId: null,
      progressPercent: 0,
      stateJson: {}
    }
  });

  const normalizedPayload = payload || {};
  const previousSnapshot = normalizeSnapshot({}, state.stateJson || {});
  const nextJourneyState = normalizeJourneyState(
    normalizedPayload?.journeyState || previousSnapshot.journeyState,
    normalizedPayload?.step || previousSnapshot.step || 1
  );
  const nextSnapshot = normalizeSnapshot({
    ...normalizedPayload,
    journeyState: nextJourneyState,
    progressState: deriveProgressFromJourneyState(nextJourneyState),
    rewardsState: {
      items: nextJourneyState.rewards,
      updatedAt: new Date().toISOString()
    }
  }, state.stateJson || {});
  const telemetry = getTelemetryState(state.stateJson || {});
  const maybeTelemetryEvent = normalizedPayload?.journeyTelemetry || null;

  const nextTelemetryEvents = maybeTelemetryEvent
    ? [...telemetry.events, maybeTelemetryEvent].slice(-MAX_TELEMETRY_EVENTS)
    : telemetry.events;

  await state.update({
    progressPercent: asNumber(nextSnapshot?.journeyState?.progress, state.progressPercent || 0),
    lastEventAt: new Date(),
    stateJson: {
      ...(state.stateJson || {}),
      journey_state: nextSnapshot.journeyState,
      journey_rewards: nextSnapshot.rewardsState.items,
      journey_rewards_updated_at: nextSnapshot.rewardsState.updatedAt,
      journey_events: nextTelemetryEvents,
      mentor_state: nextSnapshot.mentorState,
      journeyFlow: toLegacyShape(nextSnapshot),
      journeyFlowSnapshot: nextSnapshot,
      journeyTelemetry: {
        events: nextTelemetryEvents,
        lastEventAt: maybeTelemetryEvent ? new Date().toISOString() : telemetry.lastEventAt
      }
    }
  });

  if (maybeTelemetryEvent) {
    await trackJourneyTelemetryEvent(tenantId, userId, maybeTelemetryEvent);
  }

  await persistSeparatedState({
    tenantId,
    userId,
    state,
    snapshot: nextSnapshot,
    telemetryEvents: nextTelemetryEvents
  });

  return buildApiResponse(nextSnapshot, {
    events: nextTelemetryEvents,
    lastEventAt: maybeTelemetryEvent ? new Date().toISOString() : telemetry.lastEventAt
  });
}

export async function registerJourneyTelemetry(tenantId, userId, payload = {}) {
  const state = await JourneyState.findOne({ where: { tenantId, userId } });
  const currentStateJson = state?.stateJson || {};
  const telemetry = getTelemetryState(currentStateJson);

  const normalizedEvent = mapFrontendToBackend({
    ...payload,
    createdAt: payload?.at || payload?.createdAt || new Date().toISOString()
  });

  if (!normalizedEvent.eventType) {
    throw new Error('type é obrigatório para telemetry.');
  }

  await trackJourneyTelemetryEvent(tenantId, userId, normalizedEvent);

  if (state) {
    const events = [...telemetry.events, normalizedEvent].slice(-MAX_TELEMETRY_EVENTS);
    await state.update({
      lastEventAt: new Date(),
      stateJson: {
        ...currentStateJson,
        journey_events: events,
        journeyTelemetry: {
          events,
          lastEventAt: normalizedEvent.createdAt
        }
      }
    });
  }

  return {
    ok: true,
    trackedType: normalizedEvent.eventType,
    trackedAt: normalizedEvent.createdAt
  };
}

export async function completeJourneyStep(tenantId, userId, payload = {}) {
  const stepId = String(payload?.stepId || payload?.step || '').trim();
  if (!stepId) {
    throw new Error('stepId é obrigatório para concluir etapa.');
  }

  const [state] = await JourneyState.findOrCreate({
    where: { tenantId, userId },
    defaults: {
      id: uuidv4(),
      tenantId,
      userId,
      journeyPlanId: null,
      currentStepId: null,
      progressPercent: 0,
      stateJson: {}
    }
  });

  const previousSnapshot = normalizeSnapshot({}, state.stateJson || {});
  const baselineJourneyState = previousSnapshot?.journeyState?.steps?.length
    ? previousSnapshot.journeyState
    : createInitialJourneyState(stepId);

  const { nextState, result } = applyStepCompletion(baselineJourneyState, stepId);
  const nextSnapshot = normalizeSnapshot({
    step: stepId,
    journeyState: nextState,
    progressState: deriveProgressFromJourneyState(nextState),
    rewardsState: { items: nextState.rewards, updatedAt: new Date().toISOString() },
    mentorState: previousSnapshot.mentorState
  }, state.stateJson || {});

  const telemetry = getTelemetryState(state.stateJson || {});
  const completionEvent = {
    eventType: 'step_completed',
    stepId,
    xpGained: result.xpGained,
    level: result.newLevel,
    streak: result.streak,
    metadata: {
      unlocked: result.unlocked,
      leveledUp: result.leveledUp
    },
    createdAt: new Date().toISOString()
  };

  const nextTelemetryEvents = [...telemetry.events, completionEvent].slice(-MAX_TELEMETRY_EVENTS);

  await state.update({
    progressPercent: asNumber(nextSnapshot?.journeyState?.progress, state.progressPercent || 0),
    lastEventAt: new Date(),
    stateJson: {
      ...(state.stateJson || {}),
      journey_state: nextSnapshot.journeyState,
      journey_rewards: nextSnapshot.rewardsState.items,
      journey_rewards_updated_at: nextSnapshot.rewardsState.updatedAt,
      journey_events: nextTelemetryEvents,
      mentor_state: nextSnapshot.mentorState,
      journeyFlow: toLegacyShape(nextSnapshot),
      journeyFlowSnapshot: nextSnapshot,
      journeyTelemetry: {
        events: nextTelemetryEvents,
        lastEventAt: completionEvent.createdAt
      }
    }
  });

  await trackJourneyTelemetryEvent(tenantId, userId, completionEvent);

  if (Array.isArray(result.rewardsUnlocked) && result.rewardsUnlocked.length) {
    await Promise.all(result.rewardsUnlocked.map((reward) => trackJourneyTelemetryEvent(tenantId, userId, {
      eventType: 'reward_unlocked',
      stepId,
      level: result.newLevel,
      streak: result.streak,
      metadata: {
        rewardId: reward.id,
        rewardType: reward.type,
        rarity: reward.rarity
      },
      createdAt: new Date().toISOString()
    })));
  }

  if (result.leveledUp) {
    await trackJourneyTelemetryEvent(tenantId, userId, {
      eventType: 'level_up',
      level: result.newLevel,
      streak: result.streak,
      metadata: { stepId }
    });
  }

  await persistSeparatedState({
    tenantId,
    userId,
    state,
    snapshot: nextSnapshot,
    telemetryEvents: nextTelemetryEvents
  });

  return {
    ...buildApiResponse(nextSnapshot, {
      events: nextTelemetryEvents,
      lastEventAt: completionEvent.createdAt
    }),
    result
  };
}

export async function claimJourneyReward(tenantId, userId, payload = {}) {
  const rewardKey = String(payload?.rewardKey || payload?.rewardId || '').trim();
  if (!rewardKey) {
    throw new Error('rewardKey é obrigatório para claim.');
  }

  const state = await JourneyState.findOne({ where: { tenantId, userId } });
  if (!state) {
    throw new Error('Estado da jornada não encontrado para claim.');
  }

  const snapshot = normalizeSnapshot({}, state.stateJson || {});
  const rewards = normalizeRewardsState(snapshot.rewardsState, snapshot.journeyState);
  const index = rewards.items.findIndex((item) => item.key === rewardKey || item.id === rewardKey);

  if (index < 0) {
    throw new Error('Recompensa não encontrada.');
  }

  if (rewards.items[index].status === 'locked') {
    throw new Error('Recompensa ainda bloqueada.');
  }

  rewards.items[index] = {
    ...rewards.items[index],
    status: 'claimed',
    claimed: true,
    claimedAt: new Date().toISOString()
  };
  rewards.updatedAt = new Date().toISOString();

  const nextSnapshot = {
    ...snapshot,
    rewardsState: rewards,
    updatedAt: new Date().toISOString()
  };

  await state.update({
    lastEventAt: new Date(),
    stateJson: {
      ...(state.stateJson || {}),
      journey_state: nextSnapshot.journeyState,
      journey_rewards: rewards.items,
      journey_rewards_updated_at: rewards.updatedAt,
      journey_events: [
        ...safeArray(state.stateJson?.journey_events),
        {
          eventType: 'reward_claimed',
          metadata: { rewardKey },
          createdAt: new Date().toISOString()
        }
      ].slice(-MAX_TELEMETRY_EVENTS),
      journeyFlow: toLegacyShape(nextSnapshot),
      journeyFlowSnapshot: nextSnapshot
    }
  });

  await trackJourneyTelemetryEvent(tenantId, userId, {
    eventType: 'reward_claimed',
    metadata: {
      rewardKey
    },
    createdAt: new Date().toISOString()
  });

  await recordGamificationEvent(tenantId, userId, {
    eventType: 'mentor_interaction',
    source: 'journey-flow',
    metadata: {
      rewardKey,
      rewardType: rewards.items[index].type,
      source: rewards.items[index].source
    }
  });

  await persistSeparatedState({
    tenantId,
    userId,
    state,
    snapshot: nextSnapshot,
    telemetryEvents: [
      ...safeArray(state.stateJson?.journey_events),
      {
        eventType: 'reward_claimed',
        metadata: { rewardKey },
        createdAt: new Date().toISOString()
      }
    ].slice(-MAX_TELEMETRY_EVENTS)
  });

  return {
    reward: rewards.items[index],
    rewardsState: rewards
  };
}
