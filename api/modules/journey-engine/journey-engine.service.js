import { v4 as uuidv4 } from 'uuid';
import { JourneyEvent, JourneyTwistLog } from '../../db/models/index.js';
import { getJourneyExperienceRuntime } from '../journey-flow/journey-runtime.service.js';
import { trackTelemetryEvent } from '../journey-flow/telemetry.service.js';
import { recordGamificationEvent } from '../gamification/gamification.service.js';
import { applyDecisionCompetencies } from './competency-engine.service.js';
import { processDecision } from './decision-processor.service.js';
import { buildReflectionPrompt } from './mentor-bridge.service.js';
import { getPhaseDefinition, resolveNextPhaseId } from './phase-resolver.service.js';
import { buildRewardPackage } from './reward-engine.service.js';
import {
  appendAuditEvent,
  appendWorldStateSnapshot,
  applyWorldDelta,
  getJourneyEngineStateRecord,
  persistJourneyEngineState
} from './state-manager.service.js';
import { presentJourneyEngineRuntime } from './runtime-presenter.service.js';
import { resolveTwistCandidate } from './twist-engine.service.js';

async function recordJourneyEngineEvent(tenantId, userId, eventType, metadata = {}) {
  await JourneyEvent.create({
    id: uuidv4(),
    tenantId,
    userId,
    journeyId: null,
    eventType,
    metadata,
    createdAt: new Date(),
    updatedAt: new Date()
  }).catch(() => null);

  await trackTelemetryEvent({
    tenantId,
    userId,
    payload: {
      eventType,
      metadata,
      createdAt: new Date().toISOString()
    }
  }).catch(() => null);
}

async function buildRuntimeSnapshot(tenantId, userId, engineState) {
  const baseRuntime = await getJourneyExperienceRuntime(tenantId, userId);
  return presentJourneyEngineRuntime({
    baseRuntime,
    engineState,
    competencyMatrix: baseRuntime.competencies
  });
}

export async function getJourneyEngineRuntime(tenantId, userId) {
  const { engineState } = await getJourneyEngineStateRecord(tenantId, userId);
  return buildRuntimeSnapshot(tenantId, userId, engineState);
}

export async function startJourneyEnginePhase(tenantId, userId, payload = {}) {
  const { record, engineState } = await getJourneyEngineStateRecord(tenantId, userId);
  const phase = getPhaseDefinition(payload.phaseId);
  const nextState = appendAuditEvent({
    ...engineState,
    activePhaseId: phase.id,
    currentChapterId: payload.chapterId || engineState.currentChapterId,
    currentMissionId: payload.missionId || engineState.currentMissionId
  }, {
    type: 'phase_started',
    phaseId: phase.id,
    chapterId: payload.chapterId || engineState.currentChapterId
  });

  await persistJourneyEngineState(record, nextState);
  await recordJourneyEngineEvent(tenantId, userId, 'journey_engine_phase_started', {
    phaseId: phase.id,
    chapterId: payload.chapterId || engineState.currentChapterId
  });

  return {
    startedPhase: phase,
    runtime: await buildRuntimeSnapshot(tenantId, userId, nextState)
  };
}

