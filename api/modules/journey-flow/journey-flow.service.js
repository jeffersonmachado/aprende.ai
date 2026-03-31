import { v4 as uuidv4 } from 'uuid';
import { JourneyState } from '../../db/models/index.js';

export async function getJourneyFlowState(tenantId, userId) {
  const state = await JourneyState.findOne({ where: { tenantId, userId } });
  return state?.stateJson?.journeyFlow || {
    step: 1,
    form: null,
    decision: null,
    updatedAt: null
  };
}

export async function saveJourneyFlowState(tenantId, userId, payload) {
  const [state] = await JourneyState.findOrCreate({
    where: { tenantId, userId },
    defaults: {
      id: uuidv4(),
      tenantId,
      userId,
      journeyPlanId: null,
      currentStepId: null,
      progressPercent: 0,
      stateJson: {}
    }
  });

  const nextJourneyFlow = {
    step: Number(payload.step || 1),
    form: payload.form || null,
    decision: payload.decision || null,
    updatedAt: new Date().toISOString()
  };

  await state.update({
    lastEventAt: new Date(),
    stateJson: {
      ...(state.stateJson || {}),
      journeyFlow: nextJourneyFlow
    }
  });

  return nextJourneyFlow;
}
