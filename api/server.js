import { createApp } from './app.js';
import { env } from './config/env.js';
import { sequelize } from './db/models/index.js';
import { checkPendingMigrations } from './db/migrationHealth.js';
import { logger } from './core/logging/logger.js';

const app = createApp();

function listenWithPortFallback(startPort, attempts = 10) {
  return new Promise((resolve, reject) => {
    let currentPort = startPort;
    let remainingAttempts = attempts;

    function tryListen() {
      const server = app.listen(currentPort, () => {
        logger.info(`Servidor iniciado na porta ${currentPort}`);
        resolve(server);
      });

      server.on('error', (error) => {
        if (error?.code === 'EADDRINUSE' && remainingAttempts > 1) {
          logger.warn(`Porta ${currentPort} em uso, tentando porta ${currentPort + 1}`);
          remainingAttempts -= 1;
          currentPort += 1;
          setTimeout(tryListen, 0);
          return;
        }

        reject(error);
      });
    }

    tryListen();
  });
}

async function start() {
  try {
    await sequelize.authenticate();
    logger.info('Banco de dados conectado com sucesso');
    await checkPendingMigrations({ strict: env.migrationsStrict });
    await listenWithPortFallback(env.port);
  } catch (error) {
    logger.error('Falha ao iniciar servidor', error);
    process.exit(1);
  }
}

start();
