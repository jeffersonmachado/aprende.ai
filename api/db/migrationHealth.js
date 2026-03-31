import { readdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { sequelize } from './models/index.js';
import { logger } from '../core/logging/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const migrationsDir = resolve(__dirname, 'migrations');

async function listMigrationFiles() {
  const entries = await readdir(migrationsDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith('.cjs'))
    .map((entry) => entry.name)
    .sort();
}

async function listAppliedMigrations() {
  try {
    const [rows] = await sequelize.query('SELECT name FROM "SequelizeMeta" ORDER BY name ASC');
    return rows.map((row) => row.name);
  } catch (error) {
    if (/SequelizeMeta/i.test(String(error?.message || ''))) {
      return [];
    }
    throw error;
  }
}

export async function getMigrationStatus() {
  const [localMigrations, appliedMigrations] = await Promise.all([
    listMigrationFiles(),
    listAppliedMigrations()
  ]);

  const appliedSet = new Set(appliedMigrations);
  const pending = localMigrations.filter((name) => !appliedSet.has(name));

  return {
    hasPending: pending.length > 0,
    pending,
    pendingCount: pending.length,
    localCount: localMigrations.length,
    appliedCount: appliedMigrations.length
  };
}

export async function checkPendingMigrations({ strict = false } = {}) {
  const status = await getMigrationStatus();
  const { pending } = status;

  if (!pending.length) {
    logger.info('Schema de banco atualizado: nenhuma migration pendente');
    return { hasPending: false, pending: [] };
  }

  logger.warn(`Foram encontradas ${pending.length} migration(s) pendente(s)`);
  logger.warn(`Execute: npm --prefix api run db:migrate`);
  for (const migrationName of pending.slice(0, 10)) {
    logger.warn(`- ${migrationName}`);
  }
  if (pending.length > 10) {
    logger.warn(`... e mais ${pending.length - 10} migration(s)`);
  }

  if (strict) {
    throw new Error('Startup bloqueado: existem migrations pendentes. Execute "npm --prefix api run db:migrate".');
  }

  return { hasPending: true, pending };
}
