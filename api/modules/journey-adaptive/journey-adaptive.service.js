import { v4 as uuidv4 } from 'uuid';
import { AppError } from '../../core/errors/AppError.js';
import {
  Competency,
  JourneyEvent,
  LearnerProfile,
  LearningGoal,
  LearningStyleProfile,
  UserCompetencyScore
} from '../../db/models/index.js';
import { createCompetency } from '../competency/competency.service.js';
import {
  ADAPTIVE_FRAMEWORK,
  MENTOR_PRESETS,
  PROFICIENCY_LEVELS
} from './journey-adaptive.constants.js';
import { ADAPTIVE_CHAPTER_LIBRARY } from './journey-adaptive.fixtures.js';
import { recordAdaptiveJourneyEvent } from './journey-adaptive.audit.service.js';
import { inferAdaptiveJourneyPlan, normalizeLearningProfile } from './journey-adaptive.inference.service.js';
import {
  createCompetencyProgressState,
  decideAdaptiveJourneyAction,
  evaluateAdaptiveChapter,
  validateClosureEligibility
} from './journey-adaptive.progression.service.js';
import {
  appendAdaptiveAuditEvent,
  getJourneyAdaptiveStateRecord,
  persistJourneyAdaptiveState
} from './journey-adaptive.state.service.js';

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function findFrameworkCompetency(code) {
  const competency = ADAPTIVE_FRAMEWORK.competencies[code];
  if (!competency) {
    throw new AppError(`Competência adaptativa não suportada: ${code}`, 422);
  }
  return competency;
}

function resolveProficiencyLevel(score) {
  return PROFICIENCY_LEVELS.find((item) => score >= item.minScore && score <= item.maxScore)?.id || 'iniciante';
}

function getChapterBaseById(chapterBaseId) {
  const chapter = ADAPTIVE_CHAPTER_LIBRARY.find((item) => item.id === chapterBaseId);
  if (!chapter) {
    throw new AppError(`Capítulo-base não encontrado: ${chapterBaseId}`, 404);
  }
  return chapter;
}

function buildLearnerSnapshot({ learnerProfile, learningGoal, learningStyle, competencyScore }) {
  const learningProfile = normalizeLearningProfile(learningStyle?.dominantStyle || learningStyle?.mentorshipStyle);
  return {
    learnerProfile: learnerProfile ? learnerProfile.toJSON() : {},
    learningGoal: learningGoal ? learningGoal.toJSON() : {},
    learningStyle: learningStyle ? learningStyle.toJSON() : {},
    learningProfile,
    competencyHistory: competencyScore?.evidencesJson?.metrics || null
  };
}

function chapterStatusFor(activeJourney, item) {
  if (item.chapterBaseId === activeJourney.currentChapterId) return 'active';
  if (safeArray(activeJourney.completedExecutions).find((execution) => execution.chapterBaseId === item.chapterBaseId)) return 'completed';
  return item.status || 'pending';
}

function buildChapterView(activeJourney, chapterBaseId) {
  if (!chapterBaseId) return null;
  const chapterBase = getChapterBaseById(chapterBaseId);
  const planItem = safeArray(activeJourney.plan).find((item) => item.chapterBaseId === chapterBaseId);
  const variant = safeArray(chapterBase.variacoesNarrativas)[activeJourney.chapterCursor % Math.max(safeArray(chapterBase.variacoesNarrativas).length, 1)] || chapterBase.formatoNarrativo;

  return {
    id: chapterBase.id,
    slug: chapterBase.slug,
    title: chapterBase.titulo,
    description: chapterBase.descricao,
    type: chapterBase.tipo,
    difficulty: chapterBase.dificuldade,
    pedagogicalObjective: chapterBase.objetivoPedagogico,
    reasoning: planItem?.reason || 'capítulo selecionado pelo backend',
    narrativeVariant: variant,
    mentor: activeJourney.mentorPreset,
    cycle: {
      context: chapterBase.scene?.context || chapterBase.descricao,
      challenge: chapterBase.scene?.challenge || chapterBase.objetivoPedagogico,
      decisionPrompt: chapterBase.scene?.decisionPrompt || 'Escolha a melhor ação e justifique.',
      decisionOptions: safeArray(chapterBase.scene?.decisionOptions),
      consequenceFrame: chapterBase.scene?.consequenceFrame || 'A consequência será calculada pelo backend.',
      reflectionPrompt: chapterBase.scene?.reflectionPrompt || 'Reflita sobre o critério usado.',
      evaluationFocus: chapterBase.criteriosDeSucesso,
      adjustmentHint: chapterBase.criteriosDeFalha
    },
    metadata: {
      successCriteria: chapterBase.criteriosDeSucesso,
      failureCriteria: chapterBase.criteriosDeFalha,
      expectedEvidence: chapterBase.evidenciasEsperadas,
      insertedBy: planItem?.insertedBy || 'inference',
      status: chapterStatusFor(activeJourney, planItem || { chapterBaseId })
    }
  };
}

