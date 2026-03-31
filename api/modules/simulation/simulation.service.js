import { v4 as uuidv4 } from 'uuid';
import {
  Competency,
  DecisionLog,
  DecisionOption,
  JourneyPlan,
  JourneyState,
  LearnerProfile,
  LearningGoal,
  LearningStyleProfile,
  Scenario,
  ScenarioEpisode,
  SimulationRun,
  UserCompetencyScore
} from '../../db/models/index.js';
import { AppError } from '../../core/errors/AppError.js';
import {
  generateFeedback,
  generateScenario
} from '../../services/adaptiveEngine.service.js';
import { getTenantOpenAIKey } from '../../services/tenantOpenAI.service.js';
import { upsertUserCompetencyScore } from '../competency/competency.service.js';

async function ensureSeedScenario(tenantId) {
  const existing = await Scenario.findOne({ where: { tenantId, status: 'active' }, include: [{ model: ScenarioEpisode, as: 'episodes' }] });
  if (existing) return;

  const scenarioId = uuidv4();
  const episodeId = uuidv4();
  await Scenario.create({
    id: scenarioId,
    tenantId,
    title: 'Conversa de alto impacto com cliente',
    description: 'Você precisa equilibrar empatia e objetividade em um caso crítico.',
    context: 'Contexto de atendimento com tensão e exposição pública.',
    problem: 'Responder sem escalar conflito, mantendo confiança.',
    difficulty: 'medium',
    competenciesEvaluatedJson: ['tomada de decisao'],
    consequencesJson: {
      bestCase: 'Cliente recupera confianca e aceita plano de acao.',
      worstCase: 'Relacionamento degrada e prazo do projeto entra em risco.'
    },
    status: 'active'
  });

  await ScenarioEpisode.create({
    id: episodeId,
    tenantId,
    scenarioId,
    title: 'Abertura da conversa',
    narrativeText: 'O cliente chega irritado e questiona sua equipe em público.',
    episodeIndex: 0
  });

  await DecisionOption.bulkCreate([
    {
      id: uuidv4(),
      tenantId,
      scenarioEpisodeId: episodeId,
      label: 'Responder defensivamente',
      outcomeText: 'A tensão aumenta e a confiança diminui.',
      scoreDelta: -4,
      metadata: {
        impact: {
          velocidade: 2,
          assertividade: -4,
          analise_risco: -2,
          consistencia: -3
        }
      }
    },
    {
      id: uuidv4(),
      tenantId,
      scenarioEpisodeId: episodeId,
      label: 'Reconhecer emoção e conduzir para solução',
      outcomeText: 'Você reduz tensão e cria espaço para solução conjunta.',
      scoreDelta: 6,
      metadata: {
        impact: {
          velocidade: 2,
          assertividade: 6,
          analise_risco: 4,
          consistencia: 5
        }
      }
    }
  ]);
}

function averageImpact(impact = {}) {
  const values = Object.values(impact).map((value) => Number(value || 0));
  if (!values.length) {
    return 0;
  }

  return values.reduce((acc, value) => acc + value, 0) / values.length;
}

function adjustDifficulty(currentDifficulty, scoreDelta) {
  const safeDelta = Number(scoreDelta || 0);
  if (safeDelta >= 4) {
    if (currentDifficulty === 'easy') return 'medium';
    if (currentDifficulty === 'medium') return 'hard';
  }

  if (safeDelta <= -3) {
    if (currentDifficulty === 'hard') return 'medium';
    if (currentDifficulty === 'medium') return 'easy';
  }

  return currentDifficulty || 'medium';
}

async function getUserLearningContext(tenantId, userId) {
  const [userProfile, learningGoal, learningStyle] = await Promise.all([
    LearnerProfile.findOne({ where: { tenantId, userId } }),
    LearningGoal.findOne({ where: { tenantId, userId, status: 'active' }, order: [['createdAt', 'DESC']] }),
    LearningStyleProfile.findOne({ where: { tenantId, userId }, order: [['updatedAt', 'DESC']] })
  ]);

  return { userProfile, learningGoal, learningStyle };
}

