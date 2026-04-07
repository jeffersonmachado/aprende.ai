import { v4 as uuidv4 } from 'uuid';
import { Competency } from '../../db/models/index.js';
import { getCompetencyMatrix, upsertUserCompetencyScore } from '../competency/competency.service.js';

const DEFAULT_DIMENSIONS = [
  { name: 'K', weight: 0.25, description: 'Conhecimento estruturado do dominio' },
  { name: 'A', weight: 0.35, description: 'Aplicacao em contexto real' },
  { name: 'J', weight: 0.25, description: 'Julgamento e criterio' },
  { name: 'C', weight: 0.15, description: 'Consistencia ao longo do tempo' }
];

export async function applyDecisionCompetencies(tenantId, userId, { mission, choice, qualityScore, consequence }) {
  const impactedNames = Array.isArray(mission?.competenciesImpacted) && mission.competenciesImpacted.length
    ? mission.competenciesImpacted
    : ['tomada de decisao'];

  for (const competencyName of impactedNames) {
    const [competency] = await Competency.findOrCreate({
      where: { tenantId, name: competencyName },
      defaults: {
        id: uuidv4(),
        tenantId,
        name: competencyName,
        type: 'comportamental',
        dimensionsJson: DEFAULT_DIMENSIONS
      }
    });

    await upsertUserCompetencyScore(tenantId, userId, competency.id, (Number(qualityScore || 0) - 55) / 8, {
      sourceType: 'decision',
      evidenceType: 'direct',
      selectedOption: choice?.label,
      feedback: consequence?.narrative,
      impact: {
        assertividade: Number(qualityScore || 0) / 12,
        analise_risco: -(Number(consequence?.delta?.execution_risk || 0) / 8),
        consistencia: Number(consequence?.delta?.team_alignment || 0) / 8,
        velocidade: -(Number(consequence?.delta?.time_pressure || 0) / 8)
      },
      narrative: consequence?.narrative,
      createdAt: new Date().toISOString()
    });
  }

  return getCompetencyMatrix(tenantId, userId);
}