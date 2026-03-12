import { v4 as uuidv4 } from 'uuid';
import { IntegrationEvent } from '../../db/models/index.js';
export async function listEvents(tenantId) { return IntegrationEvent.findAll({ where: tenantId ? { tenantId } : {}, order: [['createdAt', 'DESC']], limit: 50 }); }
export async function publishEvent(tenantId, payload) { return IntegrationEvent.create({ id: uuidv4(), tenantId, sourceSystem: payload.sourceSystem || 'aprende-ai', eventType: payload.eventType, direction: payload.direction || 'outbound', status: 'pending', payload: payload.payload || {} }); }
