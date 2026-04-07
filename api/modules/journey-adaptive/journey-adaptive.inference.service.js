import { chatCompletion } from '../../core/ai/chatCompletion.js';
import { AppError } from '../../core/errors/AppError.js';
import { ADAPTIVE_CHAPTER_LIBRARY } from './journey-adaptive.fixtures.js';
import { ADAPTIVE_FRAMEWORK, LEARNING_PROFILES, MENTOR_PRESETS } from './journey-adaptive.constants.js';

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

export function normalizeLearningProfile(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (LEARNING_PROFILES.includes(normalized)) return normalized;
  if (normalized.includes('explor')) return 'explorador';
  if (normalized.includes('prat')) return 'pratico';
  if (normalized.includes('narr')) return 'narrativo';
  return 'analitico';
}

function normalizeGoalType(value) {
  const normalized = String(value || '').trim().toLowerCase();
  if (normalized === 'resolve_problem') return 'resolve_problem';
  if (normalized === 'learn_new') return 'learn_new';
  if (normalized === 'develop_skill') return 'develop_skill';
  if (normalized === 'improve_performance') return 'improve_performance';
  if (normalized === 'prepare_challenge') return 'prepare_challenge';
  if (normalized.includes('resolver')) return 'resolve_problem';
  if (normalized.includes('novo')) return 'learn_new';
  if (normalized.includes('perform')) return 'improve_performance';
  if (normalized.includes('desafio')) return 'prepare_challenge';
  return 'develop_skill';
}

function normalizeUserTags(learnerProfile = {}) {
  return [
    learnerProfile.contextType,
    learnerProfile.experienceLevel,
    learnerProfile.currentLevel,
    learnerProfile.area,
    learnerProfile.primaryObjective
  ].filter(Boolean).map((value) => String(value).trim().toLowerCase());
}

function computeCompatibilityScore(chapter, { learnerProfile, learningGoal, learningProfile }) {
  const userTags = normalizeUserTags(learnerProfile);
  const goalType = normalizeGoalType(learningGoal?.goalType || learningGoal?.type);
  const normalizedProfile = normalizeLearningProfile(learningProfile);
  let score = 0;

  if (safeArray(chapter.perfilUsuarioCompativel).some((tag) => userTags.includes(String(tag).toLowerCase()))) score += 3;
  if (safeArray(chapter.metaAprendizagemCompativel).includes(goalType)) score += 3;
  if (safeArray(chapter.perfilAprendizagemCompativel).includes(normalizedProfile)) score += 4;
  if (chapter.tipo === 'diagnostico' || chapter.tipo === 'consolidacao') score += 1;
  return score;
}

function determineEstimatedChapterCount({ frameworkCompetency, diagnosis, historicalSignals = {}, learnerProfile, learningProfile }) {
  let count = 6;
  const baseline = asNumber(diagnosis?.baselineScore, 50);
  const historicalStagnation = asNumber(historicalSignals?.stagnationCount, 0);
  const experience = String(learnerProfile?.experienceLevel || learnerProfile?.currentLevel || '').toLowerCase();
  const normalizedProfile = normalizeLearningProfile(learningProfile);

  if (baseline >= 82) count -= 2;
  else if (baseline >= 70) count -= 1;
  else if (baseline <= 40) count += 2;
  else if (baseline <= 55) count += 1;

  if (historicalStagnation >= 2) count += 2;
  if (experience.includes('inic') || experience.includes('beginner')) count += 1;
  if (experience.includes('avan') || experience.includes('advanced')) count -= 1;
  if (normalizedProfile === 'narrativo' || normalizedProfile === 'explorador') count += 1;

  return clamp(count, frameworkCompetency.minimumChapters, frameworkCompetency.maximumChapters);
}

