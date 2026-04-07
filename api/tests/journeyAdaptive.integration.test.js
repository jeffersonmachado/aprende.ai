import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

const startAdaptiveJourneyDiagnosticMock = jest.fn();
const createAdaptiveJourneyMock = jest.fn();
const getAdaptiveJourneyRuntimeMock = jest.fn();
const getCurrentAdaptiveJourneyChapterMock = jest.fn();
const submitAdaptiveJourneyDecisionMock = jest.fn();
const recalculateAdaptiveJourneyMock = jest.fn();
const getAdaptiveJourneyProgressMock = jest.fn();
const getAdaptiveJourneyEvidencesMock = jest.fn();
const getAdaptiveJourneyHistoryMock = jest.fn();
const getAdaptiveJourneyExplanationsMock = jest.fn();
const completeAdaptiveJourneyMock = jest.fn();

jest.unstable_mockModule('../modules/journey-adaptive/journey-adaptive.service.js', () => ({
  startAdaptiveJourneyDiagnostic: startAdaptiveJourneyDiagnosticMock,
  createAdaptiveJourney: createAdaptiveJourneyMock,
  getAdaptiveJourneyRuntime: getAdaptiveJourneyRuntimeMock,
  getCurrentAdaptiveJourneyChapter: getCurrentAdaptiveJourneyChapterMock,
  submitAdaptiveJourneyDecision: submitAdaptiveJourneyDecisionMock,
  recalculateAdaptiveJourney: recalculateAdaptiveJourneyMock,
  getAdaptiveJourneyProgress: getAdaptiveJourneyProgressMock,
  getAdaptiveJourneyEvidences: getAdaptiveJourneyEvidencesMock,
  getAdaptiveJourneyHistory: getAdaptiveJourneyHistoryMock,
  getAdaptiveJourneyExplanations: getAdaptiveJourneyExplanationsMock,
  completeAdaptiveJourney: completeAdaptiveJourneyMock
}));

const { default: journeyAdaptiveRoutes } = await import('../modules/journey-adaptive/journey-adaptive.routes.js');

function buildApp({ tenantId = 'tenant-test', userId = 'user-test' } = {}) {
  const app = express();
  app.use(express.json());

  app.use((req, _res, next) => {
    req.tenant = { id: tenantId };
    req.auth = { userId };
    next();
  });

  app.use('/api', journeyAdaptiveRoutes);
  app.use((err, _req, res, _next) => {
    res.status(err.statusCode || 500).json({ error: err.message, details: err.details || null });
  });

  return app;
}

describe('journey adaptive routes integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/journey-adaptive/diagnostic/start inicia diagnóstico', async () => {
    const payload = { version: 'journey-adaptive.v1', diagnostic: { baselineScore: 48 } };
    startAdaptiveJourneyDiagnosticMock.mockResolvedValue(payload);

    const res = await request(buildApp())
      .post('/api/journey-adaptive/diagnostic/start')
      .send({ targetCompetencyCode: 'negociacao_adaptativa', diagnostic: { baselineScore: 48 } });

    expect(startAdaptiveJourneyDiagnosticMock).toHaveBeenCalledWith('tenant-test', 'user-test', {
      targetCompetencyCode: 'negociacao_adaptativa',
      diagnostic: { baselineScore: 48 }
    });
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(payload);
  });

  test('POST /api/journey-adaptive/session cria jornada adaptativa', async () => {
    const payload = { journeyId: 'journey-1', status: 'active' };
    createAdaptiveJourneyMock.mockResolvedValue(payload);

    const res = await request(buildApp())
      .post('/api/journey-adaptive/session')
      .send({ targetCompetencyCode: 'negociacao_adaptativa' });

    expect(createAdaptiveJourneyMock).toHaveBeenCalledWith('tenant-test', 'user-test', {
      targetCompetencyCode: 'negociacao_adaptativa'
    });
    expect(res.statusCode).toBe(201);
  });

  test('POST /api/journey-adaptive/decision rejeita payload inválido', async () => {
    const res = await request(buildApp())
      .post('/api/journey-adaptive/decision')
      .send({ chapterId: '', selectedOption: '' });

    expect(submitAdaptiveJourneyDecisionMock).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(422);
    expect(res.body.error).toBe('Payload inválido para registrar decisão adaptativa.');
  });

  test('GET /api/journey-adaptive/history devolve histórico auditável', async () => {
    const payload = {
      executions: [{ id: 'exec-1' }],
      auditTrail: [{ id: 'audit-1' }],
      events: [{ eventType: 'journey_adaptive_created' }]
    };
    getAdaptiveJourneyHistoryMock.mockResolvedValue(payload);

    const res = await request(buildApp()).get('/api/journey-adaptive/history');

    expect(getAdaptiveJourneyHistoryMock).toHaveBeenCalledWith('tenant-test', 'user-test');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(payload);
  });
});