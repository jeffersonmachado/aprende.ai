import api from './api.js';

export function getMyGamificationSummary() {
  return api.get('/api/gamification/me');
}

export function getGamificationEvents(limit = 20) {
  return api.get(`/api/gamification/events?limit=${Number(limit) || 20}`);
}

export function postDailyCheckIn() {
  return api.post('/api/gamification/check-in', {});
}

export function getGamificationLeaderboard(limit = 10) {
  return api.get(`/api/gamification/leaderboard?limit=${Number(limit) || 10}`);
}

export function getRewardRules() {
  return api.get('/api/gamification/admin/reward-rules');
}

export function upsertRewardRule(payload) {
  return api.put('/api/gamification/admin/reward-rules', payload);
}

export function getLevelRules() {
  return api.get('/api/gamification/admin/level-rules');
}

export function upsertLevelRule(payload) {
  return api.put('/api/gamification/admin/level-rules', payload);
}
