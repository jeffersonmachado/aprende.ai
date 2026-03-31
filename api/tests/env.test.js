import { jest } from '@jest/globals';

describe('config env', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    jest.unstable_mockModule('dotenv', () => ({
      default: {
        config: jest.fn()
      }
    }));
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('usa valores padrão quando variáveis não estão definidas', async () => {
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    delete process.env.JWT_SECRET;
    delete process.env.CORS_ORIGIN;
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;
    delete process.env.DB_LOGGING;

    const { env } = await import('../config/env.js');

    expect(env).toEqual({
      nodeEnv: 'development',
      port: 3015,
      jwtSecret: 'aprende_ai_dev_secret',
      corsOrigin: 'http://localhost:5174',
      db: {
        host: 'localhost',
        port: 5432,
        name: 'aprende_ai',
        user: 'postgres',
        password: 'postgres',
        logging: false
      }
    });
  });

  test('respeita variáveis de ambiente customizadas', async () => {
    process.env.NODE_ENV = 'production';
    process.env.PORT = '4100';
    process.env.JWT_SECRET = 'segredo-real';
    process.env.CORS_ORIGIN = 'https://aprende.ai';
    process.env.DB_HOST = 'db.internal';
    process.env.DB_PORT = '6543';
    process.env.DB_NAME = 'aprende_custom';
    process.env.DB_USER = 'app_user';
    process.env.DB_PASSWORD = 'senha_segura';
    process.env.DB_LOGGING = 'true';

    const { env } = await import('../config/env.js');

    expect(env).toEqual({
      nodeEnv: 'production',
      port: 4100,
      jwtSecret: 'segredo-real',
      corsOrigin: 'https://aprende.ai',
      db: {
        host: 'db.internal',
        port: 6543,
        name: 'aprende_custom',
        user: 'app_user',
        password: 'senha_segura',
        logging: true
      }
    });
  });
});
