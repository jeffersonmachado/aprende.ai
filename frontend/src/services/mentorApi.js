import api from './api.js';

export function sendMentorMessage(message) {
  return api.post('/api/mentor/message', { message });
}