function buildRuntimeFromState(adaptiveState) {
  const activeJourney = adaptiveState.activeJourney;
  if (!activeJourney) {
    return {
      version: adaptiveState.version,
      status: adaptiveState.status,
      diagnostic: adaptiveState.diagnostic,
      currentChapter: null,
      progress: null,
      explanations: null,
      history: []
    };
  }

  const competencyProgress = activeJourney.competencyProgress[activeJourney.competencyCode];
  const closure = validateClosureEligibility(competencyProgress, findFrameworkCompetency(activeJourney.competencyCode));

  return {
    version: adaptiveState.version,
    status: activeJourney.status,
    journeyId: activeJourney.id,
    diagnostic: adaptiveState.diagnostic,
    learnerSnapshot: activeJourney.learnerSnapshot,
    learningStrategy: activeJourney.learningStrategy,
    mentorPreset: activeJourney.mentorPreset,
    currentChapter: buildChapterView(activeJourney, activeJourney.currentChapterId),
    progress: {
      competency: {
        ...competencyProgress,
        proficiencyLevel: resolveProficiencyLevel(asNumber(competencyProgress.score, 0))
      },
      completedChapters: safeArray(activeJourney.completedExecutions).length,
      estimatedChapterCount: activeJourney.estimatedChapterCount,
      remainingChapters: safeArray(activeJourney.plan).filter((item) => chapterStatusFor(activeJourney, item) !== 'completed').length,
      chapterBounds: activeJourney.chapterBounds,
      canClose: closure.eligible,
      closureRequirements: closure.reasons
    },
    explanations: activeJourney.explanations,
    history: safeArray(activeJourney.completedExecutions)
  };
}

async function fetchLearnerContext(tenantId, userId, learningGoalId) {
  const [learnerProfile, learningStyle, goals, scores] = await Promise.all([
    LearnerProfile.findOne({ where: { tenantId, userId } }),
    LearningStyleProfile.findOne({ where: { tenantId, userId } }),
    LearningGoal.findAll({ where: { tenantId, userId, ...(learningGoalId ? { id: learningGoalId } : { status: 'active' }) }, order: [['updatedAt', 'DESC']] }),
    UserCompetencyScore.findAll({ where: { tenantId, userId }, order: [['updatedAt', 'DESC']] })
  ]);

  return {
    learnerProfile,
    learningStyle,
    learningGoal: goals[0] || null,
    competencyScores: scores
  };
}

async function ensureAdaptiveCompetencyRecord(tenantId, competencyCode) {
  const frameworkCompetency = findFrameworkCompetency(competencyCode);
  let competency = await Competency.findOne({ where: { tenantId, code: competencyCode } });
  if (!competency) {
    competency = await createCompetency(tenantId, {
      code: competencyCode,
      name: frameworkCompetency.name,
      type: 'soft',
      description: `Competência adaptativa oficial: ${frameworkCompetency.name}`,
      category: 'adaptive_journey',
      dimensions: [
        { name: 'K', weight: 0.25, description: 'Leitura conceitual' },
        { name: 'A', weight: 0.35, description: 'Aplicação' },
        { name: 'J', weight: 0.25, description: 'Julgamento' },
        { name: 'C', weight: 0.15, description: 'Consistência' }
      ]
    });
  }
  return competency;
}

