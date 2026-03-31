import { v4 as uuidv4 } from 'uuid';
import { Competency, UserCompetencyScore } from '../../db/models/index.js';

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
		type: payload.type || 'hard',
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
			evidencesJson: []
		}
	});

	const nextScore = Math.max(0, Math.min(100, Number(score.score || 0) + Number(impact || 0)));
	const nextLevel = nextScore >= 75 ? 'avancado' : nextScore >= 45 ? 'intermediario' : 'iniciante';
	const evidences = Array.isArray(score.evidencesJson) ? [...score.evidencesJson] : [];
	if (evidence) {
		evidences.push(evidence);
	}

	await score.update({
		score: nextScore,
		level: nextLevel,
		evidenceCount: Number(score.evidenceCount || 0) + (evidence ? 1 : 0),
		evidencesJson: evidences.slice(-50),
		lastEvaluatedAt: new Date()
	});

	return score;
}
