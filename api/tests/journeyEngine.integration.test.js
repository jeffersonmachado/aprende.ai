import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

const getJourneyEngineRuntimeMock = jest.fn();
const startJourneyEnginePhaseMock = jest.fn();
const submitJourneyEngineDecisionMock = jest.fn();
const resolveJourneyEngineTwistMock = jest.fn();
const submitJourneyEngineReflectionMock = jest.fn();
const finalizeJourneyEnginePhaseMock = jest.fn();
const getJourneyEngineResultMock = jest.fn();
const getJourneyEngineProgressMock = jest.fn();
const getJourneyEngineCompetenciesMock = jest.fn();

jest.unstable_mockModule('../modules/journey-engine/journey-engine.service.js', () => ({
  getJourneyEngineRuntime: getJourneyEngineRuntimeMock,
  startJourneyEnginePhase: startJourneyEnginePhaseMock,
  submitJourneyEngineDecision: submitJourneyEngineDecisionMock,
  resolveJourneyEngineTwist: resolveJourneyEngineTwistMock,
  submitJourneyEngineReflection: submitJourneyEngineReflectionMock,
  finalizeJourneyEnginePhase: finalizeJourneyEnginePhaseMock,
  getJourneyEngineResult: getJourneyEngineResultMock,
  getJourneyEngineProgress: getJourneyEngineProgressMock,
  getJourneyEngineCompetencies: getJourneyEngineCompetenciesMock
}));

const { default: journeyEngineRoutes } = await import('../modules/journey-engine/journey-engine.routes.js');

function buildApp({ tenantId = 'tenant-test', userId = 'user-test' } = {}) {
  const app = express();
  app.use(express.json());

  app.use((req, _res, next) => {
    req.tenant = { id: tenantId };
    req.auth = { userId };
    next();
  });

  app.use('/api', journeyEngineRoutes);

  app.use((err, _req, res, _next) => {
    res.status(500).json({ error: err.message });
  });

  return app;
}

