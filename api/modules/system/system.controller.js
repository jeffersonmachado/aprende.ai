import { getTenantOpenAIConfig, saveTenantOpenAIKey } from '../../services/tenantOpenAI.service.js';
import { env } from '../../config/env.js';
import { sequelize } from '../../db/models/index.js';
import { getMigrationStatus } from '../../db/migrationHealth.js';

export async function getHealth(_req, res) {
  try {
    await sequelize.authenticate();
    const migrationStatus = await getMigrationStatus();
    const status = migrationStatus.hasPending ? 'degraded' : 'ok';

    return res.status(200).json({
      name: 'aprende-ai-api',
      version: '0.2.0',
      status,
      database: 'ok',
      migrations: {
        strictMode: env.migrationsStrict,
        hasPending: migrationStatus.hasPending,
        pendingCount: migrationStatus.pendingCount,
        pending: migrationStatus.pending,
        localCount: migrationStatus.localCount,
        appliedCount: migrationStatus.appliedCount
      }
    });
  } catch (error) {
    return res.status(503).json({
      name: 'aprende-ai-api',
      version: '0.2.0',
      status: 'down',
      database: 'error',
      error: error?.message || 'Falha ao verificar saude da aplicacao'
    });
  }
}

export async function getOpenAISettings(req, res) {
  const config = await getTenantOpenAIConfig(req.tenant.id);
  res.json(config);
}

export async function updateOpenAISettings(req, res) {
  const token = req.body?.token;
  const config = await saveTenantOpenAIKey(req.tenant.id, token);
  res.json({
    success: true,
    ...config
  });
}
