import { v4 as uuidv4 } from 'uuid';
import { AIMessage, AISession } from '../../db/models/index.js';
import { AppError } from '../../core/errors/AppError.js';
export async function listSessions(tenantId, userId) { return AISession.findAll({ where: { tenantId, userId }, order: [['createdAt', 'DESC']] }); }
export async function startSession(tenantId, userId, payload) { return AISession.create({ id: uuidv4(), tenantId, userId, lessonId: payload.lessonId || null, assessmentAttemptId: payload.assessmentAttemptId || null, sessionType: payload.sessionType || 'tutor', status: 'active', startedAt: new Date(), metadata: payload.metadata || {} }); }
export async function addMessage(tenantId, sessionId, payload) {
  const session = await AISession.findOne({ where: { id: sessionId, tenantId } });
  if (!session) throw new AppError('Sessão de IA não encontrada', 404);
  const userMessage = await AIMessage.create({ id: uuidv4(), aiSessionId: sessionId, senderType: 'user', messageText: payload.message });
  const assistantMessage = await AIMessage.create({ id: uuidv4(), aiSessionId: sessionId, senderType: 'assistant', messageText: 'Resposta simulada do tutor. A integração com o motor de IA será conectada nesta camada.' });
  return { userMessage, assistantMessage };
}
