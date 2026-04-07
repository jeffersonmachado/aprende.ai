import api from './api.js';

export function getJourneyEngineRuntime() {
  return api.get('/api/journey-engine/runtime');
}

export function startJourneyEnginePhase(phaseId, payload = {}) {
  return api.post(`/api/journey-engine/phases/${phaseId}/start`, payload);
}

export function submitJourneyEngineDecision(payload = {}) {
  return api.post('/api/journey-engine/decision', payload);
}

export function resolveJourneyEngineTwist(payload = {}) {
  return api.post('/api/journey-engine/twist/resolve', payload);
}

export function submitJourneyEngineReflection(payload = {}) {
  return api.post('/api/journey-engine/reflection', payload);
}

export function finalizeJourneyEnginePhase(payload = {}) {
  return api.post('/api/journey-engine/finalize', payload);
}

export function getJourneyEngineCompetencies() {
  return api.get('/api/journey-engine/competencies');
}