export async function submitJourneyEngineDecision(tenantId, userId, payload = {}) {
  const { record, engineState } = await getJourneyEngineStateRecord(tenantId, userId);
  const baseRuntime = await getJourneyExperienceRuntime(tenantId, userId);
  const mission = baseRuntime.mission;
  const choice = (mission?.choices || []).find((item) => String(item.id) === String(payload.choiceId)) || mission?.choices?.[0];
  if (!choice) {
    throw new Error('Nenhuma escolha valida foi encontrada para a missao atual.');
  }

  const decision = processDecision({
    choice,
    mission,
    worldState: engineState.worldState
  });
  const worldAfter = applyWorldDelta(engineState.worldState, decision.consequence.delta);
  const competencyMatrix = await applyDecisionCompetencies(tenantId, userId, {
    mission,
    choice,
    qualityScore: decision.qualityScore,
    consequence: decision.consequence
  });
  const mastery = competencyMatrix?.strengths?.[0]?.metrics?.mastery || competencyMatrix?.summary?.averageMastery || 0;
  const rewards = buildRewardPackage({
    worldDelta: decision.consequence.delta,
    mastery,
    phaseId: engineState.activePhaseId
  });
  const twistCandidate = resolveTwistCandidate({
    worldState: worldAfter,
    existingTwist: engineState.latestTwist,
    mission
  });

  let latestTwist = engineState.latestTwist;
  if (twistCandidate && (!engineState.latestTwist || engineState.latestTwist.status === 'resolved')) {
    latestTwist = {
      id: uuidv4(),
      status: 'triggered',
      triggeredAt: new Date().toISOString(),
      ...twistCandidate
    };

    await JourneyTwistLog.create({
      id: latestTwist.id,
      tenantId,
      userId,
      journeyStateId: record.id,
      twistRuleId: null,
      kind: latestTwist.kind,
      title: latestTwist.title,
      narrative: latestTwist.narrative,
      impactJson: latestTwist.impact || {},
      suggestedAction: latestTwist.suggestedAction || null,
      status: 'triggered',
      triggeredAt: new Date(),
      metadata: {
        source: 'journey_engine',
        chapterId: payload.chapterId || engineState.currentChapterId
      }
    }).catch(() => null);
  }

  const phaseAfterDecision = latestTwist && latestTwist.status === 'triggered' ? 'plot-twist' : 'consequence';
  let nextState = {
    ...engineState,
    activePhaseId: phaseAfterDecision,
    completedPhaseIds: Array.from(new Set([...engineState.completedPhaseIds, 'mission'])),
    lastDecision: {
      id: uuidv4(),
      choiceId: choice.id,
      label: choice.label,
      submittedAt: new Date().toISOString(),
      qualityScore: Number(decision.qualityScore.toFixed(2)),
      responseText: payload.responseText || null
    },
    lastConsequence: {
      ...decision.consequence,
      worldBefore: engineState.worldState,
      worldAfter,
      rewards
    },
    latestTwist,
    latestResult: {
      phaseScore: Number(decision.qualityScore.toFixed(2)),
      mastery: Number(mastery.toFixed(2)),
      xpAwarded: rewards.xpAwarded,
      badges: rewards.badges,
      badgeSummary: rewards.badgeSummary
    }
  };
  nextState = appendWorldStateSnapshot(nextState, 'decision_applied', worldAfter);
  nextState = appendAuditEvent(nextState, {
    type: 'decision_submitted',
    phaseId: 'mission',
    chapterId: payload.chapterId || engineState.currentChapterId,
    choiceId: choice.id,
    qualityScore: decision.qualityScore
  });

  await persistJourneyEngineState(record, nextState);
  await recordJourneyEngineEvent(tenantId, userId, 'journey_engine_decision_submitted', {
    chapterId: payload.chapterId || engineState.currentChapterId,
    choiceId: choice.id,
    qualityScore: decision.qualityScore,
    xpAwarded: rewards.xpAwarded
  });
  await recordGamificationEvent(tenantId, userId, {
    eventType: 'stage_completed',
    source: 'journey_engine_decision',
    xpAwarded: rewards.xpAwarded,
    metadata: {
      choiceId: choice.id,
      chapterId: payload.chapterId || engineState.currentChapterId,
      phaseId: 'mission',
      triggeredTwist: Boolean(latestTwist && latestTwist.status === 'triggered')
    }
  }).catch(() => null);

  return {
    decision: nextState.lastDecision,
    consequence: nextState.lastConsequence,
    runtime: presentJourneyEngineRuntime({
      baseRuntime,
      engineState: nextState,
      competencyMatrix
    })
  };
}

export async function resolveJourneyEngineTwist(tenantId, userId, payload = {}) {
  const { record, engineState } = await getJourneyEngineStateRecord(tenantId, userId);
  if (!engineState.latestTwist || engineState.latestTwist.status === 'resolved') {
    return {
      resolvedTwist: null,
      runtime: await buildRuntimeSnapshot(tenantId, userId, engineState)
    };
  }

  const resolvedTwist = {
    ...engineState.latestTwist,
    status: 'resolved',
    resolutionNotes: String(payload.resolutionNotes || '').trim() || 'Twist resolvido pelo aprendiz.',
    resolvedAt: new Date().toISOString()
  };

  const nextState = appendAuditEvent({
    ...engineState,
    activePhaseId: 'reflection',
    completedPhaseIds: Array.from(new Set([...engineState.completedPhaseIds, 'plot-twist'])),
    latestTwist: resolvedTwist
  }, {
    type: 'twist_resolved',
    twistId: resolvedTwist.id,
    kind: resolvedTwist.kind
  });

  await persistJourneyEngineState(record, nextState);
  await JourneyTwistLog.update({
    status: 'resolved',
    resolvedAt: new Date(),
    resolutionNotes: resolvedTwist.resolutionNotes
  }, {
    where: { id: resolvedTwist.id, tenantId, userId }
  }).catch(() => null);
  await recordJourneyEngineEvent(tenantId, userId, 'journey_engine_twist_resolved', {
    twistId: resolvedTwist.id,
    kind: resolvedTwist.kind
  });

  return {
    resolvedTwist,
    runtime: await buildRuntimeSnapshot(tenantId, userId, nextState)
  };
}

