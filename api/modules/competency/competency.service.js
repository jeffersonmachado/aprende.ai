import { v4 as uuidv4 } from 'uuid';
import { Competency, CompetencyEvidence, UserCompetencyScore } from '../../db/models/index.js';

const DEFAULT_DIMENSION_WEIGHTS = {
	hard: { K: 0.32, A: 0.38, J: 0.2, C: 0.1 },
	soft: { K: 0.16, A: 0.28, J: 0.32, C: 0.24 },
	comportamental: { K: 0.16, A: 0.28, J: 0.32, C: 0.24 }
};

const MASTERY_WEIGHTS = { K: 0.25, A: 0.35, J: 0.25, C: 0.15 };

function asNumber(value, fallback = 0) {
	const parsed = Number(value);
	return Number.isFinite(parsed) ? parsed : fallback;
}

function clamp(value, min = 0, max = 100) {
	return Math.min(max, Math.max(min, asNumber(value, min)));
}

function safeArray(value) {
	return Array.isArray(value) ? value : [];
}

function normalizeCompetencyType(value) {
	const normalized = String(value || 'comportamental').trim().toLowerCase();
	if (normalized === 'hard') return 'hard';
	if (normalized === 'soft') return 'soft';
	return 'comportamental';
}

function getTypeWeights(type) {
	return DEFAULT_DIMENSION_WEIGHTS[normalizeCompetencyType(type)] || DEFAULT_DIMENSION_WEIGHTS.comportamental;
}

function normalizeImpactSignal(value, sourceType = 'decision') {
	const numeric = asNumber(value, 0);
	if (sourceType === 'assessment') {
		return clamp((numeric - 5) * 1.6, -8, 8);
	}
	return clamp(numeric, -8, 8);
}

function defaultMetricState() {
	return {
		dimensions: { K: 34, A: 34, J: 34, C: 34 },
		mastery: 34,
		confidence: 28,
		consistency: 30,
		growth: 0,
		globalScore: 32,
		observedScore: 0,
		evidenceStats: { total: 0, direct: 0, inferred: 0 },
		history: [],
		updatedAt: null
	};
}

function normalizeStoredScoreState(value) {
	if (Array.isArray(value)) {
		return {
			entries: value,
			metrics: defaultMetricState()
		};
	}

	if (value && typeof value === 'object') {
		const metrics = value.metrics && typeof value.metrics === 'object'
			? {
				...defaultMetricState(),
				...value.metrics,
				dimensions: {
					...defaultMetricState().dimensions,
					...(value.metrics.dimensions || {})
				},
				evidenceStats: {
					...defaultMetricState().evidenceStats,
					...(value.metrics.evidenceStats || {})
				},
				history: safeArray(value.metrics.history)
			}
			: defaultMetricState();

		return {
			entries: safeArray(value.entries || value.legacy || []),
			metrics
		};
	}

	return {
		entries: [],
		metrics: defaultMetricState()
	};
}

function resolveEvidenceType(evidence = {}) {
	const explicit = String(evidence?.evidenceType || '').trim().toLowerCase();
	if (explicit === 'direct' || explicit === 'inferred') return explicit;
	if (evidence?.sourceType === 'assessment') return 'direct';
	if (evidence?.decisionLogId) return 'direct';
	return 'inferred';
}

function calculateMastery(dimensions = {}) {
	return clamp(
		(asNumber(dimensions.K) * MASTERY_WEIGHTS.K)
		+ (asNumber(dimensions.A) * MASTERY_WEIGHTS.A)
		+ (asNumber(dimensions.J) * MASTERY_WEIGHTS.J)
		+ (asNumber(dimensions.C) * MASTERY_WEIGHTS.C)
	);
}

function calculateConsistency(history = []) {
	if (!history.length) return 30;
	const recent = history.slice(-6).map((item) => asNumber(item.mastery || item.globalScore, 0));
	if (recent.length <= 1) return 60;

	const mean = recent.reduce((acc, value) => acc + value, 0) / recent.length;
	const variance = recent.reduce((acc, value) => acc + ((value - mean) ** 2), 0) / recent.length;
	const deviation = Math.sqrt(variance);
	return clamp(100 - (deviation * 2.4), 18, 100);
}

