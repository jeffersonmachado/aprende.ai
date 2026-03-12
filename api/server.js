import { createApp } from './app.js';
import { env } from './config/env.js';
import { sequelize } from './db/models/index.js';
import { logger } from './core/logging/logger.js';

const app = createApp();

async function start() {
  try {
    await sequelize.authenticate();
    logger.info('Banco de dados conectado com sucesso');
    app.listen(env.port, () => logger.info(`Servidor iniciado na porta ${env.port}`));
  } catch (error) {
    logger.error('Falha ao iniciar servidor', error);
    process.exit(1);
  }
}

start();