function buildDiagnostic(payloadDiagnostic, existingScoreMetrics) {
  const baselineScore = asNumber(payloadDiagnostic?.baselineScore, existingScoreMetrics?.mastery || existingScoreMetrics?.globalScore || 48);
  const confidence = asNumber(payloadDiagnostic?.confidence, existingScoreMetrics?.confidence || 44);
  const consistency = asNumber(payloadDiagnostic?.consistency, existingScoreMetrics?.consistency || 42);
  return {
    baselineScore,
    confidence,
    consistency,
    errorPatterns: safeArray(payloadDiagnostic?.errorPatterns),
    successPatterns: safeArray(payloadDiagnostic?.successPatterns),
    createdAt: new Date().toISOString()
  };
}

function createJourneyPlanState(plan, competencyCode) {
  return plan.journeyPlan.map((item, index) => ({
    id: uuidv4(),
    competencyCode,
    chapterBaseId: item.chapterBaseId,
    type: item.type,
    reason: item.reason,
    insertedBy: item.insertedBy,
    status: index === 0 ? 'active' : 'pending',
    sequence: index + 1
  }));
}

function pushExplanation(activeJourney, bucket, explanation) {
  return {
    ...activeJourney,
    explanations: {
      ...activeJourney.explanations,
      [bucket]: [...safeArray(activeJourney.explanations?.[bucket]), explanation].slice(-24)
    }
  };
}

function getActivePlanItem(activeJourney) {
  return safeArray(activeJourney.plan).find((item) => item.chapterBaseId === activeJourney.currentChapterId);
}

function markPlanItemCompleted(activeJourney, chapterBaseId) {
  return {
    ...activeJourney,
    plan: safeArray(activeJourney.plan).map((item) => (
      item.chapterBaseId === chapterBaseId
        ? { ...item, status: 'completed' }
        : item
    ))
  };
}

function advanceToNextPlannedChapter(activeJourney) {
  const nextPending = safeArray(activeJourney.plan).find((item) => item.status === 'pending');
  return {
    ...activeJourney,
    currentChapterId: nextPending?.chapterBaseId || null,
    chapterCursor: nextPending ? Math.max(nextPending.sequence - 1, 0) : activeJourney.chapterCursor,
    plan: safeArray(activeJourney.plan).map((item) => {
      if (!nextPending) return item;
      return item.chapterBaseId === nextPending.chapterBaseId ? { ...item, status: 'active' } : item;
    })
  };
}

function insertReinforcementChapter(activeJourney, competencyCode, reason) {
  const reinforcementBase = ADAPTIVE_CHAPTER_LIBRARY.find((chapter) => chapter.competenciaPrincipal === competencyCode && chapter.tipo === 'reforco');
  if (!reinforcementBase) return activeJourney;
  const existingPending = safeArray(activeJourney.plan).find((item) => item.status === 'pending' && item.chapterBaseId === reinforcementBase.id);
  if (existingPending) return activeJourney;

  const completedCount = safeArray(activeJourney.completedExecutions).length;
  const sequence = completedCount + 2;
  const updatedPlan = [];
  let inserted = false;

  for (const item of safeArray(activeJourney.plan)) {
    updatedPlan.push(item);
    if (!inserted && item.chapterBaseId === activeJourney.currentChapterId) {
      updatedPlan.push({
        id: uuidv4(),
        competencyCode,
        chapterBaseId: reinforcementBase.id,
        type: reinforcementBase.tipo,
        reason,
        insertedBy: 'reinforcement',
        status: 'pending',
        sequence
      });
      inserted = true;
    }
  }

  return {
    ...activeJourney,
    plan: updatedPlan.map((item, index) => ({ ...item, sequence: index + 1 }))
  };
}