function calculateGrowth(history = []) {
	if (history.length < 2) return 0;
	const recent = history.slice(-3);
	const previous = history.slice(-6, -3);
	if (!recent.length) return 0;

	const recentMean = recent.reduce((acc, item) => acc + asNumber(item.mastery, 0), 0) / recent.length;
	const previousMean = previous.length
		? previous.reduce((acc, item) => acc + asNumber(item.mastery, 0), 0) / previous.length
		: asNumber(history[0]?.mastery, 0);

	return clamp((recentMean - previousMean) + 50, 0, 100);
}

function deriveObservedDimensions({ impact, evidence = {}, competencyType }) {
	const sourceType = String(evidence?.sourceType || 'decision').trim().toLowerCase() || 'decision';
	const normalizedImpact = normalizeImpactSignal(impact, sourceType);
	const impactMap = evidence?.impact && typeof evidence.impact === 'object' ? evidence.impact : {};
	const assertiveness = asNumber(impactMap.assertividade, normalizedImpact);
	const riskReading = asNumber(impactMap.analise_risco ?? impactMap['analise de risco'], normalizedImpact);
	const consistencySignal = asNumber(impactMap.consistencia, normalizedImpact);
	const speedSignal = asNumber(impactMap.velocidade, normalizedImpact);
	const text = `${evidence?.feedback || ''} ${evidence?.narrative || ''} ${evidence?.selectedOption || ''}`.toLowerCase();
	const typeWeights = getTypeWeights(competencyType);
	const base = 50 + (normalizedImpact * 6);
	const knowledgeBonus = /conceito|fundamento|modelo|hipotese|evidencia|conhecimento|referencial/.test(text) ? 7 : 0;
	const judgementBonus = /trade-off|criterio|risco|alternativa|prioriza|julga/.test(text) ? 8 : 0;
	const consistencyBonus = /checkpoint|cadencia|ritmo|consisten|rotina/.test(text) ? 6 : 0;

	return {
		K: clamp(base + (speedSignal * 2) + knowledgeBonus + (sourceType === 'assessment' ? 10 : 0) + ((typeWeights.K - 0.25) * 40)),
		A: clamp(base + (assertiveness * 5) + (sourceType === 'decision' ? 6 : 0) + ((typeWeights.A - 0.35) * 40)),
		J: clamp(base + (riskReading * 5) + judgementBonus + ((typeWeights.J - 0.25) * 40)),
		C: clamp(base + (consistencySignal * 5) + consistencyBonus + ((typeWeights.C - 0.15) * 40))
	};
}

function calculateConfidenceObservation({ history = [], evidenceStats = {}, evidenceType = 'inferred', sourceType = 'decision' }) {
	const recentEvents = history.slice(-6);
	const volatilityPenalty = recentEvents.length > 1 ? (100 - calculateConsistency(recentEvents)) * 0.35 : 0;
	const directFactor = asNumber(evidenceStats.direct, 0) * 6;
	const inferredFactor = asNumber(evidenceStats.inferred, 0) * 2.5;
	const recencyFactor = recentEvents.length * 4;
	const sourceBonus = sourceType === 'assessment' ? 8 : sourceType === 'decision' ? 5 : 2;
	const typeBonus = evidenceType === 'direct' ? 8 : 0;

	return clamp(24 + directFactor + inferredFactor + recencyFactor + sourceBonus + typeBonus - volatilityPenalty, 12, 100);
}

function classifyLevel(score) {
	if (score >= 85) return 'especialista';
	if (score >= 70) return 'avancado';
	if (score >= 50) return 'intermediario';
	return 'iniciante';
}

function describeTrend(history = []) {
	if (history.length < 2) {
		return { direction: 'steady', delta: 0 };
	}

	const last = history[history.length - 1];
	const previous = history[history.length - 2];
	const delta = Number((asNumber(last.mastery, 0) - asNumber(previous.mastery, 0)).toFixed(2));
	return {
		direction: delta > 1 ? 'up' : delta < -1 ? 'down' : 'steady',
		delta
	};
}

