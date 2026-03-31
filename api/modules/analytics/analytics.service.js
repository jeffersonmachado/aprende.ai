import {
  CompetencyEvidence,
  JourneyState,
  LearningGoal,
  SimulationRun,
  DecisionLog,
  AssessmentSubmission
} from '../../db/models/index.js';

export async function getPedagogicalAnalytics(tenantId, userId) {
  const [
    activeGoals,
    journeyState,
    simulations,
    decisions,
    evidence,
    submissions
  ] = await Promise.all([
    LearningGoal.count({ where: { tenantId, userId, status: 'active' } }),
    JourneyState.findOne({ where: { tenantId, userId } }),
    SimulationRun.findAll({ where: { tenantId, userId } }),
    DecisionLog.count({ where: { tenantId } }),
    CompetencyEvidence.findAll({ where: { tenantId, userId } }),
    AssessmentSubmission.findAll({ where: { tenantId, userId } })
  ]);

  const avgSimulationScore = simulations.length
    ? simulations.reduce((acc, curr) => acc + Number(curr.totalScore || 0), 0) / simulations.length
    : 0;

  const avgEvidenceScore = evidence.length
    ? evidence.reduce((acc, curr) => acc + Number(curr.score || 0), 0) / evidence.length
    : 0;

  const avgAssessmentScore = submissions.length
    ? submissions.reduce((acc, curr) => acc + Number(curr.aiScore || 0), 0) / submissions.length
    : 0;

  return {
    activeGoals,
    journeyProgressPercent: Number(journeyState?.progressPercent || 0),
    simulationsCount: simulations.length,
    decisionsCount: decisions,
    competencyEvidenceCount: evidence.length,
    assessmentSubmissionsCount: submissions.length,
    avgSimulationScore,
    avgEvidenceScore,
    avgAssessmentScore
  };
}
