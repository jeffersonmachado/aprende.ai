import { jest } from '@jest/globals';

const journeyEventCreateMock = jest.fn();
const journeyTwistLogCreateMock = jest.fn();
const journeyTwistLogUpdateMock = jest.fn();
const getJourneyExperienceRuntimeMock = jest.fn();
const trackTelemetryEventMock = jest.fn();
const recordGamificationEventMock = jest.fn();
const applyDecisionCompetenciesMock = jest.fn();
const processDecisionMock = jest.fn();
const buildReflectionPromptMock = jest.fn();
const buildRewardPackageMock = jest.fn();
const getJourneyEngineStateRecordMock = jest.fn();
const persistJourneyEngineStateMock = jest.fn();
const resolveTwistCandidateMock = jest.fn();

jest.unstable_mockModule('../db/models/index.js', () => ({
  JourneyEvent: { create: journeyEventCreateMock },
  JourneyTwistLog: {
    create: journeyTwistLogCreateMock,
    update: journeyTwistLogUpdateMock
  }
}));

jest.unstable_mockModule('../modules/journey-flow/journey-runtime.service.js', () => ({
  getJourneyExperienceRuntime: getJourneyExperienceRuntimeMock
}));

jest.unstable_mockModule('../modules/journey-flow/telemetry.service.js', () => ({
  trackTelemetryEvent: trackTelemetryEventMock
}));

jest.unstable_mockModule('../modules/gamification/gamification.service.js', () => ({
  recordGamificationEvent: recordGamificationEventMock
}));

jest.unstable_mockModule('../modules/journey-engine/competency-engine.service.js', () => ({
  applyDecisionCompetencies: applyDecisionCompetenciesMock
}));

jest.unstable_mockModule('../modules/journey-engine/decision-processor.service.js', () => ({
  processDecision: processDecisionMock
}));

jest.unstable_mockModule('../modules/journey-engine/mentor-bridge.service.js', () => ({
  buildReflectionPrompt: buildReflectionPromptMock
}));

jest.unstable_mockModule('../modules/journey-engine/reward-engine.service.js', () => ({
  buildRewardPackage: buildRewardPackageMock
}));

jest.unstable_mockModule('../modules/journey-engine/state-manager.service.js', () => ({
  appendAuditEvent: (state, event) => ({
    ...state,
    auditTrail: [...(state.auditTrail || []), event]
  }),
  appendWorldStateSnapshot: (state) => state,
  applyWorldDelta: (_worldState, delta = {}) => ({ ...delta }),
  getJourneyEngineStateRecord: getJourneyEngineStateRecordMock,
  persistJourneyEngineState: persistJourneyEngineStateMock
}));

jest.unstable_mockModule('../modules/journey-engine/twist-engine.service.js', () => ({
  resolveTwistCandidate: resolveTwistCandidateMock
}));

const {
  startJourneyEnginePhase,
  submitJourneyEngineDecision,
  resolveJourneyEngineTwist,
  finalizeJourneyEnginePhase
} = await import('../modules/journey-engine/journey-engine.service.js');

function buildEngineState(overrides = {}) {
  return {
    activePhaseId: 'briefing',
    currentChapterId: 'capitulo-1',
    currentMissionId: 'mission-1',
    worldState: { stakeholder_trust: 60 },
    completedPhaseIds: [],
    lastDecision: null,
    lastConsequence: null,
    latestTwist: null,
    latestResult: { phaseScore: 84, mastery: 78, xpAwarded: 42 },
    progression: null,
    reflection: null,
    unlockedContent: [],
    worldStateHistory: [],
    auditTrail: [],
    ...overrides
  };
}

