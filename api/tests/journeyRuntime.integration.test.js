import express from 'express';
import request from 'supertest';
import { jest } from '@jest/globals';

const getJourneyExperienceRuntimeMock = jest.fn();
const triggerJourneyPlotTwistMock = jest.fn();
const resolveJourneyPlotTwistMock = jest.fn();
const getJourneyEffectivenessAnalyticsMock = jest.fn();
const saveJourneyCampaignProgressMock = jest.fn();

jest.unstable_mockModule('../modules/journey-flow/journey-runtime.service.js', () => ({
  getJourneyExperienceRuntime: getJourneyExperienceRuntimeMock,
  triggerJourneyPlotTwist: triggerJourneyPlotTwistMock,
  resolveJourneyPlotTwist: resolveJourneyPlotTwistMock,
  getJourneyEffectivenessAnalytics: getJourneyEffectivenessAnalyticsMock,
  saveJourneyCampaignProgress: saveJourneyCampaignProgressMock
}));

const { default: journeyFlowRoutes } = await import('../modules/journey-flow/journey-flow.routes.js');

function buildApp({ tenantId = 'tenant-test', userId = 'user-test', roleCode = 'admin' } = {}) {
  const app = express();
  app.use(express.json());

  app.use((req, _res, next) => {
    req.tenant = { id: tenantId };
    req.auth = { userId, roleCode };
    req.membership = { role: { code: roleCode } };
    next();
  });

  app.use('/api', journeyFlowRoutes);

  app.use((err, _req, res, _next) => {
    res.status(500).json({ error: err.message });
  });

  return app;
}

describe('journey runtime routes integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/journey-runtime retorna 200 e delega para o runtime service', async () => {
    const runtimePayload = {
      runtimeVersion: 'journey-experience-runtime.v1',
      learner: { id: 'user-test' },
      journey: { progressPercent: 42 }
    };

    getJourneyExperienceRuntimeMock.mockResolvedValue(runtimePayload);

    const app = buildApp({ tenantId: 'tenant-a', userId: 'user-a' });
    const res = await request(app).get('/api/journey-runtime');

    expect(getJourneyExperienceRuntimeMock).toHaveBeenCalledTimes(1);
    expect(getJourneyExperienceRuntimeMock).toHaveBeenCalledWith('tenant-a', 'user-a');
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(runtimePayload);
  });

  test('POST /api/journey-runtime/plot-twist retorna 201 com twist e runtime atualizado', async () => {
    const payload = { kind: 'deadline_reduction', source: 'campaign_ui' };
    const responsePayload = {
      twist: { id: 'twist-log-1', kind: 'deadline_reduction', status: 'triggered' },
      runtime: { journey: { progressPercent: 57 } }
    };

    triggerJourneyPlotTwistMock.mockResolvedValue(responsePayload);

    const app = buildApp({ tenantId: 'tenant-b', userId: 'user-b' });
    const res = await request(app)
      .post('/api/journey-runtime/plot-twist')
      .send(payload);

    expect(triggerJourneyPlotTwistMock).toHaveBeenCalledTimes(1);
    expect(triggerJourneyPlotTwistMock).toHaveBeenCalledWith('tenant-b', 'user-b', payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual(responsePayload);
  });

  test('POST /api/journey-runtime/plot-twist/resolve retorna 200 com twist resolvido', async () => {
    const payload = {
      twistLogId: 'twist-log-1',
      resolutionNotes: 'Resolvido no painel da campanha.'
    };

    const responsePayload = {
      resolvedTwist: {
        id: 'twist-log-1',
        kind: 'deadline_reduction',
        status: 'resolved'
      },
      runtime: { phaseResult: { phaseStatus: 'in_progress' } }
    };

    resolveJourneyPlotTwistMock.mockResolvedValue(responsePayload);

    const app = buildApp({ tenantId: 'tenant-c', userId: 'user-c' });
    const res = await request(app)
      .post('/api/journey-runtime/plot-twist/resolve')
      .send(payload);

    expect(resolveJourneyPlotTwistMock).toHaveBeenCalledTimes(1);
    expect(resolveJourneyPlotTwistMock).toHaveBeenCalledWith('tenant-c', 'user-c', payload);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(responsePayload);
  });

  test('POST /api/journey-runtime/campaign-progress persiste fase atual da campanha', async () => {
    const payload = {
      chapterId: 'capitulo-1',
      phaseId: 'cenario',
      unlockedChapterIds: ['capitulo-1'],
      completedPhaseKeys: ['capitulo-1:missao'],
      visitedPhaseKeys: ['capitulo-1:missao', 'capitulo-1:cenario']
    };
    const responsePayload = {
      campaignProgress: {
        ...payload,
        totalPhases: 5,
        totalChapters: 2,
        updatedAt: '2026-04-01T10:00:00.000Z'
      },
      runtime: { journey: { progressPercent: 42 } }
    };

    saveJourneyCampaignProgressMock.mockResolvedValue(responsePayload);

    const app = buildApp({ tenantId: 'tenant-campaign', userId: 'user-campaign' });
    const res = await request(app)
      .post('/api/journey-runtime/campaign-progress')
      .send(payload);

    expect(saveJourneyCampaignProgressMock).toHaveBeenCalledTimes(1);
    expect(saveJourneyCampaignProgressMock).toHaveBeenCalledWith('tenant-campaign', 'user-campaign', payload);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(responsePayload);
  });

  test('propaga erro do runtime service como 500', async () => {
    getJourneyExperienceRuntimeMock.mockRejectedValue(new Error('runtime indisponivel'));

    const app = buildApp();
    const res = await request(app).get('/api/journey-runtime');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'runtime indisponivel' });
  });

  test('GET /api/journey-runtime/analytics/effectiveness retorna 200 para admin com filtros', async () => {
    const analyticsPayload = {
      window: { days: 30 },
      totals: { users: 3, triggered: 10, resolved: 8, resolutionRate: 80 }
    };

    getJourneyEffectivenessAnalyticsMock.mockResolvedValue(analyticsPayload);

    const app = buildApp({ tenantId: 'tenant-admin', userId: 'user-admin', roleCode: 'admin' });
    const res = await request(app)
      .get('/api/journey-runtime/analytics/effectiveness?days=30&style=analitico&kind=new_information&chapterId=capitulo-2&phaseId=assessment&runStatus=completed&linkMode=linked');

    expect(getJourneyEffectivenessAnalyticsMock).toHaveBeenCalledTimes(1);
    expect(getJourneyEffectivenessAnalyticsMock).toHaveBeenCalledWith('tenant-admin', {
      days: '30',
      style: 'analitico',
      kind: 'new_information',
      chapterId: 'capitulo-2',
      phaseId: 'assessment',
      runStatus: 'completed',
      linkMode: 'linked'
    });
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual(analyticsPayload);
  });

  test('GET /api/journey-runtime/analytics/effectiveness retorna 403 para nao-admin', async () => {
    const app = buildApp({ tenantId: 'tenant-student', userId: 'user-student', roleCode: 'student' });
    const res = await request(app)
      .get('/api/journey-runtime/analytics/effectiveness?days=7');

    expect(getJourneyEffectivenessAnalyticsMock).not.toHaveBeenCalled();
    expect(res.statusCode).toBe(403);
    expect(res.body?.error).toMatch(/restrito/i);
  });
});
