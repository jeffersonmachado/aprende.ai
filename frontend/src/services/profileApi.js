import api from './api.js';

export function getProfileOverview() {
  return api.get('/api/profile/me');
}

export function saveOnboarding(payload) {
  return api.post('/api/profile/onboarding', payload);
}

export function saveLearningGoal(payload) {
  return api.post('/api/goals/select', payload);
}

export function saveLearningStyle(payload) {
  return api.post('/api/learning-style/select', payload);
}
