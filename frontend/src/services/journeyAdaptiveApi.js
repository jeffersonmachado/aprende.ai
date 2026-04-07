import api from './api.js';

export function startAdaptiveDiagnostic(payload = {}) {
  return api.post('/api/journey-adaptive/diagnostic/start', payload);
}

export function createAdaptiveJourneySession(payload = {}) {
  return api.post('/api/journey-adaptive/session', payload);
}

export function getAdaptiveJourneyRuntime() {
  return api.get('/api/journey-adaptive/runtime');
}

export function getAdaptiveJourneyCurrentChapter() {
  return api.get('/api/journey-adaptive/current-chapter');
}

export function submitAdaptiveJourneyDecision(payload = {}) {
  return api.post('/api/journey-adaptive/decision', payload);
}

export function recalculateAdaptiveJourney(payload = {}) {
  return api.post('/api/journey-adaptive/recalculate', payload);
}

export function getAdaptiveJourneyProgress() {
  return api.get('/api/journey-adaptive/progress');
}

export function getAdaptiveJourneyEvidences() {
  return api.get('/api/journey-adaptive/evidences');
}

export function getAdaptiveJourneyHistory() {
  return api.get('/api/journey-adaptive/history');
}

export function getAdaptiveJourneyExplanations() {
  return api.get('/api/journey-adaptive/explanations');
}

export function completeAdaptiveJourney(payload = {}) {
  return api.post('/api/journey-adaptive/complete', payload);
}