export async function submitJourneyEngineReflection(tenantId, userId, payload = {}) {
  const { record, engineState } = await getJourneyEngineStateRecord(tenantId, userId);
  const baseRuntime = await getJourneyExperienceRuntime(tenantId, userId);
  const competencyName = baseRuntime?.competencies?.focus?.[0]?.name || baseRuntime?.mission?.competenciesImpacted?.[0] || 'tomada de decisao';
  const reflectionGuide = buildReflectionPrompt({
    mission: baseRuntime.mission,
    consequence: engineState.lastConsequence,
    twist: engineState.latestTwist,
    competencyName
  });

  const nextState = appendAuditEvent({
    ...engineState,
    activePhaseId: 'phase-result',
    completedPhaseIds: Array.from(new Set([...engineState.completedPhaseIds, 'consequence', 'reflection'])),
    reflection: {
      text: payload.reflectionText || '',
      submittedAt: new Date().toISOString(),
      ...reflectionGuide
    }
  }, {
    type: 'reflection_recorded',
    chapterId: payload.chapterId || engineState.currentChapterId
  });

  await persistJourneyEngineState(record, nextState);
  await recordJourneyEngineEvent(tenantId, userId, 'journey_engine_reflection_recorded', {
    chapterId: payload.chapterId || engineState.currentChapterId
  });

  return {
    reflection: nextState.reflection,
    runtime: presentJourneyEngineRuntime({
      baseRuntime,
      engineState: nextState,
      competencyMatrix: baseRuntime.competencies
    })
  };
}

export async function finalizeJourneyEnginePhase(tenantId, userId, payload = {}) {
  const { record, engineState } = await getJourneyEngineStateRecord(tenantId, userId);
  const baseRuntime = await getJourneyExperienceRuntime(tenantId, userId);
  const nextPhaseId = resolveNextPhaseId('phase-result') || 'progression';
  const weakest = baseRuntime?.competencies?.focus?.[0] || null;
  const nextState = appendAuditEvent({
    ...engineState,
    activePhaseId: nextPhaseId,
    completedPhaseIds: Array.from(new Set([...engineState.completedPhaseIds, 'phase-result'])),
    progression: {
      nextPhaseId: nextPhaseId,
      nextFocus: weakest?.name || baseRuntime?.phaseResult?.nextTrackRecommendation || 'Consolidar criterio da fase',
      recommendation: baseRuntime?.phaseResult?.nextTrackRecommendation || 'Siga para o proximo passo com foco no gap mais recorrente.',
      unlockedAt: new Date().toISOString()
    }
  }, {
    type: 'phase_finalized',
    chapterId: payload.chapterId || engineState.currentChapterId,
    nextPhaseId
  });

  await persistJourneyEngineState(record, nextState);
  await recordJourneyEngineEvent(tenantId, userId, 'journey_engine_phase_finalized', {
    chapterId: payload.chapterId || engineState.currentChapterId,
    nextPhaseId
  });

  return {
    result: nextState.latestResult,
    progression: nextState.progression,
    runtime: presentJourneyEngineRuntime({
      baseRuntime,
      engineState: nextState,
      competencyMatrix: baseRuntime.competencies
    })
  };
}

export async function getJourneyEngineResult(tenantId, userId) {
  const runtime = await getJourneyEngineRuntime(tenantId, userId);
  return runtime.result || null;
}

export async function getJourneyEngineProgress(tenantId, userId) {
  const runtime = await getJourneyEngineRuntime(tenantId, userId);
  return {
    activePhaseId: runtime.activePhaseId,
    nextPhaseId: runtime.nextPhaseId,
    phaseTimeline: runtime.phaseTimeline,
    worldState: runtime.worldState,
    progression: runtime.progression,
    campaignProgress: runtime.campaignProgress
  };
}

export async function getJourneyEngineCompetencies(tenantId, userId) {
  const runtime = await getJourneyEngineRuntime(tenantId, userId);
  return runtime.competencyDashboard;
}