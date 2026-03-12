import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { tenantResolver } from './core/tenancy/tenantResolver.js';
import { authMiddleware } from './core/middleware/authMiddleware.js';
import { requireTenantUser } from './core/middleware/requireTenantUser.js';
import { errorHandler } from './core/middleware/errorHandler.js';
import { notFoundHandler } from './core/middleware/notFoundHandler.js';
import { registerModules } from './modules/index.js';

export function createApp() {
  const app = express();
  app.use(cors({ origin: env.corsOrigin }));
  app.use(express.json({ limit: '2mb' }));
  app.use((req, res, next) => {
    if (req.path === '/health') return next();
    if (req.path === '/auth/login' || req.path === '/api/auth/login') {
      return tenantResolver(req, res, next);
    }
    if (req.path === '/auth/me' || req.path === '/api/auth/me' || req.path.startsWith('/api')) {
      return tenantResolver(req, res, (err) => {
        if (err) return next(err);
        return authMiddleware(req, res, (authErr) => {
          if (authErr) return next(authErr);
          return requireTenantUser(req, res, next);
        });
      });
    }
    return next();
  });
  registerModules(app);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
