import { chatCompletion } from '../core/ai/chatCompletion.js';

const GOAL_TYPES = {
  resolve_problem: 'resolver problema',
  learn_new: 'aprender algo novo',
  develop_skill: 'desenvolver habilidade',
  improve_performance: 'melhorar performance',
  prepare_challenge: 'preparar para novo desafio'
};

const LEARNING_STYLE_MAP = {
  explorador: {
    contentType: 'exploracao guiada',
    mentorshipStyle: 'socratico',
    simulationFormat: 'aberto'
  },
  pratico: {
    contentType: 'hands-on',
    mentorshipStyle: 'direto',
    simulationFormat: 'decisao rapida'
  },
  narrativo: {
    contentType: 'storytelling',
    mentorshipStyle: 'reflexivo',
    simulationFormat: 'ramificado'
  },
  analitico: {
    contentType: 'dados e modelos',
    mentorshipStyle: 'analitico',
    simulationFormat: 'cenario orientado a metricas'
  }
};

function normalizeStyle(style) {
  const value = (style || '').toLowerCase();
  if (value.includes('explor')) return 'explorador';
  if (value.includes('prat')) return 'pratico';
  if (value.includes('narr')) return 'narrativo';
  return 'analitico';
}

function normalizeGoalType(goalType) {
  const value = (goalType || '').toLowerCase();
  if (value.includes('resolver')) return 'resolve_problem';
  if (value.includes('novo')) return 'learn_new';
  if (value.includes('habil')) return 'develop_skill';
  if (value.includes('performance')) return 'improve_performance';
  if (value.includes('desafio')) return 'prepare_challenge';
  return 'develop_skill';
}

function mapDifficulty(experienceLevel) {
  const level = (experienceLevel || '').toLowerCase();
  if (level.includes('inic') || level.includes('beginner')) return 'easy';
  if (level.includes('avan') || level.includes('advanced')) return 'hard';
  return 'medium';
}

export function computeLevelFromScore(score) {
  if (score >= 75) return 'avancado';
  if (score >= 45) return 'intermediario';
  return 'iniciante';
}

export function generateJourney(userProfile = {}, learningGoal = {}, learningStyle = {}) {
  const style = normalizeStyle(learningStyle?.dominantStyle || learningStyle?.learningStyle);
  const goalType = normalizeGoalType(learningGoal?.goalType || learningGoal?.type);
  const styleConfig = LEARNING_STYLE_MAP[style];
  const difficulty = mapDifficulty(userProfile?.experienceLevel || userProfile?.currentLevel);

  const trail = {
    title: `Jornada ${GOAL_TYPES[goalType]} para ${userProfile?.area || 'contexto geral'}`,
    milestones: [
      'diagnostico',
      'aplicacao guiada',
      'simulacao de decisao',
      'feedback e consolidacao'
    ],
    estimatedDays: difficulty === 'easy' ? 10 : difficulty === 'hard' ? 21 : 14
  };

  const scenarios = [
    {
      title: `Cenario 1 · ${userProfile?.primaryObjective || learningGoal?.title || 'aplicar objetivo'}`,
      difficulty,
      pressure: difficulty === 'hard' ? 'alta' : 'media'
    },
    {
      title: `Cenario 2 · Refinamento ${style}`,
      difficulty: difficulty === 'easy' ? 'medium' : difficulty,
      pressure: 'media'
    }
  ];

  return {
    trail,
    scenarios,
    contentType: styleConfig.contentType,
    challengeType: GOAL_TYPES[goalType],
    mentorshipStyle: styleConfig.mentorshipStyle,
    simulationFormat: styleConfig.simulationFormat,
    difficulty
  };
}

function fallbackScenario(input) {
  const journey = generateJourney(input.userProfile, input.learningGoal, input.learningStyle);
  const first = journey.scenarios[0];

  return {
    title: first.title,
    context: `${input.userProfile?.contextType || 'B2C'} na area ${input.userProfile?.area || 'geral'}.`,
    problem: `Tomar decisao alinhada ao objetivo: ${input.learningGoal?.title || 'evoluir competencia principal'}.`,
    options: [
      {
        label: 'Agir rapido com dados parciais',
        consequence: 'Entrega velocidade, mas aumenta risco operacional.',
        impact: {
          velocidade: 8,
          analise_risco: -4,
          assertividade: 4,
          consistencia: 2
        }
      },
      {
        label: 'Investigar mais antes de agir',
        consequence: 'Reduz risco e aumenta consistencia, com atraso moderado.',
        impact: {
          velocidade: -3,
          analise_risco: 8,
          assertividade: 3,
          consistencia: 7
        }
      }
    ],
    competenciesEvaluated: ['tomada de decisao'],
    consequences: {
      bestCase: 'A decisao reduz retrabalho e melhora confianca da equipe.',
      worstCase: 'Atraso no resultado e perda de alinhamento com stakeholders.'
    },
    difficulty: journey.difficulty
  };
}