async function persistAndAudit(record, adaptiveState, tenantId, userId, eventType, metadata) {
  const persisted = await persistJourneyAdaptiveState(record, adaptiveState);
  await recordAdaptiveJourneyEvent(tenantId, userId, record.id, eventType, metadata);
  return persisted;
}

export async function startAdaptiveJourneyDiagnostic(tenantId, userId, payload = {}) {
  const { record, adaptiveState } = await getJourneyAdaptiveStateRecord(tenantId, userId);
  const learnerContext = await fetchLearnerContext(tenantId, userId, null);
  const targetCompetencyCode = payload.targetCompetencyCode || Object.keys(ADAPTIVE_FRAMEWORK.competencies)[0];
  const targetScore = learnerContext.competencyScores.find((score) => score.competencyId)?.evidencesJson?.metrics || null;
  const diagnostic = buildDiagnostic(payload.diagnostic, targetScore);

  let nextState = appendAdaptiveAuditEvent({
    ...adaptiveState,
    status: 'diagnostic_ready',
    diagnostic
  }, {
    type: 'diagnostic_started',
    targetCompetencyCode
  });

  nextState = await persistAndAudit(record, nextState, tenantId, userId, 'journey_adaptive_diagnostic_started', {
    targetCompetencyCode,
    diagnostic
  });

  return {
    version: nextState.version,
    diagnostic,
    framework: {
      version: ADAPTIVE_FRAMEWORK.version,
      lifecycle: ADAPTIVE_FRAMEWORK.lifecycle,
      chapterTypes: ADAPTIVE_FRAMEWORK.allowedChapterTypes
    }
  };
}

export async function createAdaptiveJourney(tenantId, userId, payload = {}) {
  const { record, adaptiveState } = await getJourneyAdaptiveStateRecord(tenantId, userId);
  const frameworkCompetency = findFrameworkCompetency(payload.targetCompetencyCode);
  const learnerContext = await fetchLearnerContext(tenantId, userId, payload.learningGoalId);
  const competencyRecord = await ensureAdaptiveCompetencyRecord(tenantId, payload.targetCompetencyCode);
  const existingUserScore = learnerContext.competencyScores.find((score) => score.competencyId === competencyRecord.id);
  const diagnostic = buildDiagnostic(payload.diagnosis || adaptiveState.diagnostic, existingUserScore?.evidencesJson?.metrics);
  const learnerSnapshot = buildLearnerSnapshot({
    learnerProfile: learnerContext.learnerProfile,
    learningGoal: learnerContext.learningGoal,
    learningStyle: learnerContext.learningStyle,
    competencyScore: existingUserScore
  });
  const learningProfile = payload.learningProfile || learnerSnapshot.learningProfile;
  const plan = await inferAdaptiveJourneyPlan({
    targetCompetencyCode: payload.targetCompetencyCode,
    frameworkCompetency,
    learnerProfile: learnerContext.learnerProfile?.toJSON() || {},
    learningGoal: learnerContext.learningGoal?.toJSON() || {},
    learningProfile,
    diagnosis: diagnostic,
    historicalSignals: {
      stagnationCount: safeArray(existingUserScore?.evidencesJson?.metrics?.history).slice(-4).filter((item) => asNumber(item.growth, 50) < 50).length
    }
  });

  const progress = createCompetencyProgressState(frameworkCompetency, diagnostic);
  const mentorPreset = plan.meta?.mentorPreset || MENTOR_PRESETS[normalizeLearningProfile(learningProfile)];
  const journey = {
    id: uuidv4(),
    status: 'active',
    competencyCode: frameworkCompetency.code,
    competencyName: frameworkCompetency.name,
    learnerSnapshot,
    createdAt: new Date().toISOString(),
    completedAt: null,
    learningStrategy: plan.learningStrategy,
    mentorPreset,
    planSource: plan.meta?.source || 'deterministic',
    estimatedChapterCount: plan.estimatedChapterCount,
    chapterBounds: {
      min: frameworkCompetency.minimumChapters,
      max: frameworkCompetency.maximumChapters
    },
    reinforcementPolicy: plan.reinforcementPolicy,
    accelerationPolicy: plan.accelerationPolicy,
    currentChapterId: plan.journeyPlan[0]?.chapterBaseId || null,
    chapterCursor: 0,
    plan: createJourneyPlanState(plan, frameworkCompetency.code),
    completedExecutions: [],
    evidences: [],
    competencyProgress: {
      [frameworkCompetency.code]: progress
    },
    explanations: {
      reinforcement: [],
      acceleration: [],
      closure: [],
      validation: safeArray(plan.validation?.reasons).map((reason) => ({ reason, at: new Date().toISOString() }))
    },
    auditTrail: [],
    lastChapterResult: null,
    summary: {
      targetCompetencyCode: frameworkCompetency.code,
      targetScore: frameworkCompetency.scoreTarget,
      initialScore: progress.score
    }
  };

  let nextState = appendAdaptiveAuditEvent({
    ...adaptiveState,
    status: 'active',
    diagnostic,
    activeJourney: journey,
    journeys: [...safeArray(adaptiveState.journeys), {
      id: journey.id,
      competencyCode: journey.competencyCode,
      status: journey.status,
      createdAt: journey.createdAt,
      completedAt: null
    }].slice(-8)
  }, {
    type: 'journey_created',
    journeyId: journey.id,
    targetCompetencyCode: frameworkCompetency.code,
    planSource: journey.planSource
  });

  nextState = await persistAndAudit(record, nextState, tenantId, userId, 'journey_adaptive_created', {
    journeyId: journey.id,
    targetCompetencyCode: frameworkCompetency.code,
    estimatedChapterCount: journey.estimatedChapterCount,
    planSource: journey.planSource
  });

  return buildRuntimeFromState(nextState);
}

