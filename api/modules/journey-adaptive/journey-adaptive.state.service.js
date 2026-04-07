import { v4 as uuidv4 } from 'uuid';
import { JourneyState } from '../../db/models/index.js';
import { ADAPTIVE_FRAMEWORK_VERSION, ADAPTIVE_RUNTIME_VERSION } from './journey-adaptive.constants.js';

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function safeObject(value) {
  return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
}

export function createDefaultJourneyAdaptiveState() {
  return {
    version: ADAPTIVE_RUNTIME_VERSION,
    frameworkVersion: ADAPTIVE_FRAMEWORK_VERSION,
    status: 'idle',
    diagnostic: null,
    activeJourney: null,
    journeys: [],
    auditTrail: [],
    updatedAt: null
  };
}

export function normalizeJourneyAdaptiveState(value = {}) {
  const baseline = createDefaultJourneyAdaptiveState();
  const input = safeObject(value);

  return {
    ...baseline,
    ...input,
    journeys: safeArray(input.journeys).slice(-8),
    auditTrail: safeArray(input.auditTrail).slice(-120),
    activeJourney: input.activeJourney && typeof input.activeJourney === 'object'
      ? {
        id: input.activeJourney.id || uuidv4(),
        status: input.activeJourney.status || 'active',
        competencyCode: input.activeJourney.competencyCode || null,
        competencyName: input.activeJourney.competencyName || null,
        learnerSnapshot: safeObject(input.activeJourney.learnerSnapshot),
        createdAt: input.activeJourney.createdAt || new Date().toISOString(),
        completedAt: input.activeJourney.completedAt || null,
        learningStrategy: input.activeJourney.learningStrategy || 'adaptive_controlled',
        mentorPreset: safeObject(input.activeJourney.mentorPreset),
        planSource: input.activeJourney.planSource || 'deterministic',
        estimatedChapterCount: Number(input.activeJourney.estimatedChapterCount || 0),
        chapterBounds: safeObject(input.activeJourney.chapterBounds),
        reinforcementPolicy: safeObject(input.activeJourney.reinforcementPolicy),
        accelerationPolicy: safeObject(input.activeJourney.accelerationPolicy),
        currentChapterId: input.activeJourney.currentChapterId || null,
        chapterCursor: Number.isInteger(input.activeJourney.chapterCursor) ? input.activeJourney.chapterCursor : 0,
        plan: safeArray(input.activeJourney.plan).map((chapter, index) => ({
          ...chapter,
          sequence: Number.isInteger(chapter.sequence) ? chapter.sequence : index + 1,
          status: chapter.status || 'pending'
        })),
        completedExecutions: safeArray(input.activeJourney.completedExecutions).slice(-24),
        evidences: safeArray(input.activeJourney.evidences).slice(-80),
        competencyProgress: safeObject(input.activeJourney.competencyProgress),
        explanations: {
          reinforcement: safeArray(input.activeJourney.explanations?.reinforcement),
          acceleration: safeArray(input.activeJourney.explanations?.acceleration),
          closure: safeArray(input.activeJourney.explanations?.closure),
          validation: safeArray(input.activeJourney.explanations?.validation)
        },
        auditTrail: safeArray(input.activeJourney.auditTrail).slice(-160),
        lastChapterResult: input.activeJourney.lastChapterResult || null,
        summary: safeObject(input.activeJourney.summary)
      }
      : null,
    updatedAt: input.updatedAt || null
  };
}

export function appendAdaptiveAuditEvent(state, event) {
  const normalized = normalizeJourneyAdaptiveState(state);
  const entry = {
    id: uuidv4(),
    at: new Date().toISOString(),
    ...event
  };

  const nextState = {
    ...normalized,
    auditTrail: [...normalized.auditTrail, entry].slice(-120),
    updatedAt: entry.at
  };

  if (nextState.activeJourney) {
    nextState.activeJourney = {
      ...nextState.activeJourney,
      auditTrail: [...safeArray(nextState.activeJourney.auditTrail), entry].slice(-160)
    };
  }

  return nextState;
}

export async function getJourneyAdaptiveStateRecord(tenantId, userId) {
  const [record] = await JourneyState.findOrCreate({
    where: { tenantId, userId },
    defaults: {
      id: uuidv4(),
      tenantId,
      userId,
      journeyPlanId: null,
      currentStepId: null,
      progressPercent: 0,
      stateJson: { journeyAdaptive: createDefaultJourneyAdaptiveState() }
    }
  });

  const currentStateJson = record.stateJson || {};
  const adaptiveState = normalizeJourneyAdaptiveState(currentStateJson.journeyAdaptive);

  if (!currentStateJson.journeyAdaptive) {
    await record.update({
      stateJson: {
        ...currentStateJson,
        journeyAdaptive: adaptiveState
      }
    });
  }

  return { record, adaptiveState };
}

export async function persistJourneyAdaptiveState(record, adaptiveState) {
  const currentStateJson = record.stateJson || {};
  const normalized = normalizeJourneyAdaptiveState(adaptiveState);

  await record.update({
    lastEventAt: new Date(),
    stateJson: {
      ...currentStateJson,
      journeyAdaptive: normalized
    }
  });

  return normalized;
}