function selectPreferredTypes(learningProfile, diagnosis) {
  const profile = normalizeLearningProfile(learningProfile);
  const lowBaseline = asNumber(diagnosis?.baselineScore, 50) < 55;
  const map = {
    explorador: ['diagnostico', 'contexto', 'desafio', 'simulacao', 'reflexao', 'consolidacao'],
    pratico: ['diagnostico', 'desafio', 'simulacao', 'reforco', 'consolidacao'],
    narrativo: ['diagnostico', 'contexto', 'desafio', 'crise', 'reflexao', 'consolidacao'],
    analitico: ['diagnostico', 'contexto', 'desafio', 'simulacao', 'reflexao', 'consolidacao']
  };

  const selected = [...(map[profile] || map.analitico)];
  if (lowBaseline && !selected.includes('reforco')) {
    selected.splice(selected.length - 1, 0, 'reforco');
  }
  return selected;
}

function createJourneyPlanFromCandidates(candidates, preferredTypes, estimatedChapterCount) {
  const plan = [];
  const used = new Set();

  for (const type of preferredTypes) {
    const candidate = candidates.find((item) => item.tipo === type && !used.has(item.id));
    if (candidate) {
      plan.push(candidate);
      used.add(candidate.id);
    }
    if (plan.length >= estimatedChapterCount) break;
  }

  for (const candidate of candidates) {
    if (plan.length >= estimatedChapterCount) break;
    if (used.has(candidate.id)) continue;
    plan.push(candidate);
    used.add(candidate.id);
  }

  return plan.slice(0, estimatedChapterCount);
}

function ensureRequiredPlanShape(plan, candidates, estimatedChapterCount) {
  const diagnostic = candidates.find((item) => item.tipo === 'diagnostico');
  const consolidation = candidates.find((item) => item.tipo === 'consolidacao');
  const middle = plan.filter((item) => item.tipo !== 'diagnostico' && item.tipo !== 'consolidacao');
  const normalized = [];

  if (diagnostic) normalized.push(diagnostic);

  for (const item of middle) {
    if (normalized.find((candidate) => candidate.id === item.id)) continue;
    if (normalized.length >= Math.max(estimatedChapterCount - 1, 1)) break;
    normalized.push(item);
  }

  for (const candidate of candidates) {
    if (normalized.length >= Math.max(estimatedChapterCount - 1, 1)) break;
    if (candidate.tipo === 'diagnostico' || candidate.tipo === 'consolidacao') continue;
    if (normalized.find((item) => item.id === candidate.id)) continue;
    normalized.push(candidate);
  }

  if (consolidation && normalized.find((item) => item.id === consolidation.id) == null) {
    normalized.push(consolidation);
  }

  return normalized.slice(0, estimatedChapterCount);
}

function buildLearningStrategy(learningProfile, learningGoal) {
  return `${normalizeLearningProfile(learningProfile)}_${normalizeGoalType(learningGoal?.goalType || learningGoal?.type)}`;
}

function toPlanItem(chapter, reason, priority, insertedBy = 'inference') {
  return {
    chapterBaseId: chapter.id,
    reason,
    priority,
    type: chapter.tipo,
    insertedBy,
    validationStatus: 'approved'
  };
}

