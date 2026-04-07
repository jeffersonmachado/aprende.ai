import { jest } from '@jest/globals';

const getJourneyAdaptiveStateRecordMock = jest.fn();
const persistJourneyAdaptiveStateMock = jest.fn();
const recordAdaptiveJourneyEventMock = jest.fn();
const journeyEventFindAllMock = jest.fn();

jest.unstable_mockModule('../db/models/index.js', () => ({
  Competency: { findOne: jest.fn() },
  JourneyEvent: { findAll: journeyEventFindAllMock },
  LearnerProfile: { findOne: jest.fn() },
  LearningGoal: { findAll: jest.fn() },
  LearningStyleProfile: { findOne: jest.fn() },
  UserCompetencyScore: { findAll: jest.fn() }
}));

jest.unstable_mockModule('../modules/competency/competency.service.js', () => ({
  createCompetency: jest.fn()
}));

jest.unstable_mockModule('../modules/journey-adaptive/journey-adaptive.audit.service.js', () => ({
  recordAdaptiveJourneyEvent: recordAdaptiveJourneyEventMock
}));

jest.unstable_mockModule('../modules/journey-adaptive/journey-adaptive.state.service.js', () => ({
  appendAdaptiveAuditEvent: (state, event) => ({
    ...state,
    auditTrail: [...(state.auditTrail || []), event],
    activeJourney: state.activeJourney
      ? {
        ...state.activeJourney,
        auditTrail: [...(state.activeJourney.auditTrail || []), event]
      }
      : null
  }),
  getJourneyAdaptiveStateRecord: getJourneyAdaptiveStateRecordMock,
  persistJourneyAdaptiveState: persistJourneyAdaptiveStateMock
}));

const {
  completeAdaptiveJourney,
  getAdaptiveJourneyHistory
} = await import('../modules/journey-adaptive/journey-adaptive.service.js');

function buildState(overrides = {}) {
  return {
    version: 'journey-adaptive.v1',
    status: 'active',
    diagnostic: null,
    journeys: [],
    auditTrail: [],
    activeJourney: {
      id: 'journey-1',
      status: 'ready_to_complete',
      competencyCode: 'negociacao_adaptativa',
      competencyName: 'Negociação Adaptativa',
      learnerSnapshot: {},
      createdAt: '2026-04-03T10:00:00.000Z',
      completedAt: null,
      learningStrategy: 'analitico_improve_performance',
      mentorPreset: { id: 'analitico' },
      planSource: 'deterministic',
      estimatedChapterCount: 4,
      chapterBounds: { min: 4, max: 10 },
      reinforcementPolicy: { insertIfStagnation: true, stagnationThreshold: 2 },
      accelerationPolicy: { allowEarlyClosure: true, minimumConsistentSuccesses: 2 },
      currentChapterId: null,
      chapterCursor: 3,
      plan: [],
      completedExecutions: [
        {
          id: 'exec-1',
          chapterBaseId: 'diag-negociacao-01',
          chapterType: 'diagnostico',
          selectedOption: 'mapear interesses antes de ofertar solução',
          result: { scoreDelta: 4.2 },
          actionTaken: { kind: 'continue' }
        }
      ],
      evidences: [{ id: 'ev-1', chapterType: 'diagnostico' }],
      competencyProgress: {
        negociacao_adaptativa: {
          code: 'negociacao_adaptativa',
          name: 'Negociação Adaptativa',
          score: 82,
          consistency: 72,
          confidence: 74,
          targetScore: 78,
          minimumConsistency: 68,
          minimumEvidenceCount: 3,
          minimumDiverseEvidenceTypes: 3,
          evidenceCount: 3,
          diverseEvidenceTypes: ['diagnostico', 'desafio', 'simulacao'],
          recurringErrors: [],
          successPatterns: ['criterio_estavel'],
          criticalChapterPerformance: { desafio: 78, simulacao: 83 },
          history: []
        }
      },
      explanations: {
        reinforcement: [],
        acceleration: [],
        closure: [],
        validation: []
      },
      auditTrail: [],
      lastChapterResult: null,
      summary: {}
    },
    ...overrides
  };
}

describe('journey-adaptive service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    persistJourneyAdaptiveStateMock.mockImplementation(async (_record, state) => state);
    recordAdaptiveJourneyEventMock.mockResolvedValue({});
  });

  test('bloqueia encerramento quando não há evidência suficiente', async () => {
    getJourneyAdaptiveStateRecordMock.mockResolvedValue({
      record: { id: 'state-1' },
      adaptiveState: buildState({
        activeJourney: {
          ...buildState().activeJourney,
          competencyProgress: {
            negociacao_adaptativa: {
              ...buildState().activeJourney.competencyProgress.negociacao_adaptativa,
              evidenceCount: 2,
              diverseEvidenceTypes: ['diagnostico', 'desafio']
            }
          }
        }
      })
    });

    await expect(completeAdaptiveJourney('tenant-1', 'user-1', { reason: 'tentar fechar cedo' }))
      .rejects.toThrow('Encerramento bloqueado: evidências ou consistência insuficientes.');

    expect(persistJourneyAdaptiveStateMock).not.toHaveBeenCalled();
  });

  test('retorna rastreabilidade completa com execuções e eventos auditáveis', async () => {
    getJourneyAdaptiveStateRecordMock.mockResolvedValue({
      record: { id: 'state-2' },
      adaptiveState: buildState()
    });
    journeyEventFindAllMock.mockResolvedValue([
      {
        eventType: 'journey_adaptive_created',
        metadata: { estimatedChapterCount: 4 },
        createdAt: '2026-04-03T10:00:00.000Z'
      },
      {
        eventType: 'journey_adaptive_chapter_completed',
        metadata: { chapterBaseId: 'diag-negociacao-01' },
        createdAt: '2026-04-03T11:00:00.000Z'
      }
    ]);

    const response = await getAdaptiveJourneyHistory('tenant-2', 'user-2');

    expect(response.executions).toHaveLength(1);
    expect(response.events).toHaveLength(2);
    expect(response.events[0].eventType).toBe('journey_adaptive_created');
  });
});
