#!/usr/bin/env bash
set -euo pipefail

# Compatibilidade com o fluxo antigo:
# ./scripts/deploy.sh [HOST] [USER] [REMOTE_DIR]

HOST="${1:-${DEPLOY_HOST:-10.10.2.30}}"
USER_NAME="${2:-${DEPLOY_USER:-root}}"
DIR_NAME="${3:-${DEPLOY_DIR:-/opt/aprende-ai}}"

ARGS=(--prod --build)
if [[ -n "$HOST" ]]; then
  ARGS+=(--host "$HOST")
fi
if [[ -n "$USER_NAME" ]]; then
  ARGS+=(--user "$USER_NAME")
fi
if [[ -n "$DIR_NAME" ]]; then
  ARGS+=(--dir "$DIR_NAME")
fi

exec "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/docker-deploy.sh" "${ARGS[@]}"
