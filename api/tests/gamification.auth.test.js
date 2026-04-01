/**
 * Testes de autorização para rotas admin de gamificação.
 * Valida que o middleware requireRoleCodes bloqueia (403) usuários sem papel admin.
 */
import express from 'express';
import request from 'supertest';
import { requireRoleCodes } from '../core/middleware/requireRoleCodes.js';

function noop(_req, res) {
  res.status(200).json({ ok: true });
}

function buildApp({ injectedReq = {} } = {}) {
  const app = express();
  app.use(express.json());

  // Injeta req.auth e req.membership para simular autenticação
  app.use((req, _res, next) => {
    Object.assign(req, injectedReq);
    next();
  });

  const requireAdmin = requireRoleCodes(['admin']);

  app.get('/gamification/admin/reward-rules', requireAdmin, noop);
  app.put('/gamification/admin/reward-rules', requireAdmin, noop);
  app.get('/gamification/admin/level-rules', requireAdmin, noop);
  app.put('/gamification/admin/level-rules', requireAdmin, noop);

  return app;
}

describe('requireRoleCodes - autorização de rotas admin de gamificação', () => {
  describe('sem papel atribuído', () => {
    const app = buildApp({ injectedReq: {} });

    test('GET /admin/reward-rules retorna 403', async () => {
      const res = await request(app).get('/gamification/admin/reward-rules');
      expect(res.statusCode).toBe(403);
      expect(res.body.error).toBeTruthy();
    });

    test('PUT /admin/reward-rules retorna 403', async () => {
      const res = await request(app).put('/gamification/admin/reward-rules').send({});
      expect(res.statusCode).toBe(403);
    });

    test('GET /admin/level-rules retorna 403', async () => {
      const res = await request(app).get('/gamification/admin/level-rules');
      expect(res.statusCode).toBe(403);
    });

    test('PUT /admin/level-rules retorna 403', async () => {
      const res = await request(app).put('/gamification/admin/level-rules').send({});
      expect(res.statusCode).toBe(403);
    });
  });

  describe('com papel "student" (sem permissão admin)', () => {
    const app = buildApp({
      injectedReq: {
        auth: { userId: 'u-1', roleCode: 'student' },
        membership: { role: { code: 'student' } }
      }
    });

    test('GET /admin/reward-rules retorna 403', async () => {
      const res = await request(app).get('/gamification/admin/reward-rules');
      expect(res.statusCode).toBe(403);
      expect(res.body.error).toMatch(/restrito/i);
    });

    test('PUT /admin/reward-rules retorna 403', async () => {
      const res = await request(app).put('/gamification/admin/reward-rules').send({});
      expect(res.statusCode).toBe(403);
    });

    test('GET /admin/level-rules retorna 403', async () => {
      const res = await request(app).get('/gamification/admin/level-rules');
      expect(res.statusCode).toBe(403);
    });

    test('PUT /admin/level-rules retorna 403', async () => {
      const res = await request(app).put('/gamification/admin/level-rules').send({});
      expect(res.statusCode).toBe(403);
    });
  });

  describe('com papel "admin" (autorizado)', () => {
    const app = buildApp({
      injectedReq: {
        auth: { userId: 'u-admin', roleCode: 'admin' },
        membership: { role: { code: 'admin' } }
      }
    });

    test('GET /admin/reward-rules retorna 200', async () => {
      const res = await request(app).get('/gamification/admin/reward-rules');
      expect(res.statusCode).toBe(200);
    });

    test('PUT /admin/reward-rules retorna 200', async () => {
      const res = await request(app).put('/gamification/admin/reward-rules').send({});
      expect(res.statusCode).toBe(200);
    });

    test('GET /admin/level-rules retorna 200', async () => {
      const res = await request(app).get('/gamification/admin/level-rules');
      expect(res.statusCode).toBe(200);
    });

    test('PUT /admin/level-rules retorna 200', async () => {
      const res = await request(app).put('/gamification/admin/level-rules').send({});
      expect(res.statusCode).toBe(200);
    });
  });

  describe('fallback: roleCode no token sem membership', () => {
    const app = buildApp({
      injectedReq: {
        auth: { userId: 'u-admin-token', roleCode: 'admin' }
        // sem membership - usará req.auth.roleCode
      }
    });

    test('GET /admin/reward-rules retorna 200 via roleCode do token', async () => {
      const res = await request(app).get('/gamification/admin/reward-rules');
      expect(res.statusCode).toBe(200);
    });
  });
});