describe('journey-engine.service domain rules', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    journeyEventCreateMock.mockResolvedValue({});
    journeyTwistLogCreateMock.mockResolvedValue({});
    journeyTwistLogUpdateMock.mockResolvedValue([1]);
    trackTelemetryEventMock.mockResolvedValue({});
    recordGamificationEventMock.mockResolvedValue({});
    applyDecisionCompetenciesMock.mockResolvedValue({
      strengths: [{ metrics: { mastery: 77 } }],
      focus: [{ name: 'Consistência' }],
      summary: { averageMastery: 77 }
    });
    processDecisionMock.mockReturnValue({
      qualityScore: 84,
      consequence: { delta: { stakeholder_trust: 8 }, narrative: 'impacto aplicado' }
    });
    buildReflectionPromptMock.mockReturnValue({ prompt: 'prompt', mentorCue: 'cue' });
    buildRewardPackageMock.mockReturnValue({ xpAwarded: 42, badges: [], badgeSummary: 'ok' });
    resolveTwistCandidateMock.mockReturnValue(null);
  });

  test('startJourneyEnginePhase normaliza phaseId inválido para briefing', async () => {
    getJourneyEngineStateRecordMock.mockResolvedValue({
      record: { id: 'state-1' },
      engineState: buildEngineState()
    });
    getJourneyExperienceRuntimeMock.mockResolvedValue({
      mission: { id: 'mission-1' },
      learner: { id: 'user-1' },
      competencies: { strengths: [], focus: [], summary: {} },
      journey: { campaignProgress: null }
    });

    const response = await startJourneyEnginePhase('tenant-1', 'user-1', {
      phaseId: 'fase-inexistente',
      chapterId: 'capitulo-1'
    });

    expect(response.startedPhase.id).toBe('briefing');
    expect(response.runtime.activePhaseId).toBe('briefing');
    expect(persistJourneyEngineStateMock).toHaveBeenCalledTimes(1);
    expect(persistJourneyEngineStateMock.mock.calls[0][1].activePhaseId).toBe('briefing');
  });

  test('submitJourneyEngineDecision falha quando a missão não tem escolha válida', async () => {
    getJourneyEngineStateRecordMock.mockResolvedValue({
      record: { id: 'state-2' },
      engineState: buildEngineState({ activePhaseId: 'mission' })
    });
    getJourneyExperienceRuntimeMock.mockResolvedValue({
      mission: { id: 'mission-1', choices: [] },
      learner: { id: 'user-1' },
      competencies: { strengths: [], focus: [], summary: {} },
      journey: { campaignProgress: null }
    });

    await expect(submitJourneyEngineDecision('tenant-2', 'user-2', {
      chapterId: 'capitulo-1',
      choiceId: 'choice-invalida'
    })).rejects.toThrow('Nenhuma escolha valida foi encontrada para a missao atual.');

    expect(persistJourneyEngineStateMock).not.toHaveBeenCalled();
    expect(recordGamificationEventMock).not.toHaveBeenCalled();
  });

  test('submitJourneyEngineDecision persiste consequence, reward e twist quando candidato existe', async () => {
    const engineState = buildEngineState({
      activePhaseId: 'mission',
      worldState: { stakeholder_trust: 60, execution_risk: 44 },
      latestTwist: { id: 'old-twist', status: 'resolved' }
    });
    getJourneyEngineStateRecordMock.mockResolvedValue({
      record: { id: 'state-5' },
      engineState
    });
    getJourneyExperienceRuntimeMock.mockResolvedValue({
      mission: {
        id: 'mission-1',
        choices: [{ id: 'choice-1', label: 'Segmentar rollout' }]
      },
      learner: { id: 'user-1' },
      competencies: {
        strengths: [{ metrics: { mastery: 77 } }],
        focus: [{ name: 'Consistência' }],
        summary: { averageMastery: 77 }
      },
      journey: { campaignProgress: null }
    });
    processDecisionMock.mockReturnValue({
      qualityScore: 88,
      consequence: {
        delta: { stakeholder_trust: 8, execution_risk: 29 },
        narrative: 'O sistema ficou mais estável, mas com risco elevado.'
      }
    });
    buildRewardPackageMock.mockReturnValue({
      xpAwarded: 51,
      badges: ['world_stabilizer'],
      badgeSummary: 'world_stabilizer'
    });
    resolveTwistCandidateMock.mockReturnValue({
      kind: 'deadline_reduction',
      title: 'Prazo encurtado',
      narrative: 'O prazo foi reduzido após a decisão.',
      impact: { time_pressure: 12 }
    });

    const response = await submitJourneyEngineDecision('tenant-5', 'user-5', {
      chapterId: 'capitulo-1',
      choiceId: 'choice-1',
      responseText: 'Segmentar rollout para reduzir ruído.'
    });

    expect(processDecisionMock).toHaveBeenCalledTimes(1);
    expect(buildRewardPackageMock).toHaveBeenCalledWith({
      worldDelta: { stakeholder_trust: 8, execution_risk: 29 },
      mastery: 77,
      phaseId: 'mission'
    });
    expect(resolveTwistCandidateMock).toHaveBeenCalledWith({
      worldState: { stakeholder_trust: 8, execution_risk: 29 },
      existingTwist: engineState.latestTwist,
      mission: { id: 'mission-1', choices: [{ id: 'choice-1', label: 'Segmentar rollout' }] }
    });
    expect(journeyTwistLogCreateMock).toHaveBeenCalledTimes(1);
    expect(recordGamificationEventMock).toHaveBeenCalledWith('tenant-5', 'user-5', expect.objectContaining({
      eventType: 'stage_completed',
      xpAwarded: 51,
      metadata: expect.objectContaining({
        choiceId: 'choice-1',
        triggeredTwist: true
      })
    }));
    expect(response.decision.label).toBe('Segmentar rollout');
    expect(response.consequence.rewards.xpAwarded).toBe(51);
    expect(response.runtime.activePhaseId).toBe('plot-twist');
    expect(response.runtime.latestTwist.kind).toBe('deadline_reduction');
    expect(persistJourneyEngineStateMock).toHaveBeenCalledTimes(1);
    expect(persistJourneyEngineStateMock.mock.calls[0][1]).toEqual(expect.objectContaining({
      activePhaseId: 'plot-twist',
      completedPhaseIds: ['mission']
    }));
  });

  test('resolveJourneyEngineTwist retorna null quando não existe twist ativo', async () => {
    getJourneyEngineStateRecordMock.mockResolvedValue({
      record: { id: 'state-3' },
      engineState: buildEngineState({ latestTwist: null })
    });
    getJourneyExperienceRuntimeMock.mockResolvedValue({
      mission: { id: 'mission-1' },
      learner: { id: 'user-1' },
      competencies: { strengths: [], focus: [], summary: {} },
      journey: { campaignProgress: null }
    });

    const response = await resolveJourneyEngineTwist('tenant-3', 'user-3', {
      resolutionNotes: 'n/a'
    });

    expect(response.resolvedTwist).toBeNull();
    expect(response.runtime.activePhaseId).toBe('briefing');
    expect(persistJourneyEngineStateMock).not.toHaveBeenCalled();
    expect(journeyTwistLogUpdateMock).not.toHaveBeenCalled();
  });

  test('finalizeJourneyEnginePhase cria progressão para a próxima fase com foco no gap mais fraco', async () => {
    getJourneyEngineStateRecordMock.mockResolvedValue({
      record: { id: 'state-4' },
      engineState: buildEngineState({ activePhaseId: 'phase-result' })
    });
    getJourneyExperienceRuntimeMock.mockResolvedValue({
      mission: { id: 'mission-1' },
      learner: { id: 'user-1' },
      competencies: {
        strengths: [{ name: 'Tomada de decisão' }],
        focus: [{ name: 'Consistência' }],
        summary: { averageMastery: 70 }
      },
      phaseResult: { nextTrackRecommendation: 'Refinar consistência antes de escalar.' },
      journey: { campaignProgress: null }
    });

    const response = await finalizeJourneyEnginePhase('tenant-4', 'user-4', {
      chapterId: 'capitulo-1'
    });

    expect(response.progression.nextPhaseId).toBe('progression');
    expect(response.progression.nextFocus).toBe('Consistência');
    expect(response.progression.recommendation).toBe('Refinar consistência antes de escalar.');
    expect(persistJourneyEngineStateMock).toHaveBeenCalledTimes(1);
    expect(persistJourneyEngineStateMock.mock.calls[0][1].activePhaseId).toBe('progression');
  });
});