function buildRecommendation({ mastery, confidence, consistency, growth, competencyType, name }) {
	if (mastery < 50) {
		return `Reforcar ${name} com missao guiada, checkpoint explicito e evidencias diretas de aplicacao.`;
	}

	if (consistency < 55) {
		return `Consolidar ${name} em ciclos curtos para estabilizar consistencia sob pressao.`;
	}

	if (confidence < 55) {
		return `Aumentar confianca de leitura em ${name} com mais evidencias observadas e menos inferencia.`;
	}

	if (growth < 52) {
		return `Criar desafio incremental em ${name} para reativar crescimento sustentado.`;
	}

	return `Escalar ${name} com fase critica e maior peso de julgamento ${normalizeCompetencyType(competencyType) === 'hard' ? 'tecnico' : 'comportamental'}.`;
}

function parseDimensions(dimensions = []) {
	return (dimensions || []).map((dimension) => ({
		name: dimension.name,
		weight: Number(dimension.weight || 0),
		description: dimension.description || null
	}));
}

export async function listCompetencies(tenantId) {
	return Competency.findAll({ where: { tenantId }, order: [['name', 'ASC']] });
}

export async function createCompetency(tenantId, payload) {
	return Competency.create({
		id: uuidv4(),
		tenantId,
		code: payload.code || null,
		name: payload.name,
		type: normalizeCompetencyType(payload.type || payload.category || 'hard'),
		description: payload.description || null,
		category: payload.category || null,
		dimensionsJson: parseDimensions(payload.dimensions)
	});
}

export async function listUserScores(tenantId, userId) {
	return UserCompetencyScore.findAll({
		where: { tenantId, userId },
		order: [['updatedAt', 'DESC']]
	});
}