export async function getAdaptiveJourneyRuntime(tenantId, userId) {
  const { adaptiveState } = await getJourneyAdaptiveStateRecord(tenantId, userId);
  return buildRuntimeFromState(adaptiveState);
}

export async function getCurrentAdaptiveJourneyChapter(tenantId, userId) {
  const runtime = await getAdaptiveJourneyRuntime(tenantId, userId);
  return runtime.currentChapter;
}

export async function submitAdaptiveJourneyDecision(tenantId, userId, payload = {}) {
  const { record, adaptiveState } = await getJourneyAdaptiveStateRecord(tenantId, userId);
  const activeJourney = adaptiveState.activeJourney;
  if (!activeJourney || activeJourney.status !== 'active') {
    throw new AppError('Nenhuma jornada adaptativa ativa para receber decisão.', 409);
  }
  if (payload.chapterId !== activeJourney.currentChapterId) {
    throw new AppError('O capítulo enviado não corresponde ao capítulo ativo oficial.', 409);
  }

  const competency = findFrameworkCompetency(activeJourney.competencyCode);
  const chapter = getChapterBaseById(payload.chapterId);
  const currentProgress = activeJourney.competencyProgress[activeJourney.competencyCode];
  const evaluation = evaluateAdaptiveChapter({
    chapter,
    competency,
    learningProfile: activeJourney.mentorPreset?.id || 'analitico',
    currentProgress,
    payload
  });
  const action = decideAdaptiveJourneyAction({
    activeJourney,
    competency,
    currentChapter: chapter,
    evaluation
  });

  const execution = {
    id: uuidv4(),
    chapterBaseId: chapter.id,
    chapterType: chapter.tipo,
    selectedOption: payload.selectedOption,
    responseText: payload.responseText || '',
    result: {
      scoreDelta: evaluation.scoreDelta,
      confidenceDelta: evaluation.confidenceDelta,
      consistencySignal: evaluation.consistencySignal,
      mentorFeedback: evaluation.mentorFeedback,
      errorPattern: evaluation.errorPattern,
      successPattern: evaluation.successPattern
    },
    evidenceGenerated: evaluation.evidenceGenerated,
    actionTaken: action,
    completedAt: new Date().toISOString()
  };

  let nextJourney = markPlanItemCompleted(activeJourney, chapter.id);
  nextJourney = {
    ...nextJourney,
    completedExecutions: [...safeArray(nextJourney.completedExecutions), execution].slice(-24),
    evidences: [...safeArray(nextJourney.evidences), evaluation.evidenceGenerated].slice(-80),
    competencyProgress: {
      ...nextJourney.competencyProgress,
      [activeJourney.competencyCode]: evaluation.updatedProgress
    },
    lastChapterResult: execution
  };

  if (action.kind === 'insert_reinforcement' && action.nextChapterBaseId) {
    nextJourney = insertReinforcementChapter(nextJourney, activeJourney.competencyCode, action.reason);
    nextJourney = pushExplanation(nextJourney, 'reinforcement', {
      reason: action.reason,
      chapterBaseId: action.nextChapterBaseId,
      at: execution.completedAt
    });
  }

  if (action.kind === 'accelerate') {
    nextJourney = pushExplanation(nextJourney, 'acceleration', {
      reason: action.reason,
      at: execution.completedAt
    });
    nextJourney = {
      ...nextJourney,
      status: 'ready_to_complete',
      currentChapterId: null
    };
  } else if (action.kind === 'close') {
    nextJourney = pushExplanation(nextJourney, 'closure', {
      reason: action.reason,
      at: execution.completedAt,
      mode: 'auto_eligible'
    });
    nextJourney = {
      ...nextJourney,
      status: 'ready_to_complete',
      currentChapterId: null
    };
  } else if (action.kind === 'close_blocked') {
    nextJourney = pushExplanation(nextJourney, 'closure', {
      reason: action.reason,
      at: execution.completedAt,
      mode: 'blocked'
    });
    nextJourney = {
      ...nextJourney,
      status: 'needs_review',
      currentChapterId: null
    };
  } else {
    nextJourney = advanceToNextPlannedChapter(nextJourney);
  }

  let nextState = appendAdaptiveAuditEvent({
    ...adaptiveState,
    activeJourney: nextJourney,
    status: nextJourney.status
  }, {
    type: 'chapter_completed',
    journeyId: nextJourney.id,
    chapterBaseId: chapter.id,
    action: action.kind
  });

  nextState = await persistAndAudit(record, nextState, tenantId, userId, 'journey_adaptive_chapter_completed', {
    journeyId: nextJourney.id,
    chapterBaseId: chapter.id,
    chapterType: chapter.tipo,
    action: action.kind,
    scoreDelta: evaluation.scoreDelta,
    consistencySignal: evaluation.consistencySignal
  });

  return {
    version: nextState.version,
    chapterResult: execution,
    runtime: buildRuntimeFromState(nextState)
  };
}

