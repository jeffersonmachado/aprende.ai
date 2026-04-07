import { buildConsequenceFromChoice } from './consequence-engine.service.js';

export function processDecision({ choice, mission, worldState }) {
  const consequence = buildConsequenceFromChoice({ choice, mission, worldState });
  const qualityScore = Math.max(0, Math.min(100,
    55
    + (Number(consequence.delta.stakeholder_trust || 0) * 1.4)
    - (Number(consequence.delta.execution_risk || 0) * 1.1)
    + (Number(consequence.delta.team_alignment || 0) * 0.8)
  ));

  return {
    qualityScore,
    consequence
  };
}