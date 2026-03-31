import { JourneyPlan, JourneyPlanStep, JourneyState } from '../../db/models/index.js';
import { generateJourney as buildJourney } from '../../services/adaptiveEngine.service.js';

export function generateJourney(userProfile, learningGoal, learningStyle) {
  return buildJourney(userProfile, learningGoal, learningStyle);
}

export async function getJourneySummary(tenantId, userId) {
  const plan = await JourneyPlan.findOne({
    where: { tenantId, userId, status: 'active' },
    include: [{ model: JourneyPlanStep, as: 'steps' }],
    order: [['createdAt', 'DESC']]
  });

  const journeyState = await JourneyState.findOne({ where: { tenantId, userId } });
  if (!plan) {
    return {
      title: 'Nenhuma jornada ativa',
      progressPercent: 0,
      steps: [],
      currentStepId: null,
      state: null
    };
  }

  const sortedSteps = [...(plan.steps || [])].sort((a, b) => a.orderIndex - b.orderIndex);

  return {
    id: plan.id,
    title: plan.title,
    progressPercent: Number(journeyState?.progressPercent || 0),
    currentStepId: journeyState?.currentStepId || null,
    adaptive: plan.metadata || null,
    steps: sortedSteps.map((step) => ({
      id: step.id,
      title: step.title,
      description: step.description,
      stepType: step.stepType,
      status: step.status,
      orderIndex: step.orderIndex
    })),
    state: journeyState?.stateJson || null
  };
}
