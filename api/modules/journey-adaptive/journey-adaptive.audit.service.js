import { v4 as uuidv4 } from 'uuid';
import { JourneyEvent } from '../../db/models/index.js';

export async function recordAdaptiveJourneyEvent(tenantId, userId, journeyStateId, eventType, metadata = {}) {
  await JourneyEvent.create({
    id: uuidv4(),
    tenantId,
    userId,
    journeyId: journeyStateId,
    eventType,
    metadata,
    createdAt: new Date(),
    updatedAt: new Date()
  }).catch(() => null);
}
