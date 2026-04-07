import { presentJourneyEngineRuntime } from '../modules/journey-engine/runtime-presenter.service.js';

describe('runtime-presenter.service', () => {
  test('monta snapshot consolidado com nextPhaseId, timeline e payloads do engine', () => {
    const runtime = presentJourneyEngineRuntime({
      baseRuntime: {
        mission: { id: 'mission-1', title: 'Missao ativa' },
        learner: { id: 'user-1' },
        journey: {
          campaignProgress: {
            chapterId: 'capitulo-1',
            phaseId: 'consequence'
          }
        }
      },
      engineState: {
        activePhaseId: 'consequence',
        completedPhaseIds: ['briefing', 'mission'],
        worldState: { stakeholder_trust: 72 },
        worldStateHistory: [{ label: 'baseline' }],
        lastDecision: { id: 'decision-1' },
        lastConsequence: { narrative: 'impacto' },
        latestTwist: { id: 'twist-1', status: 'triggered' },
        reflection: { text: 'texto' },
        latestResult: { phaseScore: 81 },
        progression: { nextFocus: 'Consistencia' },
        unlockedContent: ['badge-1'],
        auditTrail: [{ id: 'audit-1' }]
      },
      competencyMatrix: {
        strengths: [{ id: 'c1', name: 'Tomada de decisao' }]
      }
    });

    expect(runtime).toEqual(expect.objectContaining({
      version: 'journey-engine.v1',
      activePhaseId: 'consequence',
      nextPhaseId: 'plot-twist',
      mission: { id: 'mission-1', title: 'Missao ativa' },
      learner: { id: 'user-1' },
      latestDecision: { id: 'decision-1' },
      latestConsequence: { narrative: 'impacto' },
      latestTwist: { id: 'twist-1', status: 'triggered' },
      reflection: { text: 'texto' },
      result: { phaseScore: 81 },
      progression: { nextFocus: 'Consistencia' },
      unlockedContent: ['badge-1'],
      competencyDashboard: {
        strengths: [{ id: 'c1', name: 'Tomada de decisao' }]
      },
      campaignProgress: {
        chapterId: 'capitulo-1',
        phaseId: 'consequence'
      }
    }));
    expect(runtime.generatedAt).toEqual(expect.any(String));
    expect(runtime.phaseTimeline).toEqual(expect.arrayContaining([
      expect.objectContaining({ id: 'briefing', status: 'completed', unlocked: true }),
      expect.objectContaining({ id: 'mission', status: 'completed', unlocked: true }),
      expect.objectContaining({ id: 'consequence', status: 'active', unlocked: true }),
      expect.objectContaining({ id: 'plot-twist', status: 'pending', unlocked: false })
    ]));
  });

  test('normaliza fase inválida para briefing ao montar timeline e próximo passo', () => {
    const runtime = presentJourneyEngineRuntime({
      baseRuntime: {
        mission: null,
        learner: null,
        journey: { campaignProgress: null }
      },
      engineState: {
        activePhaseId: 'fase-inexistente',
        completedPhaseIds: ['mission'],
        worldState: {},
        worldStateHistory: [],
        lastDecision: null,
        lastConsequence: null,
        latestTwist: null,
        reflection: null,
        latestResult: null,
        progression: null,
        unlockedContent: [],
        auditTrail: []
      },
      competencyMatrix: null
    });

    expect(runtime.activePhaseId).toBe('fase-inexistente');
    expect(runtime.nextPhaseId).toBe('mission');
    expect(runtime.phaseTimeline[0]).toEqual(expect.objectContaining({
      id: 'briefing',
      status: 'active',
      unlocked: true
    }));
    expect(runtime.phaseTimeline.find((item) => item.id === 'mission')).toEqual(expect.objectContaining({
      status: 'completed',
      unlocked: true
    }));
  });
});