function buildDeterministicSuggestion(context) {
  const { targetCompetencyCode, frameworkCompetency, learnerProfile, learningGoal, learningProfile, diagnosis } = context;
  const compatibleChapters = ADAPTIVE_CHAPTER_LIBRARY
    .filter((chapter) => chapter.ativo && chapter.competenciaPrincipal === targetCompetencyCode)
    .map((chapter) => ({
      ...chapter,
      compatibilityScore: computeCompatibilityScore(chapter, { learnerProfile, learningGoal, learningProfile })
    }))
    .sort((left, right) => right.compatibilityScore - left.compatibilityScore);

  if (!compatibleChapters.length) {
    throw new AppError(`Nenhum capítulo-base ativo encontrado para a competência ${targetCompetencyCode}.`, 500);
  }

  const estimatedChapterCount = determineEstimatedChapterCount({
    frameworkCompetency,
    diagnosis,
    historicalSignals: context.historicalSignals,
    learnerProfile,
    learningProfile
  });
  const preferredTypes = selectPreferredTypes(learningProfile, diagnosis);
  const ordered = ensureRequiredPlanShape(
    createJourneyPlanFromCandidates(compatibleChapters, preferredTypes, estimatedChapterCount),
    compatibleChapters,
    estimatedChapterCount
  );

  return {
    estimatedChapterCount,
    learningStrategy: buildLearningStrategy(learningProfile, learningGoal),
    journeyPlan: ordered.map((chapter, index) => toPlanItem(
      chapter,
      index === 0 ? 'diagnóstico inicial da competência' : `capítulo ${chapter.tipo} aderente ao perfil e ao momento de progressão`,
      index + 1
    )),
    reinforcementPolicy: {
      insertIfStagnation: true,
      stagnationThreshold: frameworkCompetency.reinforcementCriteria.stagnationThreshold
    },
    accelerationPolicy: {
      allowEarlyClosure: true,
      minimumConsistentSuccesses: frameworkCompetency.consolidationCriteria.requiredConsistentSuccesses
    },
    meta: {
      source: 'deterministic',
      compatibleChapterIds: compatibleChapters.map((item) => item.id),
      mentorPreset: MENTOR_PRESETS[normalizeLearningProfile(learningProfile)]
    }
  };
}

function sanitizeJourneyPlanItems(suggestion, validChapterIds) {
  return safeArray(suggestion?.journeyPlan)
    .filter((item) => item && validChapterIds.has(item.chapterBaseId))
    .map((item, index) => ({
      chapterBaseId: item.chapterBaseId,
      reason: item.reason || 'capítulo validado pelo backend',
      priority: index + 1,
      type: ADAPTIVE_CHAPTER_LIBRARY.find((chapter) => chapter.id === item.chapterBaseId)?.tipo || null,
      insertedBy: 'inference',
      validationStatus: 'approved'
    }));
}

async function requestAiPlan(context, deterministic) {
  const prompt = {
    targetCompetencyCode: context.targetCompetencyCode,
    learnerProfile: context.learnerProfile,
    learningGoal: context.learningGoal,
    learningProfile: normalizeLearningProfile(context.learningProfile),
    diagnosis: context.diagnosis,
    framework: {
      scoreTarget: context.frameworkCompetency.scoreTarget,
      minChapters: context.frameworkCompetency.minimumChapters,
      maxChapters: context.frameworkCompetency.maximumChapters,
      allowedChapterTypes: context.frameworkCompetency.weightByChapterType,
      requiredCriticalChapterTypes: context.frameworkCompetency.requiredCriticalChapterTypes
    },
    validCandidates: deterministic.meta.compatibleChapterIds.map((id) => {
      const chapter = ADAPTIVE_CHAPTER_LIBRARY.find((item) => item.id === id);
      return {
        id: chapter.id,
        type: chapter.tipo,
        title: chapter.titulo,
        difficulty: chapter.dificuldade,
        objective: chapter.objetivoPedagogico
      };
    })
  };

  try {
    const completion = await chatCompletion({
      systemPrompt: 'Você planeja jornadas adaptativas controladas. Responda somente JSON válido, sem texto extra, respeitando apenas os capítulos-base permitidos.',
      userPrompt: `${JSON.stringify(prompt)}\nRetorne JSON com estimatedChapterCount, learningStrategy, journeyPlan[{chapterBaseId,reason,priority}], reinforcementPolicy{insertIfStagnation,stagnationThreshold}, accelerationPolicy{allowEarlyClosure,minimumConsistentSuccesses}.`,
      temperature: 0.2,
      maxTokens: 900
    });

    return {
      ...JSON.parse(completion.text),
      meta: {
        source: 'ai',
        model: completion.model,
        usage: completion.usage,
        compatibleChapterIds: deterministic.meta.compatibleChapterIds,
        mentorPreset: deterministic.meta.mentorPreset
      }
    };
  } catch {
    return deterministic;
  }
}

