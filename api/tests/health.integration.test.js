import request from 'supertest';
import { buildApp, loadSystemRoutes } from './helpers/systemHealthTestKit.js';

describe('GET /health integration', () => {
  test('retorna 200 com status ok quando não há migrations pendentes', async () => {
    const { router, authenticateMock } = await loadSystemRoutes({
      migrationsStrict: false,
      migrationStatus: {
        hasPending: false,
        pendingCount: 0,
        pending: [],
        localCount: 30,
        appliedCount: 30
      }
    });

    const app = buildApp();
    app.use(router);

    const res = await request(app).get('/health');

    expect(authenticateMock).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.database).toBe('ok');
    expect(res.body.migrations).toEqual({
      strictMode: false,
      hasPending: false,
      pendingCount: 0,
      pending: [],
      localCount: 30,
      appliedCount: 30
    });
  });

  test('retorna 200 com status degraded quando há migrations pendentes', async () => {
    const { router, authenticateMock } = await loadSystemRoutes({
      migrationsStrict: true,
      migrationStatus: {
        hasPending: true,
        pendingCount: 1,
        pending: ['20260331210000-adaptive-learning-mvp.cjs'],
        localCount: 30,
        appliedCount: 29
      }
    });

    const app = buildApp();
    app.use(router);

    const res = await request(app).get('/health');

    expect(authenticateMock).toHaveBeenCalledTimes(1);
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('degraded');
    expect(res.body.database).toBe('ok');
    expect(res.body.migrations).toEqual({
      strictMode: true,
      hasPending: true,
      pendingCount: 1,
      pending: ['20260331210000-adaptive-learning-mvp.cjs'],
      localCount: 30,
      appliedCount: 29
    });
  });

  test('retorna 503 quando banco não está disponível', async () => {
    const { router } = await loadSystemRoutes({
      authenticateError: new Error('db timeout')
    });

    const app = buildApp();
    app.use(router);

    const res = await request(app).get('/health');

    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({
      name: 'aprende-ai-api',
      version: '0.2.0',
      status: 'down',
      database: 'error',
      error: 'db timeout'
    });
  });
});
