import { v4 as uuidv4 } from 'uuid';
import { ADAPTIVE_CHAPTER_LIBRARY } from './journey-adaptive.fixtures.js';

function asNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min = 0, max = 100) {
  return Math.min(max, Math.max(min, value));
}

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function average(values = []) {
  if (!values.length) return 0;
  return values.reduce((sum, item) => sum + item, 0) / values.length;
}

export function createCompetencyProgressState(competency, diagnosis = {}) {
  return {
    code: competency.code,
    name: competency.name,
    score: clamp(asNumber(diagnosis.baselineScore, 42)),
    targetScore: competency.scoreTarget,
    consistency: clamp(asNumber(diagnosis.consistency, 42)),
    confidence: clamp(asNumber(diagnosis.confidence, 40)),
    minimumConsistency: competency.minimalConsistency,
    minimumEvidenceCount: competency.minimumEvidenceCount,
    minimumDiverseEvidenceTypes: competency.minimumDiverseEvidenceTypes,
    evidenceCount: 0,
    diverseEvidenceTypes: [],
    recurringErrors: safeArray(diagnosis.errorPatterns),
    successPatterns: safeArray(diagnosis.successPatterns),
    criticalChapterPerformance: {},
    history: []
  };
}

function resolveScoreHint(payload = {}) {
  const hint = payload?.outcome?.scoreHint;
  if (Number.isFinite(Number(hint))) return clamp(Number(hint));
  const responseText = String(payload?.responseText || '').trim();
  const selectedOption = String(payload?.selectedOption || '').toLowerCase();
  if (!responseText.length) return selectedOption.includes('ceder') || selectedOption.includes('negar') ? 44 : 58;
  if (responseText.length >= 160) return 76;
  if (responseText.length >= 80) return 68;
  return 60;
}

function resolveConfidenceHint(payload = {}) {
  const hint = payload?.outcome?.confidenceHint;
  return clamp(asNumber(hint, 60));
}

function buildMentorFeedback(chapter, learningProfile, scoreHint, successTags, errorTags) {
  const tagText = successTags.length
    ? `Sinais positivos: ${successTags.join(', ')}.`
    : errorTags.length
      ? `Risco recorrente: ${errorTags.join(', ')}.`
      : 'Continue explicitando o critério da decisão.';
  if (learningProfile === 'explorador') {
    return `Que hipótese sua decisão testou de fato? ${tagText}`;
  }
  if (learningProfile === 'pratico') {
    return `Próximo ajuste objetivo: preserve o critério central de ${chapter.titulo.toLowerCase()}. ${tagText}`;
  }
  if (learningProfile === 'narrativo') {
    return `O capítulo revela uma tensão clara entre contexto e ação. ${tagText}`;
  }
  return `Leitura analítica: score observado ${scoreHint.toFixed(0)}. ${tagText}`;
}

export function evaluateAdaptiveChapter({ chapter, competency, learningProfile, currentProgress, payload }) {
  const scoreHint = resolveScoreHint(payload);
  const confidenceHint = resolveConfidenceHint(payload);
  const weight = asNumber(competency.weightByChapterType?.[chapter.tipo], 1);
  const successTags = safeArray(payload?.outcome?.successTags);
  const errorTags = safeArray(payload?.outcome?.errorTags);
  const scoreDelta = Number((((scoreHint - 50) / 8) * weight).toFixed(2));
  const confidenceDelta = Number((((confidenceHint - 50) / 10) * weight).toFixed(2));
  const updatedScore = clamp(asNumber(currentProgress.score, 0) + scoreDelta);
  const updatedConfidence = clamp(asNumber(currentProgress.confidence, 0) + confidenceDelta);

  const evidenceGenerated = {
    id: uuidv4(),
    chapterBaseId: chapter.id,
    chapterType: chapter.tipo,
    evidenceType: chapter.tipo,
    text: payload?.outcome?.evidenceText || payload?.responseText || chapter.objetivoPedagogico,
    successTags,
    errorTags,
    createdAt: new Date().toISOString()
  };

  const recentHistory = [...safeArray(currentProgress.history), {
    chapterType: chapter.tipo,
    scoreHint,
    scoreDelta,
    confidenceDelta,
    successTags,
    errorTags,
    createdAt: evidenceGenerated.createdAt
  }].slice(-8);
  const recentSignals = recentHistory.slice(-4);
  const consistencySignal = clamp(average(recentSignals.map((item) => item.scoreHint)) - (average(recentSignals.map((item) => item.errorTags.length * 7))));
  const updatedConsistency = clamp((asNumber(currentProgress.consistency, 0) * 0.55) + (consistencySignal * 0.45));
  const diverseEvidenceTypes = Array.from(new Set([...safeArray(currentProgress.diverseEvidenceTypes), chapter.tipo]));
  const recurringErrors = Array.from(new Set([...safeArray(currentProgress.recurringErrors), ...errorTags])).slice(-8);
  const successPatterns = Array.from(new Set([...safeArray(currentProgress.successPatterns), ...successTags])).slice(-8);
  const criticalChapterPerformance = {
    ...(currentProgress.criticalChapterPerformance || {}),
    ...(competency.requiredCriticalChapterTypes.includes(chapter.tipo)
      ? { [chapter.tipo]: scoreHint }
      : {})
  };

  return {
    scoreDelta,
    confidenceDelta,
    evidenceGenerated,
    consistencySignal: Number(updatedConsistency.toFixed(2)),
    mentorFeedback: buildMentorFeedback(chapter, learningProfile, scoreHint, successTags, errorTags),
    errorPattern: errorTags,
    successPattern: successTags,
    updatedProgress: {
      ...currentProgress,
      score: Number(updatedScore.toFixed(2)),
      confidence: Number(updatedConfidence.toFixed(2)),
      consistency: Number(updatedConsistency.toFixed(2)),
      evidenceCount: asNumber(currentProgress.evidenceCount, 0) + 1,
      diverseEvidenceTypes,
      recurringErrors,
      successPatterns,
      criticalChapterPerformance,
      history: recentHistory
    }
  };
}

