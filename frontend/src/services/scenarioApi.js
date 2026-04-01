import api from './api.js';

export function getScenarioState() {
  return api.get('/api/journey-flow/state');
}

export function saveScenarioState(payload) {
  return api.post('/api/journey-flow/state', payload);
}

export async function postDecision(payload) {
  try {
    return await api.post('/api/decision', payload);
  } catch (error) {
    return api.post('/api/decisions', payload);
  }
}

export function getSimulationCatalog() {
  return api.get('/api/simulation/catalog');
}

export function startSimulation(payload) {
  return api.post('/api/simulation/start', payload);
}

export function getSimulationState(simulationRunId) {
  return api.get(`/api/simulation/${simulationRunId}`);
}

export function submitSimulationDecision(simulationRunId, payload) {
  return api.post(`/api/simulation/${simulationRunId}/decision`, payload);
}

export function getEvolution() {
  return api.get('/api/evolution/me');
}
