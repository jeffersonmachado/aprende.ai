import { buildResponse, loadHealthController } from './helpers/systemHealthTestKit.js';

describe('system health controller', () => {
  test('retorna status ok quando banco responde e não há migrations pendentes', async () => {
    const { getHealth, authenticateMock, migrationStatusMock } = await loadHealthController({
      migrationsStrict: false,
      migrationStatus: {
        hasPending: false,
        pendingCount: 0,
        pending: [],
        localCount: 20,
        appliedCount: 20
      }
    });

    const res = buildResponse();
    await getHealth({}, res);

    expect(authenticateMock).toHaveBeenCalledTimes(1);
    expect(migrationStatusMock).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      name: 'aprende-ai-api',
      version: '0.2.0',
      status: 'ok',
      database: 'ok',
      migrations: {
        strictMode: false,
        hasPending: false,
        pendingCount: 0,
        pending: [],
        localCount: 20,
        appliedCount: 20
      }
    });
  });

  test('retorna status degraded quando existem migrations pendentes', async () => {
    const { getHealth } = await loadHealthController({
      migrationsStrict: true,
      migrationStatus: {
        hasPending: true,
        pendingCount: 2,
        pending: ['20260331210000-adaptive-learning-mvp.cjs', '20260331220000-something.cjs'],
        localCount: 22,
        appliedCount: 20
      }
    });

    const res = buildResponse();
    await getHealth({}, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      name: 'aprende-ai-api',
      version: '0.2.0',
      status: 'degraded',
      database: 'ok',
      migrations: {
        strictMode: true,
        hasPending: true,
        pendingCount: 2,
        pending: ['20260331210000-adaptive-learning-mvp.cjs', '20260331220000-something.cjs'],
        localCount: 22,
        appliedCount: 20
      }
    });
  });

  test('retorna status down quando a verificação de banco falha', async () => {
    const { getHealth, migrationStatusMock } = await loadHealthController({
      authenticateError: new Error('db offline')
    });

    const res = buildResponse();
    await getHealth({}, res);

    expect(migrationStatusMock).not.toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      name: 'aprende-ai-api',
      version: '0.2.0',
      status: 'down',
      database: 'error',
      error: 'db offline'
    });
  });
});