describe('journey engine routes integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/journey-engine/runtime retorna o runtime consolidado', async () => {
    const payload = { activePhaseId: 'mission', worldState: { budget: 62 } };
    getJourneyEngineRuntimeMock.mockResolvedValue(payload);

    const app = buildApp({ tenantId: 'tenant-a', userId: 'user-a' });
    const res = await request(app).get('/api/journey-engine/runtime');

    expect(getJourneyEngineRuntimeMock).toHaveBeenCalledWith('tenant-a', 'user-a');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(payload);
  });

  test('POST /api/journey-engine/phases/:phaseId/start inicia a fase e retorna 201', async () => {
    const payload = {
      startedPhase: { id: 'briefing', title: 'Briefing' },
      runtime: { activePhaseId: 'briefing' }
    };
    startJourneyEnginePhaseMock.mockResolvedValue(payload);

    const app = buildApp({ tenantId: 'tenant-b', userId: 'user-b' });
    const res = await request(app)
      .post('/api/journey-engine/phases/briefing/start')
      .send({ chapterId: 'capitulo-1', missionId: 'mission-1' });

    expect(startJourneyEnginePhaseMock).toHaveBeenCalledWith('tenant-b', 'user-b', {
      chapterId: 'capitulo-1',
      missionId: 'mission-1',
      phaseId: 'briefing'
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(payload);
  });

  test('POST /api/journey-engine/phases/:phaseId/start propaga erro transacional como 500', async () => {
    startJourneyEnginePhaseMock.mockRejectedValue(new Error('falha ao iniciar fase'));

    const app = buildApp({ tenantId: 'tenant-start-error', userId: 'user-start-error' });
    const res = await request(app)
      .post('/api/journey-engine/phases/briefing/start')
      .send({ chapterId: 'capitulo-1' });

    expect(startJourneyEnginePhaseMock).toHaveBeenCalledWith('tenant-start-error', 'user-start-error', {
      chapterId: 'capitulo-1',
      phaseId: 'briefing'
    });
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'falha ao iniciar fase' });
  });

  test('POST /api/journey-engine/decision registra a decisão e retorna 201', async () => {
    const body = { chapterId: 'capitulo-1', choiceId: 'choice-1', responseText: 'priorizar cliente A' };
    const payload = {
      decision: { id: 'decision-1', label: 'Priorizar cliente A' },
      consequence: { delta: { stakeholder_trust: 8 } },
      runtime: { activePhaseId: 'consequence' }
    };
    submitJourneyEngineDecisionMock.mockResolvedValue(payload);

    const app = buildApp({ tenantId: 'tenant-c', userId: 'user-c' });
    const res = await request(app)
      .post('/api/journey-engine/decision')
      .send(body);

    expect(submitJourneyEngineDecisionMock).toHaveBeenCalledWith('tenant-c', 'user-c', body);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(payload);
  });

  test('POST /api/journey-engine/decision propaga erro de regra como 500', async () => {
    const body = { chapterId: 'capitulo-1', choiceId: 'choice-invalida' };
    submitJourneyEngineDecisionMock.mockRejectedValue(new Error('Nenhuma escolha valida foi encontrada para a missao atual.'));

    const app = buildApp({ tenantId: 'tenant-decision-error', userId: 'user-decision-error' });
    const res = await request(app)
      .post('/api/journey-engine/decision')
      .send(body);

    expect(submitJourneyEngineDecisionMock).toHaveBeenCalledWith('tenant-decision-error', 'user-decision-error', body);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Nenhuma escolha valida foi encontrada para a missao atual.' });
  });

  test('POST /api/journey-engine/twist/resolve resolve twist ativo', async () => {
    const body = { resolutionNotes: 'Plano de mitigacao executado' };
    const payload = {
      resolvedTwist: { id: 'twist-1', status: 'resolved' },
      runtime: { activePhaseId: 'reflection' }
    };
    resolveJourneyEngineTwistMock.mockResolvedValue(payload);

    const app = buildApp({ tenantId: 'tenant-d', userId: 'user-d' });
    const res = await request(app)
      .post('/api/journey-engine/twist/resolve')
      .send(body);

    expect(resolveJourneyEngineTwistMock).toHaveBeenCalledWith('tenant-d', 'user-d', body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(payload);
  });

  test('POST /api/journey-engine/reflection registra reflexão e retorna 201', async () => {
    const body = { chapterId: 'capitulo-1', reflectionText: 'Aprendi a reduzir ruido antes de decidir.' };
    const payload = {
      reflection: { text: body.reflectionText },
      runtime: { activePhaseId: 'phase-result' }
    };
    submitJourneyEngineReflectionMock.mockResolvedValue(payload);

    const app = buildApp({ tenantId: 'tenant-e', userId: 'user-e' });
    const res = await request(app)
      .post('/api/journey-engine/reflection')
      .send(body);

    expect(submitJourneyEngineReflectionMock).toHaveBeenCalledWith('tenant-e', 'user-e', body);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(payload);
  });

  test('POST /api/journey-engine/finalize fecha a fase atual', async () => {
    const body = { chapterId: 'capitulo-1' };
    const payload = {
      result: { phaseScore: 88, xpAwarded: 42 },
      progression: { nextPhaseId: 'progression' },
      runtime: { activePhaseId: 'progression' }
    };
    finalizeJourneyEnginePhaseMock.mockResolvedValue(payload);

    const app = buildApp({ tenantId: 'tenant-f', userId: 'user-f' });
    const res = await request(app)
      .post('/api/journey-engine/finalize')
      .send(body);

    expect(finalizeJourneyEnginePhaseMock).toHaveBeenCalledWith('tenant-f', 'user-f', body);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(payload);
  });

  test('POST /api/journey-engine/finalize propaga erro de fechamento como 500', async () => {
    const body = { chapterId: 'capitulo-1' };
    finalizeJourneyEnginePhaseMock.mockRejectedValue(new Error('falha ao finalizar fase'));

    const app = buildApp({ tenantId: 'tenant-finalize-error', userId: 'user-finalize-error' });
    const res = await request(app)
      .post('/api/journey-engine/finalize')
      .send(body);

    expect(finalizeJourneyEnginePhaseMock).toHaveBeenCalledWith('tenant-finalize-error', 'user-finalize-error', body);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'falha ao finalizar fase' });
  });

  test('GET /api/journey-engine/result retorna resumo final da fase', async () => {
    const payload = { phaseScore: 91, mastery: 77, xpAwarded: 38 };
    getJourneyEngineResultMock.mockResolvedValue(payload);

    const app = buildApp({ tenantId: 'tenant-g', userId: 'user-g' });
    const res = await request(app).get('/api/journey-engine/result');

    expect(getJourneyEngineResultMock).toHaveBeenCalledWith('tenant-g', 'user-g');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(payload);
  });

  test('GET /api/journey-engine/progress retorna progresso e estado do mundo', async () => {
    const payload = {
      activePhaseId: 'reflection',
      nextPhaseId: 'phase-result',
      worldState: { morale: 64, execution_risk: 41 }
    };
    getJourneyEngineProgressMock.mockResolvedValue(payload);

    const app = buildApp({ tenantId: 'tenant-h', userId: 'user-h' });
    const res = await request(app).get('/api/journey-engine/progress');

    expect(getJourneyEngineProgressMock).toHaveBeenCalledWith('tenant-h', 'user-h');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(payload);
  });

  test('GET /api/journey-engine/competencies retorna dashboard consolidado', async () => {
    const payload = {
      strengths: [{ id: 'comp-1', name: 'Tomada de decisão' }],
      focus: [{ id: 'comp-2', name: 'Consistência' }],
      summary: { averageMastery: 71 }
    };
    getJourneyEngineCompetenciesMock.mockResolvedValue(payload);

    const app = buildApp({ tenantId: 'tenant-i', userId: 'user-i' });
    const res = await request(app).get('/api/journey-engine/competencies');

    expect(getJourneyEngineCompetenciesMock).toHaveBeenCalledWith('tenant-i', 'user-i');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(payload);
  });

  test('propaga erro do serviço como 500', async () => {
    getJourneyEngineRuntimeMock.mockRejectedValue(new Error('engine indisponivel'));

    const app = buildApp();
    const res = await request(app).get('/api/journey-engine/runtime');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'engine indisponivel' });
  });
});