export function validateClosureEligibility(progress, competency) {
  const missingCriticalChapter = competency.requiredCriticalChapterTypes.find((type) => {
    const score = asNumber(progress.criticalChapterPerformance?.[type], 0);
    return score < 60;
  });

  return {
    eligible: (
      asNumber(progress.score, 0) >= competency.scoreTarget
      && asNumber(progress.consistency, 0) >= competency.minimalConsistency
      && asNumber(progress.evidenceCount, 0) >= competency.minimumEvidenceCount
      && safeArray(progress.diverseEvidenceTypes).length >= competency.minimumDiverseEvidenceTypes
      && !missingCriticalChapter
    ),
    reasons: [
      ...(asNumber(progress.score, 0) < competency.scoreTarget ? [`score atual ${progress.score} abaixo do alvo ${competency.scoreTarget}`] : []),
      ...(asNumber(progress.consistency, 0) < competency.minimalConsistency ? [`consistência ${progress.consistency} abaixo do mínimo ${competency.minimalConsistency}`] : []),
      ...(asNumber(progress.evidenceCount, 0) < competency.minimumEvidenceCount ? [`evidências ${progress.evidenceCount}/${competency.minimumEvidenceCount}`] : []),
      ...(safeArray(progress.diverseEvidenceTypes).length < competency.minimumDiverseEvidenceTypes ? ['diversidade de evidências insuficiente'] : []),
      ...(missingCriticalChapter ? [`desempenho insuficiente em capítulo crítico ${missingCriticalChapter}`] : [])
    ]
  };
}

export function decideAdaptiveJourneyAction({ activeJourney, competency, currentChapter, evaluation }) {
  const progress = evaluation.updatedProgress;
  const recentHistory = safeArray(progress.history).slice(-competency.reinforcementCriteria.stagnationThreshold);
  const recentAverage = average(recentHistory.map((item) => item.scoreHint));
  const recentSuccesses = safeArray(progress.history).slice(-competency.consolidationCriteria.requiredConsistentSuccesses)
    .filter((item) => item.scoreHint >= competency.consolidationCriteria.minimumRecentAverage).length;
  const closure = validateClosureEligibility(progress, competency);
  const chapterCount = safeArray(activeJourney.completedExecutions).length + 1;
  const stillHasCapacity = chapterCount < competency.maximumChapters;
  const errorFrequency = safeArray(progress.history)
    .flatMap((item) => safeArray(item.errorTags))
    .reduce((accumulator, tag) => ({
      ...accumulator,
      [tag]: (accumulator[tag] || 0) + 1
    }), {});
  const repeatingError = safeArray(evaluation.errorPattern)
    .find((tag) => asNumber(errorFrequency[tag], 0) >= competency.reinforcementCriteria.repeatedErrorThreshold);

  if (
    stillHasCapacity
    && (
      recentAverage < competency.reinforcementCriteria.lowPerformanceThreshold
      || evaluation.scoreDelta <= 0
      || Boolean(repeatingError)
    )
  ) {
    const reinforcementChapter = ADAPTIVE_CHAPTER_LIBRARY.find((chapter) => (
      chapter.competenciaPrincipal === competency.code && chapter.tipo === 'reforco'
    ));

    return {
      kind: 'insert_reinforcement',
      nextChapterBaseId: reinforcementChapter?.id || null,
      reason: repeatingError
        ? `Erro recorrente detectado: ${repeatingError}`
        : `Estagnação detectada com média recente ${recentAverage.toFixed(1)}`
    };
  }

  if (
    activeJourney.accelerationPolicy?.allowEarlyClosure
    && chapterCount >= competency.minimumChapters
    && recentSuccesses >= activeJourney.accelerationPolicy.minimumConsistentSuccesses
    && closure.eligible
  ) {
    return {
      kind: 'accelerate',
      nextChapterBaseId: null,
      reason: `Domínio consistente sustentado por ${recentSuccesses} capítulos recentes.`
    };
  }

  if (closure.eligible) {
    return {
      kind: 'close',
      nextChapterBaseId: null,
      reason: 'Critérios de score, consistência e evidências atendidos.'
    };
  }

  if (chapterCount >= competency.maximumChapters) {
    return {
      kind: 'close_blocked',
      nextChapterBaseId: null,
      reason: `Limite máximo de ${competency.maximumChapters} capítulos atingido sem elegibilidade de fechamento.`
    };
  }

  return {
    kind: 'continue',
    nextChapterBaseId: null,
    reason: `Progressão continua; score ${progress.score.toFixed(1)} e consistência ${progress.consistency.toFixed(1)} ainda pedem nova evidência.`
  };
}