async function ensureAdaptiveScenarioForUser(tenantId, userId) {
  const { userProfile, learningGoal, learningStyle } = await getUserLearningContext(tenantId, userId);
  const apiKey = await getTenantOpenAIKey(tenantId);

  if (!learningGoal && !learningStyle && !userProfile) {
    await ensureSeedScenario(tenantId);
    return;
  }

  const generated = await generateScenario({ userProfile, learningGoal, learningStyle, apiKey });
  const existing = await Scenario.findOne({
    where: { tenantId, title: generated.title, status: 'active' }
  });

  if (existing) {
    return;
  }

  const scenarioId = uuidv4();
  const episodeId = uuidv4();
  await Scenario.create({
    id: scenarioId,
    tenantId,
    title: generated.title,
    description: generated.problem,
    context: generated.context,
    problem: generated.problem,
    difficulty: generated.difficulty || 'medium',
    competenciesEvaluatedJson: generated.competenciesEvaluated || [],
    consequencesJson: generated.consequences || {},
    status: 'active'
  });

  await ScenarioEpisode.create({
    id: episodeId,
    tenantId,
    scenarioId,
    title: generated.title,
    narrativeText: `${generated.context || ''}\n\nProblema: ${generated.problem || ''}`.trim(),
    episodeIndex: 0
  });

  const options = (generated.options || []).map((option) => ({
    id: uuidv4(),
    tenantId,
    scenarioEpisodeId: episodeId,
    label: option.label,
    outcomeText: option.consequence || null,
    scoreDelta: averageImpact(option.impact || {}),
    metadata: {
      impact: option.impact || {}
    }
  }));

  if (options.length) {
    await DecisionOption.bulkCreate(options);
  }
}

export async function listScenarios(tenantId, userId) {
  await ensureAdaptiveScenarioForUser(tenantId, userId);
  const scenarios = await Scenario.findAll({ where: { tenantId, status: 'active' }, order: [['createdAt', 'DESC']] });
  return scenarios;
}

export async function createScenario(tenantId, payload) {
  const scenarioId = uuidv4();
  const episodeId = uuidv4();
  const options = Array.isArray(payload.options) ? payload.options : [];

  const scenario = await Scenario.create({
    id: scenarioId,
    tenantId,
    title: payload.title,
    description: payload.description || payload.problem || null,
    context: payload.context || null,
    problem: payload.problem || null,
    difficulty: payload.difficulty || 'medium',
    competenciesEvaluatedJson: payload.competenciesEvaluated || [],
    consequencesJson: payload.consequences || {},
    status: payload.status || 'active'
  });

  await ScenarioEpisode.create({
    id: episodeId,
    tenantId,
    scenarioId,
    title: payload.episodeTitle || payload.title,
    narrativeText: `${payload.context || ''}\n\nProblema: ${payload.problem || ''}`.trim(),
    episodeIndex: 0
  });

  if (options.length) {
    await DecisionOption.bulkCreate(options.map((option) => ({
      id: uuidv4(),
      tenantId,
      scenarioEpisodeId: episodeId,
      label: option.label,
      outcomeText: option.consequence || option.outcomeText || null,
      scoreDelta: averageImpact(option.impact || {}),
      metadata: {
        impact: option.impact || {}
      }
    })));
  }

  return scenario;
}

export async function getSimulationCatalog(tenantId, userId) {
  return listScenarios(tenantId, userId);
}

export async function startSimulation(tenantId, userId, payload) {
  const scenario = await Scenario.findOne({ where: { id: payload.scenarioId, tenantId } });
  if (!scenario) throw new AppError('Cenário não encontrado', 404);

  const journeyPlan = await JourneyPlan.findOne({ where: { tenantId, userId, status: 'active' }, order: [['createdAt', 'DESC']] });

  return SimulationRun.create({
    id: uuidv4(),
    tenantId,
    userId,
    scenarioId: scenario.id,
    journeyPlanId: journeyPlan?.id || null,
    status: 'active',
    startedAt: new Date(),
    totalScore: 0
  });
}

export async function getSimulationState(tenantId, userId, runId) {
  const run = await SimulationRun.findOne({ where: { id: runId, tenantId, userId } });
  if (!run) throw new AppError('Execução de simulação não encontrada', 404);

  const scenario = await Scenario.findOne({ where: { id: run.scenarioId, tenantId } });
  const episode = await ScenarioEpisode.findOne({
    where: { scenarioId: run.scenarioId, tenantId },
    order: [['episodeIndex', 'ASC']]
  });

  const options = await DecisionOption.findAll({
    where: { scenarioEpisodeId: episode.id, tenantId },
    order: [['createdAt', 'ASC']]
  });

  return {
    run,
    scenario,
    episode: {
      ...episode.toJSON(),
      options
    }
  };
}

