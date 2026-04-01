import { chatCompletion } from '../../core/ai/chatCompletion.js';
import { getTenantOpenAIKey } from '../../services/tenantOpenAI.service.js';
import {
  DecisionLog,
  JourneyState,
  LearnerProfile,
  LearningGoal,
  LearningStyleProfile,
  SimulationRun
} from '../../db/models/index.js';
import { getGamificationSummary, recordGamificationEvent } from '../gamification/gamification.service.js';

const MENTOR_MODE_GUIDANCE = {
  coach_encorajador: 'Tom encorajador, foco em autoconfiança e constância de execução.',
  socratico: 'Tom socrático, use perguntas para aprofundar reflexão e autonomia de decisão.',
  analitico: 'Tom analítico, explicite premissas, trade-offs, riscos e critérios de decisão.',
  direto_acao: 'Tom direto, proponha próximo passo objetivo, curto e executável hoje.'
};

function detectEmotionalSignal(text) {
  const safeText = String(text || '').toLowerCase();
  if (!safeText) return 'neutro';

  if (/(trav|bloque|frustra|cans|perdid|ansios|dif[ií]cil|n[aã]o consigo)/i.test(safeText)) {
    return 'frustracao';
  }

  if (/(avancei|consegui|evolu|melhorei|confian|funcionou|deu certo)/i.test(safeText)) {
    return 'confianca';
  }

  return 'neutro';
}

function buildContextBlock(ctx) {
  const lines = [];
  lines.push(`Perfil: ${ctx.profile?.displayName || 'não informado'} / nível ${ctx.profile?.currentLevel || 'não informado'}`);
  lines.push(`Meta ativa: ${ctx.goal?.title || 'não definida'}`);
  lines.push(`Estilo dominante: ${ctx.style?.dominantStyle || 'não definido'}`);
  lines.push(`Progresso da jornada: ${ctx.journeyState?.progressPercent || 0}%`);
  lines.push(`Total de simulações: ${ctx.simulationsCount}`);
  lines.push(`XP total: ${ctx.gamification?.xp?.total || 0}`);
  lines.push(`Nível gamificado: ${ctx.gamification?.level || 1}`);
  lines.push(`Streak atual: ${ctx.gamification?.streak?.current || 0}`);
  if (ctx.recentDecision?.feedbackText) {
    lines.push(`Último feedback de decisão: ${ctx.recentDecision.feedbackText}`);
  }
  lines.push(`Sinal emocional detectado na mensagem: ${ctx.emotionalSignal}`);
  lines.push(`Modo preferencial do mentor: ${ctx.preferredMode}`);
  lines.push(`Diretriz do modo: ${ctx.modeGuidance}`);
  return lines.join('\n');
}

function defaultCoachResponse(text) {
  return {
    situationalRead: 'Você está em progresso ativo e com potencial de evolução no próximo ciclo.',
    performanceFeedback: text,
    positiveReinforcement: 'Sua consistência de prática já está gerando sinais reais de avanço.',
    reflectionPrompt: 'Qual trade-off você quer testar de forma mais intencional na próxima decisão?',
    nextAction: 'Revisar o último cenário, escolher uma hipótese alternativa e comparar resultado.',
    relatedCompetency: 'Tomada de decisão',
    mentorMode: 'coach_encorajador'
  };
}

function parseCoachPayload(rawText) {
  try {
    const parsed = JSON.parse(rawText);
    if (parsed && typeof parsed === 'object') {
      return {
        situationalRead: parsed.situationalRead || parsed.reading || '',
        performanceFeedback: parsed.performanceFeedback || parsed.feedback || '',
        positiveReinforcement: parsed.positiveReinforcement || parsed.reinforcement || '',
        reflectionPrompt: parsed.reflectionPrompt || parsed.reflection || '',
        nextAction: parsed.nextAction || parsed.nextStep || '',
        relatedCompetency: parsed.relatedCompetency || parsed.competency || '',
        mentorMode: parsed.mentorMode || 'coach_encorajador'
      };
    }
  } catch {
    // fallback handled below
  }

  return defaultCoachResponse(rawText);
}

