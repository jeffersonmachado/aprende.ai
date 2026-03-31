import api from './api.js';

export function getJourneyFlowState() {
  return api.get('/api/journey-flow/state');
}

export function saveJourneyFlowState(payload) {
  return api.post('/api/journey-flow/state', payload);
}
