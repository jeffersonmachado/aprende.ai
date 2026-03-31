import express from 'express';
import { jest } from '@jest/globals';

function defaultMigrationStatus() {
  return {
    hasPending: false,
    pendingCount: 0,
    pending: [],
    localCount: 0,
    appliedCount: 0
  };
}

function setupHealthModuleMocks({
  migrationsStrict = false,
  migrationStatus = defaultMigrationStatus(),
  authenticateError = null
} = {}) {
  jest.resetModules();

  const authenticateMock = authenticateError
    ? jest.fn().mockRejectedValue(authenticateError)
    : jest.fn().mockResolvedValue(undefined);

  const migrationStatusMock = jest.fn().mockResolvedValue(migrationStatus);

  jest.unstable_mockModule('../../config/env.js', () => ({
    env: {
      migrationsStrict
    }
  }));

  jest.unstable_mockModule('../../db/models/index.js', () => ({
    sequelize: {
      authenticate: authenticateMock
    }
  }));

  jest.unstable_mockModule('../../db/migrationHealth.js', () => ({
    getMigrationStatus: migrationStatusMock
  }));

  jest.unstable_mockModule('../../services/tenantOpenAI.service.js', () => ({
    getTenantOpenAIConfig: jest.fn(),
    saveTenantOpenAIKey: jest.fn()
  }));

  return {
    authenticateMock,
    migrationStatusMock
  };
}

export function buildResponse() {
  const res = {
    status: jest.fn(),
    json: jest.fn()
  };
  res.status.mockReturnValue(res);
  return res;
}

export function buildApp() {
  const app = express();
  app.use(express.json());
  return app;
}

export async function loadHealthController(options = {}) {
  const mocks = setupHealthModuleMocks(options);
  const module = await import('../../modules/system/system.controller.js');
  return {
    ...mocks,
    getHealth: module.getHealth
  };
}

export async function loadSystemRoutes(options = {}) {
  const mocks = setupHealthModuleMocks(options);
  const module = await import('../../modules/system/system.routes.js');
  return {
    ...mocks,
    router: module.default
  };
}
