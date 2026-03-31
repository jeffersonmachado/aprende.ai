import express from 'express';
import request from 'supertest';
import { notFoundHandler } from '../core/middleware/notFoundHandler.js';
import { errorHandler } from '../core/middleware/errorHandler.js';
import { AppError } from '../core/errors/AppError.js';

describe('middlewares de erro', () => {
  const originalNodeEnv = process.env.NODE_ENV;

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  function buildApp() {
    const app = express();

    app.get('/app-error', (_req, _res, next) => {
      next(new AppError('falha validacao', 422, { campo: 'email' }));
    });

    app.get('/app-error-sem-details', (_req, _res, next) => {
      next(new AppError('falha simples', 400));
    });

    app.get('/generic-error', () => {
      throw new Error('erro inesperado');
    });

    app.get('/generic-error-sem-mensagem', (_req, _res, next) => {
      next({ stack: 'stack fake' });
    });

    app.use(notFoundHandler);
    app.use(errorHandler);

    return app;
  }

  test('retorna 404 para rota inexistente', async () => {
    const app = buildApp();
    const res = await request(app).get('/nao-existe');

    expect(res.statusCode).toBe(404);
    expect(res.body).toEqual({ error: 'Rota não encontrada' });
  });

  test('retorna status e details para AppError', async () => {
    const app = buildApp();
    const res = await request(app).get('/app-error');

    expect(res.statusCode).toBe(422);
    expect(res.body.error).toBe('falha validacao');
    expect(res.body.details).toEqual({ campo: 'email' });
  });

  test('retorna 500 para erros genéricos', async () => {
    process.env.NODE_ENV = 'development';
    const app = buildApp();
    const res = await request(app).get('/generic-error');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('erro inesperado');
    expect(res.body.stack).toContain('Error: erro inesperado');
  });

  test('não inclui details quando AppError não tem details', async () => {
    const app = buildApp();
    const res = await request(app).get('/app-error-sem-details');

    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'falha simples' });
  });

  test('não inclui stack para erro genérico em produção', async () => {
    process.env.NODE_ENV = 'production';
    const app = buildApp();
    const res = await request(app).get('/generic-error');

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe('erro inesperado');
    expect(res.body.stack).toBeUndefined();
  });

  test('usa mensagem padrão quando erro genérico não possui message', async () => {
    process.env.NODE_ENV = 'production';
    const app = buildApp();
    const res = await request(app).get('/generic-error-sem-mensagem');

    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Erro interno do servidor' });
  });
});
