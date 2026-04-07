import { jest } from '@jest/globals';

const findOrCreateMock = jest.fn();

jest.unstable_mockModule('../db/models/index.js', () => ({
  JourneyState: {
    findOrCreate: findOrCreateMock
  }
}));

const {
  DEFAULT_WORLD_STATE,
  appendAuditEvent,
  appendWorldStateSnapshot,
  applyWorldDelta,
  getJourneyEngineStateRecord,
  normalizeJourneyEngineState,
  normalizeWorldState,
  persistJourneyEngineState
} = await import('../modules/journey-engine/state-manager.service.js');

describe('state-manager.service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('normalizeWorldState preserva zero e aplica clamps esperados', () => {
    expect(normalizeWorldState({
      tension_level: 0,
      stakeholder_trust: '12',
      budget: 999,
      morale: -5,
      execution_risk: 'valor-invalido'
    })).toEqual(expect.objectContaining({
      tension_level: 0,
      stakeholder_trust: 12,
      budget: 120,
      morale: 0,
      execution_risk: DEFAULT_WORLD_STATE.execution_risk
    }));
  });

  test('normalizeJourneyEngineState filtra fases invalidas e limita historicos', () => {
    const state = normalizeJourneyEngineState({
      activePhaseId: 'fase-inexistente',
      completedPhaseIds: ['briefing', 'mission', 'ignorada', 'reflection'],
      worldState: { tension_level: 0 },
      worldStateHistory: Array.from({ length: 25 }, (_, index) => ({ label: `w-${index}` })),
      auditTrail: Array.from({ length: 90 }, (_, index) => ({ label: `a-${index}` }))
    });

    expect(state.activePhaseId).toBe('briefing');
    expect(state.completedPhaseIds).toEqual(['briefing', 'mission', 'reflection']);
    expect(state.worldState.tension_level).toBe(0);
    expect(state.worldStateHistory).toHaveLength(20);
    expect(state.worldStateHistory[0].label).toBe('w-5');
    expect(state.auditTrail).toHaveLength(80);
    expect(state.auditTrail[0].label).toBe('a-10');
  });

  test('appendWorldStateSnapshot registra snapshot com zero sem voltar ao baseline', () => {
    const next = appendWorldStateSnapshot({
      worldState: DEFAULT_WORLD_STATE,
      worldStateHistory: []
    }, 'after-decision', {
      ...DEFAULT_WORLD_STATE,
      stakeholder_trust: 0,
      budget: 0
    });

    expect(next.worldState.stakeholder_trust).toBe(0);
    expect(next.worldState.budget).toBe(0);
    expect(next.worldStateHistory.at(-1)).toEqual(expect.objectContaining({
      label: 'after-decision',
      worldState: expect.objectContaining({
        stakeholder_trust: 0,
        budget: 0
      })
    }));
  });

  test('appendAuditEvent acrescenta evento com metadados e limita trilha a 80 itens', () => {
    const next = appendAuditEvent({
      auditTrail: Array.from({ length: 80 }, (_, index) => ({ id: `old-${index}`, type: `event-${index}` }))
    }, {
      type: 'phase_started',
      phaseId: 'mission'
    });

    expect(next.auditTrail).toHaveLength(80);
    expect(next.auditTrail.at(-1)).toEqual(expect.objectContaining({
      type: 'phase_started',
      phaseId: 'mission',
      id: expect.any(String),
      at: expect.any(String)
    }));
    expect(next.auditTrail[0].id).toBe('old-1');
    expect(next.updatedAt).toEqual(expect.any(String));
  });

  test('applyWorldDelta soma, limita e ignora chaves desconhecidas', () => {
    expect(applyWorldDelta({
      stakeholder_trust: 10,
      budget: 118,
      morale: 2
    }, {
      stakeholder_trust: -15,
      budget: 8,
      morale: -10,
      unknown_metric: 99
    })).toEqual(expect.objectContaining({
      stakeholder_trust: 0,
      budget: 120,
      morale: 0
    }));
  });

  test('getJourneyEngineStateRecord inicializa journeyEngine ausente e persiste default', async () => {
    const updateMock = jest.fn().mockResolvedValue({});
    const record = {
      stateJson: { legacy: true },
      update: updateMock
    };
    findOrCreateMock.mockResolvedValue([record]);

    const response = await getJourneyEngineStateRecord('tenant-1', 'user-1');

    expect(findOrCreateMock).toHaveBeenCalledWith(expect.objectContaining({
      where: { tenantId: 'tenant-1', userId: 'user-1' }
    }));
    expect(response.record).toBe(record);
    expect(response.engineState).toEqual(expect.objectContaining({
      version: 'journey-engine.v1',
      activePhaseId: 'briefing'
    }));
    expect(updateMock).toHaveBeenCalledWith({
      stateJson: expect.objectContaining({
        legacy: true,
        journeyEngine: expect.objectContaining({
          version: 'journey-engine.v1',
          activePhaseId: 'briefing'
        })
      })
    });
  });

  test('persistJourneyEngineState normaliza payload antes de salvar', async () => {
    const updateMock = jest.fn().mockResolvedValue({});
    const record = {
      stateJson: { legacy: true },
      update: updateMock
    };

    const persisted = await persistJourneyEngineState(record, {
      activePhaseId: 'fase-inexistente',
      completedPhaseIds: ['briefing', 'ignorada'],
      worldState: { tension_level: 0, budget: 999 }
    });

    expect(updateMock).toHaveBeenCalledWith({
      lastEventAt: expect.any(Date),
      stateJson: expect.objectContaining({
        legacy: true,
        journeyEngine: expect.objectContaining({
          activePhaseId: 'briefing',
          completedPhaseIds: ['briefing'],
          worldState: expect.objectContaining({
            tension_level: 0,
            budget: 120
          })
        })
      })
    });
    expect(persisted).toEqual(expect.objectContaining({
      activePhaseId: 'briefing',
      completedPhaseIds: ['briefing'],
      worldState: expect.objectContaining({
        tension_level: 0,
        budget: 120
      })
    }));
  });
});