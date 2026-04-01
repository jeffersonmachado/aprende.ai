import api from './api.js';
import { mapBackendToFrontend, mapFrontendToBackend } from '../features/journey-flow/journeyFlow.mapper.js';

export async function getJourneyFlowState() {
  const payload = await api.get('/api/journey-flow/state');
  return mapBackendToFrontend(payload);
}

export async function saveJourneyFlowState(payload) {
  const response = await api.post('/api/journey-flow/state', mapFrontendToBackend(payload));
  return mapBackendToFrontend(response);
}

export async function completeJourneyStep(stepId, payload = {}) {
  const response = await api.post(`/api/journey-flow/steps/${stepId}/complete`, mapFrontendToBackend(payload));
  return mapBackendToFrontend(response);
}

export async function claimJourneyReward(rewardKey) {
  const response = await api.post('/api/journey-flow/rewards/claim', { rewardKey });
  return mapBackendToFrontend(response);
}
