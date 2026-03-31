import api from './api.js';

export function getOpenAISettings() {
  return api.get('/api/system/openai');
}

export function saveOpenAISettings(payload) {
  return api.post('/api/system/openai', payload);
}