function buildProactiveCheckIn(gamification, coach) {
  const currentStreak = Number(gamification?.streak?.current || 0);
  const bestStreak = Number(gamification?.streak?.best || 0);
  const streakGap = Math.max(0, bestStreak - currentStreak);
  const shouldPrompt = streakGap >= 2;

  if (!shouldPrompt) {
    return {
      shouldPrompt: false,
      reason: 'ritmo_estavel',
      message: '',
      suggestedAction: ''
    };
  }

  return {
    shouldPrompt: true,
    reason: 'queda_streak',
    message: `Seu ritmo caiu ${streakGap} dia(s) em relação ao seu melhor streak. Vamos retomar consistência.`,
    suggestedAction: coach?.nextAction || 'Executar uma micro-ação de progresso ainda hoje.'
  };
}

export async function sendMentorMessage(tenantId, userId, payload) {
  const apiKey = await getTenantOpenAIKey(tenantId);
  const [profile, goal, style, journeyState, simulationsCount, gamification, recentDecision] = await Promise.all([
    LearnerProfile.findOne({ where: { tenantId, userId } }),
    LearningGoal.findOne({ where: { tenantId, userId, status: 'active' }, order: [['createdAt', 'DESC']] }),
    LearningStyleProfile.findOne({ where: { tenantId, userId }, order: [['updatedAt', 'DESC']] }),
    JourneyState.findOne({ where: { tenantId, userId } }),
    SimulationRun.count({ where: { tenantId, userId } }),
    getGamificationSummary(tenantId, userId),
    DecisionLog.findOne({
      where: { tenantId },
      include: [{ model: SimulationRun, as: 'simulationRun', where: { userId } }],
      order: [['decidedAt', 'DESC']]
    })
  ]);

  const normalizedMode = String(
    payload.mode
    || style?.mentorshipStyle
    || 'coach_encorajador'
  ).trim().toLowerCase();

  const preferredMode = MENTOR_MODE_GUIDANCE[normalizedMode]
    ? normalizedMode
    : 'coach_encorajador';

  const emotionalSignal = detectEmotionalSignal(payload.message);

  const ctx = {
    profile,
    goal,
    style,
    journeyState,
    simulationsCount,
    gamification,
    recentDecision,
    preferredMode,
    modeGuidance: MENTOR_MODE_GUIDANCE[preferredMode],
    emotionalSignal
  };

  const response = await chatCompletion({
    systemPrompt: [
      'Você é mentor coach do aprende.ai.',
      'Responda em português do Brasil, com objetividade, empatia e foco em progressão.',
      'Considere contexto real de progresso, gamificação e histórico recente para orientar uma próxima ação concreta.',
      'Retorne APENAS JSON válido com as chaves: situationalRead, performanceFeedback, positiveReinforcement, reflectionPrompt, nextAction, relatedCompetency, mentorMode.',
      `Modo preferencial do mentor: ${preferredMode}.`
    ].join(' '),
    userPrompt: `${buildContextBlock(ctx)}\n\nPergunta do aprendiz: ${payload.message}`,
    apiKey,
    temperature: 0.4,
    maxTokens: 500
  });

  const coach = parseCoachPayload(response.text);

  const gamificationEvent = await recordGamificationEvent(tenantId, userId, {
    eventType: 'mentor_interaction',
    source: 'mentor_message',
    referenceType: 'mentor',
    metadata: {
      mentorMode: coach.mentorMode,
      questionSize: String(payload.message || '').length,
      emotionalSignal
    }
  });

  const reply = [
    coach.situationalRead,
    coach.performanceFeedback,
    `Próxima ação: ${coach.nextAction}`,
    `Reflexão: ${coach.reflectionPrompt}`
  ].filter(Boolean).join('\n\n');

  const proactiveCheckIn = buildProactiveCheckIn(gamification, coach);

  return {
    reply,
    coach,
    proactiveCheckIn,
    gamification: {
      xpAwarded: gamificationEvent.xpAwarded,
      level: gamificationEvent.progression.currentLevel,
      streak: gamificationEvent.streak.currentStreak,
      leveledUp: gamificationEvent.leveledUp,
      unlockedAchievements: gamificationEvent.unlockedAchievements
    },
    model: response.model,
    usage: response.usage
  };
}