export async function generateScenario(input) {
  if (!input?.apiKey && !process.env.OPENAI_API_KEY) {
    return fallbackScenario(input);
  }

  try {
    const prompt = `Gere APENAS JSON valido para um cenario de aprendizagem adaptativa\nPerfil: ${JSON.stringify(input.userProfile)}\nMeta: ${JSON.stringify(input.learningGoal)}\nEstilo: ${JSON.stringify(input.learningStyle)}\nCampos obrigatorios: title, context, problem, options[{label,consequence,impact}], competenciesEvaluated, consequences{bestCase,worstCase}, difficulty`;

    const completion = await chatCompletion({
      systemPrompt: 'Voce cria cenarios educacionais de decisao para plataforma adaptativa.',
      userPrompt: prompt,
      apiKey: input.apiKey,
      temperature: 0.4,
      maxTokens: 800
    });

    return JSON.parse(completion.text);
  } catch {
    return fallbackScenario(input);
  }
}

function feedbackStyleInstruction(style) {
  const normalized = (style || '').toLowerCase();
  if (normalized === 'socratico') return 'responda com perguntas orientadoras e sem entregar tudo pronto';
  if (normalized === 'direto') return 'responda de forma objetiva, com no maximo 4 frases';
  if (normalized === 'reflexivo') return 'responda de forma narrativa, conectando contexto e aprendizado';
  return 'responda com linguagem analitica e dados acionaveis';
}

function fallbackFeedback({ decision, userProfile, learningStyle, style }) {
  const selected = decision?.selectedOption?.label || 'opcao escolhida';
  const impact = decision?.impact || {};
  const impactText = Object.entries(impact)
    .map(([k, v]) => `${k}: ${v > 0 ? '+' : ''}${v}`)
    .join(' | ');

  if (style === 'socratico') {
    return `O que motivou sua escolha por "${selected}"? Qual sinal do contexto poderia validar sua hipotese antes de executar? Como voce reduziria o risco principal desta decisao?`;
  }

  if (style === 'direto') {
    return `Boa decisao para o contexto ${userProfile?.contextType || 'atual'}. Impacto estimado: ${impactText || 'sem impacto medido'}. Proximo passo: valide resultado em ciclo curto e ajuste.`;
  }

  if (style === 'reflexivo') {
    return `Sua escolha por "${selected}" mostra uma leitura do contexto alinhada ao seu estilo ${learningStyle?.dominantStyle || 'adaptativo'}. O impacto previsto (${impactText || 'neutro'}) sugere evolucao gradual. Registre o que funcionou e leve isso para o proximo cenario.`;
  }

  return `Analise da decisao: opcao=${selected}; impacto=${impactText || 'neutro'}. Recomendacao: monitore variaveis de risco e assertividade no proximo ciclo para aumentar consistencia.`;
}

export async function generateFeedback({ decision, userProfile, learningStyle, style, apiKey }) {
  const selectedStyle = (style || '').toLowerCase() || 'analitico';

  if (!apiKey && !process.env.OPENAI_API_KEY) {
    return fallbackFeedback({ decision, userProfile, learningStyle, style: selectedStyle });
  }

  try {
    const completion = await chatCompletion({
      systemPrompt: `Voce e um mentor IA. ${feedbackStyleInstruction(selectedStyle)}.`,
      userPrompt: `Decisao: ${JSON.stringify(decision)}\nPerfil: ${JSON.stringify(userProfile)}\nEstilo: ${JSON.stringify(learningStyle)}\nForneca feedback acionavel em portugues.`,
      apiKey,
      temperature: 0.5,
      maxTokens: 450
    });

    return completion.text;
  } catch {
    return fallbackFeedback({ decision, userProfile, learningStyle, style: selectedStyle });
  }
}
