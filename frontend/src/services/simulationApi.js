import api from './api.js';

export function getSimulationCatalog() {
  return api.get('/api/simulation/catalog');
}

export function startSimulation(payload) {
  return api.post('/api/simulation/start', payload);
}

export function getSimulationState(simulationRunId) {
  return api.get(`/api/simulation/${simulationRunId}`);
}

export function submitDecision(simulationRunId, payload) {
  return api.post(`/api/simulation/${simulationRunId}/decision`, payload);
}

export function submitDecisionByRun(payload) {
  return api.post('/api/decisions', payload);
}

export function getDecisionHistory() {
  return api.get('/api/decisions/history');
}

export function getEvolution() {
  return api.get('/api/evolution/me');
}
