import { v4 as uuidv4 } from 'uuid';
import { IntegrationEvent, JourneyEvent } from '../../db/models/index.js';

const VALID_EVENT_TYPES = new Set([
  'step_selected',
  'step_completed',
  'chapter_unlocked',
  'chapter_completed',
  'reward_unlocked',
  'reward_claimed',
  'level_up',
  'journey_synced',
  'mentor_message',
  'plot_twist_triggered',
  'plot_twist_resolved',
  'journey_resumed'
]);

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function normalizeMetadata(metadata) {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) {
    return {};
  }

  const normalized = {};
  for (const [key, value] of Object.entries(metadata)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
      normalized[key] = value;
      continue;
    }
    normalized[key] = JSON.parse(JSON.stringify(value));
  }

  return normalized;
}

export function validateEventType(eventType) {
  return VALID_EVENT_TYPES.has(String(eventType || '').trim());
}

export function buildTelemetryEvent({ tenantId, userId, journeyId = null, payload = {} }) {
  const eventType = String(payload?.eventType || payload?.type || '').trim();
  if (!validateEventType(eventType)) {
    throw new Error('eventType invalido para telemetria de jornada.');
  }

  return {
    id: uuidv4(),
    tenantId,
    userId,
    journeyId,
    eventType,
    stepId: payload?.stepId ? String(payload.stepId) : null,
    xpGained: asNumber(payload?.xpGained, 0),
    level: asNumber(payload?.level, 1),
    streak: asNumber(payload?.streak, 1),
    metadata: normalizeMetadata(payload?.metadata),
    createdAt: payload?.createdAt || payload?.at || new Date().toISOString()
  };
}

export async function persistTelemetryEvent(event) {
  await IntegrationEvent.create({
    id: event.id,
    tenantId: event.tenantId,
    provider: 'aprende-ai',
    sourceSystem: 'journey-flow',
    eventName: event.eventType,
    eventType: `journey.${event.eventType}`,
    direction: 'inbound',
    status: 'processed',
    payload: {
      userId: event.userId,
      journeyId: event.journeyId,
      stepId: event.stepId,
      xpGained: event.xpGained,
      level: event.level,
      streak: event.streak,
      metadata: event.metadata,
      createdAt: event.createdAt
    },
    processedAt: new Date(event.createdAt)
  });

  try {
    await JourneyEvent.create({
      id: event.id,
      tenantId: event.tenantId,
      userId: event.userId,
      journeyId: event.journeyId,
      eventType: event.eventType,
      stepId: event.stepId,
      xpGained: event.xpGained,
      level: event.level,
      streak: event.streak,
      metadata: event.metadata,
      createdAt: new Date(event.createdAt),
      updatedAt: new Date(event.createdAt)
    });
  } catch {
    // fallback: table may not exist yet in all environments
  }

  return event;
}

export async function trackTelemetryEvent({ tenantId, userId, journeyId = null, payload = {} }) {
  const event = buildTelemetryEvent({ tenantId, userId, journeyId, payload });
  await persistTelemetryEvent(event);
  return event;
}