export async function upsertUserCompetencyScore(tenantId, userId, competencyId, impact, evidence) {
	const competency = await Competency.findOne({ where: { tenantId, id: competencyId } });
	const [score] = await UserCompetencyScore.findOrCreate({
		where: { tenantId, userId, competencyId },
		defaults: {
			id: uuidv4(),
			tenantId,
			userId,
			competencyId,
			score: 0,
			level: 'iniciante',
			evidenceCount: 0,
			evidencesJson: { entries: [], metrics: defaultMetricState() }
		}
	});

	const storedState = normalizeStoredScoreState(score.evidencesJson);
	const evidenceType = resolveEvidenceType(evidence);
	const sourceType = String(evidence?.sourceType || (evidence?.decisionLogId ? 'decision' : 'inferred')).trim().toLowerCase() || 'inferred';
	const alphaBase = sourceType === 'assessment' ? 0.34 : sourceType === 'decision' ? 0.28 : 0.18;
	const alpha = evidenceType === 'direct' ? alphaBase : alphaBase * 0.65;
	const observedDimensions = deriveObservedDimensions({
		impact,
		evidence,
		competencyType: competency?.type || 'comportamental'
	});
	const previousMetrics = storedState.metrics || defaultMetricState();
	const nextDimensions = Object.fromEntries(Object.keys(previousMetrics.dimensions).map((key) => {
		const previousValue = asNumber(previousMetrics.dimensions[key], 34);
		const observedValue = asNumber(observedDimensions[key], previousValue);
		return [key, clamp(previousValue + (alpha * (observedValue - previousValue)))];
	}));
	const nextMastery = calculateMastery(nextDimensions);
	const nextEntries = evidence
		? [...storedState.entries, {
			...evidence,
			evidenceType,
			sourceType,
			impactScore: asNumber(impact, 0),
			createdAt: evidence?.createdAt || new Date().toISOString()
		}].slice(-60)
		: storedState.entries;
	const provisionalHistory = [...safeArray(previousMetrics.history), {
		at: new Date().toISOString(),
		mastery: nextMastery,
		globalScore: asNumber(previousMetrics.globalScore, 32),
		confidence: asNumber(previousMetrics.confidence, 28),
		consistency: asNumber(previousMetrics.consistency, 30),
		growth: asNumber(previousMetrics.growth, 0),
		dimensions: nextDimensions
	}].slice(-12);
	const nextConsistency = calculateConsistency(provisionalHistory);
	const nextEvidenceStats = {
		total: asNumber(previousMetrics.evidenceStats?.total, 0) + (evidence ? 1 : 0),
		direct: asNumber(previousMetrics.evidenceStats?.direct, 0) + (evidence && evidenceType === 'direct' ? 1 : 0),
		inferred: asNumber(previousMetrics.evidenceStats?.inferred, 0) + (evidence && evidenceType === 'inferred' ? 1 : 0)
	};
	const confidenceObserved = calculateConfidenceObservation({
		history: provisionalHistory,
		evidenceStats: nextEvidenceStats,
		evidenceType,
		sourceType
	});
	const nextConfidence = clamp(asNumber(previousMetrics.confidence, 28) + ((alpha + 0.06) * (confidenceObserved - asNumber(previousMetrics.confidence, 28))));
	const nextGlobalScore = clamp((nextMastery * 0.7) + (nextConfidence * 0.15) + (nextConsistency * 0.15));
	const nextGrowth = calculateGrowth([...provisionalHistory.slice(0, -1), {
		...provisionalHistory[provisionalHistory.length - 1],
		mastery: nextMastery,
		globalScore: nextGlobalScore,
		confidence: nextConfidence,
		consistency: nextConsistency
	}]);
	const finalizedHistory = [...safeArray(previousMetrics.history), {
		at: new Date().toISOString(),
		mastery: Number(nextMastery.toFixed(2)),
		globalScore: Number(nextGlobalScore.toFixed(2)),
		confidence: Number(nextConfidence.toFixed(2)),
		consistency: Number(nextConsistency.toFixed(2)),
		growth: Number(nextGrowth.toFixed(2)),
		dimensions: nextDimensions
	}].slice(-12);
	const nextLevel = classifyLevel(nextMastery);

	await score.update({
		score: Number(nextGlobalScore.toFixed(2)),
		level: nextLevel,
		evidenceCount: nextEvidenceStats.total,
		evidencesJson: {
			entries: nextEntries,
			metrics: {
				dimensions: nextDimensions,
				mastery: Number(nextMastery.toFixed(2)),
				confidence: Number(nextConfidence.toFixed(2)),
				consistency: Number(nextConsistency.toFixed(2)),
				growth: Number(nextGrowth.toFixed(2)),
				globalScore: Number(nextGlobalScore.toFixed(2)),
				observedScore: Number((((observedDimensions.K + observedDimensions.A + observedDimensions.J + observedDimensions.C) / 4)).toFixed(2)),
				evidenceStats: nextEvidenceStats,
				history: finalizedHistory,
				updatedAt: new Date().toISOString()
			}
		},
		lastEvaluatedAt: new Date()
	});

	if (evidence) {
		await CompetencyEvidence.create({
			id: uuidv4(),
			tenantId,
			userId,
			competencyId,
			sourceType,
			sourceId: evidence?.decisionLogId || evidence?.scenarioRunId || null,
			evidenceText: evidence?.feedback || evidence?.narrative || null,
			score: Number(nextGlobalScore.toFixed(2)),
			metadata: {
				evidenceType,
				dimensionsObserved: observedDimensions,
				metricsSnapshot: {
					mastery: Number(nextMastery.toFixed(2)),
					confidence: Number(nextConfidence.toFixed(2)),
					consistency: Number(nextConsistency.toFixed(2)),
					growth: Number(nextGrowth.toFixed(2)),
					globalScore: Number(nextGlobalScore.toFixed(2))
				},
				payload: evidence
			}
		}).catch(() => null);
	}

	return score;
}

