#!/bin/sh
set -e

echo "Rodando migrations..."
npm run db:migrate

echo "Iniciando servidor..."
exec node server.js
