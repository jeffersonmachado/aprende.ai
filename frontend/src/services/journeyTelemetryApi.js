import api from './api.js';
import { mapFrontendToBackend } from '../features/journey-flow/journeyFlow.mapper.js';

export async function postJourneyTelemetryEvent(event) {
  const payload = mapFrontendToBackend(event);
  try {
    return await api.post('/api/journey-flow/telemetry', payload);
  } catch {
    try {
      return await api.post('/api/telemetry/journey', payload);
    } catch (error) {
      if (import.meta.env?.DEV) {
        // eslint-disable-next-line no-console
        console.error('Falha no envio de telemetria da jornada', error);
      }
      return null;
    }
  }
}
