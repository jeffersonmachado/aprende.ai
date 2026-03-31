import api from './api.js';

export function generateFeedback(payload) {
  return api.post('/api/feedback/generate', payload);
}