export async function recalculateAdaptiveJourney(tenantId, userId, payload = {}) {
  const { record, adaptiveState } = await getJourneyAdaptiveStateRecord(tenantId, userId);
  const activeJourney = adaptiveState.activeJourney;
  if (!activeJourney) {
    throw new AppError('Nenhuma jornada adaptativa ativa para recalcular.', 409);
  }

  const competency = findFrameworkCompetency(activeJourney.competencyCode);
  const progress = activeJourney.competencyProgress[activeJourney.competencyCode];
  const closure = validateClosureEligibility(progress, competency);
  let nextJourney = activeJourney;

  if (payload.force && !closure.eligible && activeJourney.currentChapterId) {
    nextJourney = insertReinforcementChapter(nextJourney, competency.code, payload.reason || 'Recalibração forçada pelo backend.');
    nextJourney = pushExplanation(nextJourney, 'reinforcement', {
      reason: payload.reason || 'Recalibração forçada pelo backend.',
      at: new Date().toISOString(),
      chapterBaseId: nextJourney.currentChapterId
    });
  }

  if (closure.eligible) {
    nextJourney = pushExplanation(nextJourney, 'closure', {
      reason: 'Recalculo confirmou elegibilidade de encerramento.',
      at: new Date().toISOString(),
      mode: 'recalculated'
    });
    nextJourney = {
      ...nextJourney,
      status: 'ready_to_complete',
      currentChapterId: null
    };
  }

  let nextState = appendAdaptiveAuditEvent({
    ...adaptiveState,
    activeJourney: nextJourney,
    status: nextJourney.status
  }, {
    type: 'journey_recalculated',
    journeyId: nextJourney.id,
    force: Boolean(payload.force)
  });

  nextState = await persistAndAudit(record, nextState, tenantId, userId, 'journey_adaptive_recalculated', {
    journeyId: nextJourney.id,
    force: Boolean(payload.force),
    reason: payload.reason || null,
    closureEligible: closure.eligible
  });

  return buildRuntimeFromState(nextState);
}

