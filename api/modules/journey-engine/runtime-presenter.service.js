import { resolveNextPhaseId, resolvePhaseTimeline } from './phase-resolver.service.js';

export function presentJourneyEngineRuntime({ baseRuntime, engineState, competencyMatrix }) {
  return {
    version: 'journey-engine.v1',
    generatedAt: new Date().toISOString(),
    activePhaseId: engineState.activePhaseId,
    nextPhaseId: resolveNextPhaseId(engineState.activePhaseId),
    phaseTimeline: resolvePhaseTimeline(engineState.activePhaseId, engineState.completedPhaseIds),
    worldState: engineState.worldState,
    worldStateHistory: engineState.worldStateHistory,
    mission: baseRuntime.mission,
    learner: baseRuntime.learner,
    latestDecision: engineState.lastDecision,
    latestConsequence: engineState.lastConsequence,
    latestTwist: engineState.latestTwist,
    reflection: engineState.reflection,
    result: engineState.latestResult,
    progression: engineState.progression,
    unlockedContent: engineState.unlockedContent,
    competencyDashboard: competencyMatrix,
    auditTrail: engineState.auditTrail,
    campaignProgress: baseRuntime?.journey?.campaignProgress || null
  };
}