export function validateJourneyPlanSuggestion(context, suggestion) {
  const validIds = new Set(ADAPTIVE_CHAPTER_LIBRARY
    .filter((chapter) => chapter.ativo && chapter.competenciaPrincipal === context.targetCompetencyCode)
    .map((chapter) => chapter.id));
  const chapterBounds = {
    min: context.frameworkCompetency.minimumChapters,
    max: context.frameworkCompetency.maximumChapters
  };
  const sanitizedPlan = sanitizeJourneyPlanItems(suggestion, validIds);
  const estimatedChapterCount = clamp(
    asNumber(suggestion?.estimatedChapterCount, sanitizedPlan.length || chapterBounds.min),
    chapterBounds.min,
    chapterBounds.max
  );
  const journeyPlan = sanitizedPlan.slice(0, estimatedChapterCount);
  const reasons = [];

  if (!journeyPlan.find((item) => item.type === 'diagnostico')) {
    const fallbackDiagnostic = ADAPTIVE_CHAPTER_LIBRARY.find((chapter) => validIds.has(chapter.id) && chapter.tipo === 'diagnostico');
    if (fallbackDiagnostic) {
      journeyPlan.unshift(toPlanItem(fallbackDiagnostic, 'diagnóstico obrigatório inserido pelo backend', 1));
      reasons.push('Plano ajustado para garantir diagnóstico inicial obrigatório.');
    }
  }

  if (!journeyPlan.find((item) => item.type === 'consolidacao')) {
    const fallbackConsolidation = ADAPTIVE_CHAPTER_LIBRARY.find((chapter) => validIds.has(chapter.id) && chapter.tipo === 'consolidacao');
    if (fallbackConsolidation) {
      journeyPlan.push(toPlanItem(fallbackConsolidation, 'consolidação obrigatória inserida pelo backend', journeyPlan.length + 1));
      reasons.push('Plano ajustado para garantir consolidação antes do encerramento.');
    }
  }

  const normalizedPlan = journeyPlan
    .slice(0, chapterBounds.max)
    .map((item, index) => ({ ...item, priority: index + 1 }));

  return {
    estimatedChapterCount: clamp(normalizedPlan.length, chapterBounds.min, chapterBounds.max),
    learningStrategy: suggestion?.learningStrategy || buildLearningStrategy(context.learningProfile, context.learningGoal),
    journeyPlan: normalizedPlan,
    reinforcementPolicy: {
      insertIfStagnation: suggestion?.reinforcementPolicy?.insertIfStagnation !== false,
      stagnationThreshold: asNumber(suggestion?.reinforcementPolicy?.stagnationThreshold, context.frameworkCompetency.reinforcementCriteria.stagnationThreshold)
    },
    accelerationPolicy: {
      allowEarlyClosure: suggestion?.accelerationPolicy?.allowEarlyClosure !== false,
      minimumConsistentSuccesses: asNumber(
        suggestion?.accelerationPolicy?.minimumConsistentSuccesses,
        context.frameworkCompetency.consolidationCriteria.requiredConsistentSuccesses
      )
    },
    validation: {
      source: suggestion?.meta?.source || 'deterministic',
      reasons,
      mentorPreset: suggestion?.meta?.mentorPreset || MENTOR_PRESETS[normalizeLearningProfile(context.learningProfile)],
      compatibleChapterIds: suggestion?.meta?.compatibleChapterIds || []
    }
  };
}

export async function inferAdaptiveJourneyPlan(context) {
  const deterministic = buildDeterministicSuggestion(context);
  const candidateSuggestion = await requestAiPlan(context, deterministic);
  const validated = validateJourneyPlanSuggestion(context, candidateSuggestion);

  return {
    ...validated,
    meta: {
      source: validated.validation.source,
      mentorPreset: validated.validation.mentorPreset
    }
  };
}