export async function getAdaptiveJourneyProgress(tenantId, userId) {
  const runtime = await getAdaptiveJourneyRuntime(tenantId, userId);
  return runtime.progress;
}

export async function getAdaptiveJourneyEvidences(tenantId, userId) {
  const { adaptiveState } = await getJourneyAdaptiveStateRecord(tenantId, userId);
  return safeArray(adaptiveState.activeJourney?.evidences);
}

export async function getAdaptiveJourneyHistory(tenantId, userId) {
  const { adaptiveState } = await getJourneyAdaptiveStateRecord(tenantId, userId);
  const dbHistory = await JourneyEvent.findAll({
    where: { tenantId, userId },
    order: [['createdAt', 'DESC']],
    limit: 50
  }).catch(() => []);

  return {
    executions: safeArray(adaptiveState.activeJourney?.completedExecutions),
    auditTrail: safeArray(adaptiveState.activeJourney?.auditTrail),
    events: dbHistory.map((item) => ({
      eventType: item.eventType,
      metadata: item.metadata,
      createdAt: item.createdAt
    }))
  };
}

export async function getAdaptiveJourneyExplanations(tenantId, userId) {
  const { adaptiveState } = await getJourneyAdaptiveStateRecord(tenantId, userId);
  return adaptiveState.activeJourney?.explanations || {
    reinforcement: [],
    acceleration: [],
    closure: [],
    validation: []
  };
}

export async function completeAdaptiveJourney(tenantId, userId, payload = {}) {
  const { record, adaptiveState } = await getJourneyAdaptiveStateRecord(tenantId, userId);
  const activeJourney = adaptiveState.activeJourney;
  if (!activeJourney) {
    throw new AppError('Nenhuma jornada adaptativa ativa para encerrar.', 409);
  }

  const competency = findFrameworkCompetency(activeJourney.competencyCode);
  const progress = activeJourney.competencyProgress[activeJourney.competencyCode];
  const closure = validateClosureEligibility(progress, competency);
  if (!closure.eligible) {
    throw new AppError('Encerramento bloqueado: evidências ou consistência insuficientes.', 409, { reasons: closure.reasons });
  }

  const completedAt = new Date().toISOString();
  let nextJourney = pushExplanation({
    ...activeJourney,
    status: 'completed',
    completedAt,
    currentChapterId: null,
    summary: {
      ...activeJourney.summary,
      completionReason: payload.reason || 'Encerramento validado pelo backend.'
    }
  }, 'closure', {
    reason: payload.reason || 'Encerramento validado pelo backend.',
    at: completedAt,
    mode: 'finalized'
  });

  let nextState = appendAdaptiveAuditEvent({
    ...adaptiveState,
    status: 'completed',
    activeJourney: nextJourney,
    journeys: safeArray(adaptiveState.journeys).map((journey) => (
      journey.id === nextJourney.id
        ? { ...journey, status: 'completed', completedAt }
        : journey
    ))
  }, {
    type: 'journey_completed',
    journeyId: nextJourney.id
  });

  nextState = await persistAndAudit(record, nextState, tenantId, userId, 'journey_adaptive_completed', {
    journeyId: nextJourney.id,
    reason: payload.reason || null,
    finalScore: progress.score,
    finalConsistency: progress.consistency,
    evidenceCount: progress.evidenceCount
  });

  return buildRuntimeFromState(nextState);
}