export async function getCompetencyMatrix(tenantId, userId) {
	const [catalog, scores, evidences] = await Promise.all([
		Competency.findAll({ where: { tenantId }, order: [['name', 'ASC']] }),
		UserCompetencyScore.findAll({ where: { tenantId, userId }, order: [['updatedAt', 'DESC']] }),
		CompetencyEvidence.findAll({ where: { tenantId, userId }, order: [['createdAt', 'DESC']], limit: 120 }).catch(() => [])
	]);

	const scoreMap = new Map(scores.map((item) => [item.competencyId, item]));
	const evidenceByCompetency = new Map();

	for (const evidence of evidences) {
		const key = evidence.competencyId || 'unknown';
		const current = evidenceByCompetency.get(key) || { total: 0, direct: 0, inferred: 0, recent: [] };
		const evidenceType = evidence?.metadata?.evidenceType === 'direct' ? 'direct' : 'inferred';

		current.total += 1;
		current[evidenceType] += 1;
		if (current.recent.length < 3) {
			current.recent.push({
				id: evidence.id,
				type: evidenceType,
				score: Number(evidence.score || 0),
				text: evidence.evidenceText || null,
				createdAt: evidence.createdAt
			});
		}

		evidenceByCompetency.set(key, current);
	}

	const items = catalog.map((competency) => {
		const userScore = scoreMap.get(competency.id);
		const storedState = normalizeStoredScoreState(userScore?.evidencesJson || null);
		const metricState = storedState.metrics || defaultMetricState();
		const evidenceStats = evidenceByCompetency.get(competency.id) || {
			total: Number(userScore?.evidenceCount || 0),
			direct: 0,
			inferred: 0,
			recent: []
		};

		const dimensions = parseDimensions(competency.dimensionsJson || []);
		const dimensionWeightTotal = dimensions.reduce((acc, dimension) => acc + Number(dimension.weight || 0), 0);

		return {
			id: competency.id,
			code: competency.code || null,
			name: competency.name,
			type: normalizeCompetencyType(competency.type || 'comportamental'),
			category: competency.category || null,
			description: competency.description || null,
			dimensions,
			dimensionWeightTotal,
			score: Number(metricState.globalScore || userScore?.score || 0),
			level: userScore?.level || classifyLevel(metricState.mastery || userScore?.score || 0),
			metrics: {
				mastery: Number(metricState.mastery || userScore?.score || 0),
				confidence: Number(metricState.confidence || 0),
				consistency: Number(metricState.consistency || 0),
				growth: Number(metricState.growth || 0),
				globalScore: Number(metricState.globalScore || userScore?.score || 0),
				dimensions: {
					K: Number(metricState.dimensions?.K || 0),
					A: Number(metricState.dimensions?.A || 0),
					J: Number(metricState.dimensions?.J || 0),
					C: Number(metricState.dimensions?.C || 0)
				}
			},
			trend: describeTrend(metricState.history),
			history: safeArray(metricState.history).slice(-8),
			evidence: {
				total: evidenceStats.total,
				direct: evidenceStats.direct,
				inferred: evidenceStats.inferred,
				recent: evidenceStats.recent
			},
			recommendation: buildRecommendation({
				mastery: Number(metricState.mastery || 0),
				confidence: Number(metricState.confidence || 0),
				consistency: Number(metricState.consistency || 0),
				growth: Number(metricState.growth || 0),
				competencyType: competency.type || 'comportamental',
				name: competency.name
			}),
			updatedAt: userScore?.updatedAt || null
		};
	});

	const sortedByScore = [...items].sort((a, b) => b.metrics.globalScore - a.metrics.globalScore || b.metrics.mastery - a.metrics.mastery);
	const summary = items.length
		? {
			averageMastery: Number((items.reduce((acc, item) => acc + asNumber(item.metrics.mastery, 0), 0) / items.length).toFixed(2)),
			averageConfidence: Number((items.reduce((acc, item) => acc + asNumber(item.metrics.confidence, 0), 0) / items.length).toFixed(2)),
			averageConsistency: Number((items.reduce((acc, item) => acc + asNumber(item.metrics.consistency, 0), 0) / items.length).toFixed(2)),
			averageGrowth: Number((items.reduce((acc, item) => acc + asNumber(item.metrics.growth, 0), 0) / items.length).toFixed(2))
		}
		: {
			averageMastery: 0,
			averageConfidence: 0,
			averageConsistency: 0,
			averageGrowth: 0
		};

	return {
		catalogSize: items.length,
		items,
		strengths: sortedByScore.slice(0, 3),
		focus: sortedByScore.slice(-3).reverse(),
		radar: sortedByScore.slice(0, 6).map((item) => ({
			id: item.id,
			name: item.name,
			value: item.metrics.mastery
		})),
		summary
	};
}
