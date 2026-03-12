#!/bin/sh
set -e

echo "Rodando migrations..."
./node_modules/.bin/sequelize-cli db:migrate

echo "Iniciando servidor..."
exec node server.js
