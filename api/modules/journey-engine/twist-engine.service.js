import { PLOT_TWIST_LIBRARY } from '../journey-flow/journey-runtime.fixtures.js';

export function resolveTwistCandidate({ worldState, existingTwist = null, mission = null }) {
  if (existingTwist && existingTwist.status !== 'resolved') {
    return existingTwist;
  }

  if (Number(worldState?.execution_risk || 0) >= 72) {
    return PLOT_TWIST_LIBRARY.find((item) => item.kind === 'deadline_reduction') || PLOT_TWIST_LIBRARY[0];
  }

  if (Number(worldState?.stakeholder_trust || 0) <= 34) {
    return PLOT_TWIST_LIBRARY.find((item) => item.kind === 'new_stakeholder') || PLOT_TWIST_LIBRARY[0];
  }

  if (Number(worldState?.tension_level || 0) >= 76) {
    return PLOT_TWIST_LIBRARY.find((item) => item.kind === 'internal_conflict') || PLOT_TWIST_LIBRARY[0];
  }

  if (Array.isArray(mission?.optionalTwistTriggers) && mission.optionalTwistTriggers.includes('new_information')) {
    return PLOT_TWIST_LIBRARY.find((item) => item.kind === 'new_information') || null;
  }

  return null;
}