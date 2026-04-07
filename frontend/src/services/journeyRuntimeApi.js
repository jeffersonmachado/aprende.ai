import api from './api.js';

export function getJourneyRuntime() {
  return api.get('/api/journey-runtime');
}

export function triggerPlotTwist(payload = {}) {
  return api.post('/api/journey-runtime/plot-twist', payload);
}

export function resolvePlotTwist(payload = {}) {
  return api.post('/api/journey-runtime/plot-twist/resolve', payload);
}

export function saveJourneyCampaignProgress(payload = {}) {
  return api.post('/api/journey-runtime/campaign-progress', payload);
}

export function getJourneyEffectivenessAnalytics(filters = {}) {
  const params = new URLSearchParams();
  if (filters?.days) params.set('days', String(filters.days));
  if (filters?.style) params.set('style', String(filters.style));
  if (filters?.kind) params.set('kind', String(filters.kind));
  if (filters?.chapterId) params.set('chapterId', String(filters.chapterId));
  if (filters?.phaseId) params.set('phaseId', String(filters.phaseId));
  if (filters?.runStatus) params.set('runStatus', String(filters.runStatus));
  if (filters?.linkMode) params.set('linkMode', String(filters.linkMode));

  const query = params.toString();
  return api.get(`/api/journey-runtime/analytics/effectiveness${query ? `?${query}` : ''}`);
}
