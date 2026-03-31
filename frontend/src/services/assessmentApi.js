import api from './api.js';

export function evaluateAssessment(payload) {
  return api.post('/api/assessment/evaluate', payload);
}
