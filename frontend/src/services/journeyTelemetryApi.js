import api from './api.js';
import { mapFrontendToBackend } from '../features/journey-flow/journeyFlow.mapper.js';

export async function postJourneyTelemetryEvent(event) {
  const payload = mapFrontendToBackend(event);
  try {
    const response = await api.post('/api/journey-flow/telemetry', payload);
    return {
      ok: true,
      endpoint: '/api/journey-flow/telemetry',
      response,
    };
  } catch (error) {
    const failure = new Error('Falha ao sincronizar telemetria da jornada.');
    failure.cause = error;
    failure.details = {
      primary: error?.message || null,
    };
    if (import.meta.env?.DEV) {
      // eslint-disable-next-line no-console
      console.error('Falha no envio de telemetria da jornada', failure);
    }
    return {
      ok: false,
      error: failure.message,
      details: failure.details,
    };
  }
}
