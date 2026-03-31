import { chatCompletion } from '../../core/ai/chatCompletion.js';
import { getTenantOpenAIKey } from '../../services/tenantOpenAI.service.js';
import {
  JourneyState,
  LearnerProfile,
  LearningGoal,
  LearningStyleProfile,
  SimulationRun
} from '../../db/models/index.js';

function buildContextBlock(ctx) {
  const lines = [];
  lines.push(`Perfil: ${ctx.profile?.displayName || 'não informado'} / nível ${ctx.profile?.currentLevel || 'não informado'}`);
  lines.push(`Meta ativa: ${ctx.goal?.title || 'não definida'}`);
  lines.push(`Estilo dominante: ${ctx.style?.dominantStyle || 'não definido'}`);
  lines.push(`Progresso da jornada: ${ctx.journeyState?.progressPercent || 0}%`);
  lines.push(`Total de simulações: ${ctx.simulationsCount}`);
  return lines.join('\n');
}

export async function sendMentorMessage(tenantId, userId, payload) {
  const apiKey = await getTenantOpenAIKey(tenantId);
  const [profile, goal, style, journeyState, simulationsCount] = await Promise.all([
    LearnerProfile.findOne({ where: { tenantId, userId } }),
    LearningGoal.findOne({ where: { tenantId, userId, status: 'active' }, order: [['createdAt', 'DESC']] }),
    LearningStyleProfile.findOne({ where: { tenantId, userId }, order: [['updatedAt', 'DESC']] }),
    JourneyState.findOne({ where: { tenantId, userId } }),
    SimulationRun.count({ where: { tenantId, userId } })
  ]);

  const ctx = { profile, goal, style, journeyState, simulationsCount };

  const response = await chatCompletion({
    systemPrompt: [
      'Você é mentor pedagógico do aprende.ai.',
      'Responda em português do Brasil, objetivo, acolhedor e acionável.',
      'Sempre inclua: 1) feedback curto, 2) próxima ação concreta, 3) micro-desafio.'
    ].join(' '),
    userPrompt: `${buildContextBlock(ctx)}\n\nPergunta do aprendiz: ${payload.message}`,
    apiKey,
    temperature: 0.4,
    maxTokens: 500
  });

  return {
    reply: response.text,
    model: response.model,
    usage: response.usage
  };
}