export async function submitDecision(tenantId, userId, runId, payload) {
  const run = await SimulationRun.findOne({ where: { id: runId, tenantId, userId } });
  if (!run) throw new AppError('Execução de simulação não encontrada', 404);

  const option = await DecisionOption.findOne({ where: { id: payload.selectedOptionId, tenantId } });
  if (!option) throw new AppError('Opção de decisão não encontrada', 404);

  const { userProfile, learningGoal, learningStyle } = await getUserLearningContext(tenantId, userId);
  const impact = option.metadata?.impact || {};
  const scoreDelta = Number(option.scoreDelta || averageImpact(impact));

  const feedbackStyle = payload.feedbackStyle
    || learningStyle?.mentorshipStyle
    || learningStyle?.dominantStyle
    || 'analitico';

  const apiKey = await getTenantOpenAIKey(tenantId);

  const feedback = await generateFeedback({
    decision: {
      selectedOption: {
        id: option.id,
        label: option.label
      },
      impact,
      consequence: option.outcomeText,
      scoreDelta
    },
    userProfile,
    learningStyle,
    style: feedbackStyle,
    apiKey
  });

  const decisionLog = await DecisionLog.create({
    id: uuidv4(),
    tenantId,
    simulationRunId: run.id,
    scenarioEpisodeId: option.scenarioEpisodeId,
    decisionOptionId: option.id,
    decidedAt: new Date(),
    feedbackText: feedback,
    impactJson: impact,
    feedbackStyle,
    scoreImpact: scoreDelta
  });

  run.totalScore = Number(run.totalScore || 0) + scoreDelta;
  run.status = 'completed';
  run.completedAt = new Date();
  await run.save();

  const evaluatedCompetencyNames = run.scenarioId
    ? ((await Scenario.findOne({ where: { id: run.scenarioId, tenantId } }))?.competenciesEvaluatedJson || ['tomada de decisao'])
    : ['tomada de decisao'];

  const competencyUpdates = [];
  for (const competencyName of evaluatedCompetencyNames) {
    const [competency] = await Competency.findOrCreate({
      where: { tenantId, name: competencyName },
      defaults: {
        id: uuidv4(),
        tenantId,
        name: competencyName,
        type: 'comportamental',
        dimensionsJson: [
          { name: 'velocidade', weight: 0.25, description: 'Rapidez de resposta' },
          { name: 'assertividade', weight: 0.25, description: 'Qualidade da escolha' },
          { name: 'analise de risco', weight: 0.25, description: 'Antecipacao de risco' },
          { name: 'consistencia', weight: 0.25, description: 'Constancia entre decisoes' }
        ]
      }
    });

    const evidence = {
      decisionLogId: decisionLog.id,
      scenarioRunId: run.id,
      selectedOption: option.label,
      feedback,
      impact,
      createdAt: new Date().toISOString()
    };

    const updated = await upsertUserCompetencyScore(
      tenantId,
      userId,
      competency.id,
      scoreDelta,
      evidence
    );

    competencyUpdates.push(updated);
  }

  const [journeyState] = await JourneyState.findOrCreate({
    where: { tenantId, userId },
    defaults: {
      id: uuidv4(),
      tenantId,
      userId,
      journeyPlanId: run.journeyPlanId || null,
      currentStepId: null,
      progressPercent: 0,
      stateJson: {}
    }
  });

  const completedRuns = await SimulationRun.count({ where: { tenantId, userId, status: 'completed' } });
  const allRuns = await SimulationRun.count({ where: { tenantId, userId } });
  const progressPercent = allRuns ? Math.min(100, (completedRuns / allRuns) * 100) : 0;

  const currentDifficulty = (journeyState.stateJson && journeyState.stateJson.adaptiveDifficulty) || 'medium';
  const nextDifficulty = adjustDifficulty(currentDifficulty, scoreDelta);

  await journeyState.update({
    progressPercent,
    lastEventAt: new Date(),
    stateJson: {
      ...(journeyState.stateJson || {}),
      lastAction: 'decision_submitted',
      lastFeedback: feedback,
      adaptiveDifficulty: nextDifficulty,
      suggestedNextScenario: {
        focus: evaluatedCompetencyNames[0] || 'tomada de decisao',
        difficulty: nextDifficulty,
        rationale: scoreDelta >= 0 ? 'Aumentar desafio progressivamente' : 'Consolidar base antes de escalar'
      }
    }
  });

  return {
    run,
    feedback,
    scoreDelta,
    competencyUpdates,
    nextLoop: journeyState.stateJson?.suggestedNextScenario || null
  };
}

export async function submitDecisionByRun(tenantId, userId, payload) {
  if (!payload.simulationRunId) {
    throw new AppError('simulationRunId é obrigatório', 400);
  }

  return submitDecision(tenantId, userId, payload.simulationRunId, payload);
}

export async function getDecisionHistory(tenantId, userId) {
  return DecisionLog.findAll({
    where: { tenantId },
    include: [{ model: SimulationRun, as: 'simulationRun', where: { userId } }],
    order: [['decidedAt', 'DESC']],
    limit: 50
  });
}

export async function getUserEvolution(tenantId, userId) {
  const scores = await UserCompetencyScore.findAll({ where: { tenantId, userId }, order: [['updatedAt', 'DESC']] });
  const decisions = await getDecisionHistory(tenantId, userId);
  const state = await JourneyState.findOne({ where: { tenantId, userId } });

  return {
    competencies: scores,
    decisionHistory: decisions,
    progression: {
      progressPercent: Number(state?.progressPercent || 0),
      adaptiveDifficulty: state?.stateJson?.adaptiveDifficulty || 'medium',
      nextRecommendation: state?.stateJson?.suggestedNextScenario || null
    }
  };
}
