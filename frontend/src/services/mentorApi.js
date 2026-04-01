import api from './api.js';

export function sendMentorMessage(message, mode) {
  return api.post('/api/mentor/message', { message, mode });
}
