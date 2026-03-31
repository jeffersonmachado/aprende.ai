import api from './api.js';

export function getJourneySummary() {
  return api.get('/api/journey/me');
}
