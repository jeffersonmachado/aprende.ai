import api from './api.js';

export function sendMentorMessage(message, mode, context = null) {
  return api.post('/api/mentor/message', { message, mode, context });
}
