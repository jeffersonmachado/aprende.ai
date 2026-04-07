import { v4 as uuidv4 } from 'uuid';
import { JourneyState } from '../../db/models/index.js';
import { ENGINE_PHASE_SEQUENCE } from './phase-resolver.service.js';

export const DEFAULT_WORLD_STATE = {
  tension_level: 46,
  stakeholder_trust: 58,
  budget: 72,
  morale: 64,
  time_pressure: 52,
  learning_confidence: 49,
  team_alignment: 57,
  market_perception: 55,
  execution_risk: 44
};

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, asNumber(value, min)));
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizeWorldState(worldState = {}) {
  return Object.fromEntries(Object.entries(DEFAULT_WORLD_STATE).map(([key, fallback]) => ([
    key,
    Number.isFinite(Number(worldState?.[key]))
      ? clamp(worldState?.[key], 0, key === 'budget' ? 120 : 100)
      : fallback
  ])));
}

function createDefaultEngineState() {
  return {
    version: 'journey-engine.v1',
    activePhaseId: ENGINE_PHASE_SEQUENCE[0],
    completedPhaseIds: [],
    currentChapterId: 'capitulo-1',
    currentMissionId: null,
    worldState: normalizeWorldState(),
    worldStateHistory: [{ at: new Date().toISOString(), label: 'baseline', worldState: normalizeWorldState() }],
    lastDecision: null,
    lastConsequence: null,
    latestTwist: null,
    reflection: null,
    latestResult: null,
    progression: null,
    auditTrail: [],
    unlockedContent: [],
    phaseCriteria: {},
    updatedAt: null
  };
}

export function normalizeJourneyEngineState(value = {}) {
  const baseline = createDefaultEngineState();
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return baseline;
  }

  return {
    ...baseline,
    ...value,
    activePhaseId: ENGINE_PHASE_SEQUENCE.includes(value.activePhaseId) ? value.activePhaseId : baseline.activePhaseId,
    completedPhaseIds: safeArray(value.completedPhaseIds).filter((item) => ENGINE_PHASE_SEQUENCE.includes(item)),
    worldState: normalizeWorldState(value.worldState),
    worldStateHistory: safeArray(value.worldStateHistory).slice(-20),
    auditTrail: safeArray(value.auditTrail).slice(-80)
  };
}

export function appendAuditEvent(engineState, event) {
  return {
    ...engineState,
    auditTrail: [...safeArray(engineState.auditTrail), {
      id: uuidv4(),
      at: new Date().toISOString(),
      ...event
    }].slice(-80),
    updatedAt: new Date().toISOString()
  };
}

export function appendWorldStateSnapshot(engineState, label, worldState) {
  return {
    ...engineState,
    worldState: normalizeWorldState(worldState),
    worldStateHistory: [...safeArray(engineState.worldStateHistory), {
      at: new Date().toISOString(),
      label,
      worldState: normalizeWorldState(worldState)
    }].slice(-20),
    updatedAt: new Date().toISOString()
  };
}

export function applyWorldDelta(worldState, delta = {}) {
  const next = normalizeWorldState(worldState);
  for (const [key, amount] of Object.entries(delta)) {
    if (!(key in next)) continue;
    const max = key === 'budget' ? 120 : 100;
    next[key] = clamp(asNumber(next[key], 0) + asNumber(amount, 0), 0, max);
  }
  return next;
}

export async function getJourneyEngineStateRecord(tenantId, userId) {
  const [record] = await JourneyState.findOrCreate({
    where: { tenantId, userId },
    defaults: {
      id: uuidv4(),
      tenantId,
      userId,
      journeyPlanId: null,
      currentStepId: null,
      progressPercent: 0,
      stateJson: { journeyEngine: createDefaultEngineState() }
    }
  });

  const currentStateJson = record.stateJson || {};
  const engineState = normalizeJourneyEngineState(currentStateJson.journeyEngine);

  if (!currentStateJson.journeyEngine) {
    await record.update({
      stateJson: {
        ...currentStateJson,
        journeyEngine: engineState
      }
    });
  }

  return { record, engineState };
}

export async function persistJourneyEngineState(record, engineState) {
  const currentStateJson = record.stateJson || {};
  await record.update({
    lastEventAt: new Date(),
    stateJson: {
      ...currentStateJson,
      journeyEngine: normalizeJourneyEngineState(engineState)
    }
  });

  return normalizeJourneyEngineState(engineState);
}