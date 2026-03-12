import { v4 as uuidv4 } from 'uuid';
import { Competency, UserCompetencyScore } from '../../db/models/index.js';
export async function listCompetencies(tenantId) { return Competency.findAll({ where: { tenantId }, order: [['name', 'ASC']] }); }
export async function createCompetency(tenantId, payload) { return Competency.create({ id: uuidv4(), tenantId, code: payload.code || null, name: payload.name, description: payload.description || null, category: payload.category || null }); }
export async function listUserScores(tenantId, userId) { return UserCompetencyScore.findAll({ where: { tenantId, userId }, order: [['updatedAt', 'DESC']] }); }
