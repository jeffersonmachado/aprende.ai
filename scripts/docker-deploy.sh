#!/usr/bin/env bash
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
section() { echo -e "\n${BLUE}=== $1 ===${NC}\n"; }

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

MODE="prod"
BUILD=true
PULL=false
BUILD_SERVICE=""
COMPOSE_FILE="docker-compose.prod.yml"

REMOTE_HOST="${DEPLOY_HOST:-10.10.2.30}"
REMOTE_USER="${DEPLOY_USER:-root}"
REMOTE_DIR="${DEPLOY_DIR:-/opt/aprende-ai}"
SSH_PORT="${SSH_PORT:-22}"
SSH_KEY="${SSH_KEY:-$HOME/.ssh/id_rsa}"
SSH_PASSWORD="${SSH_PASS:-${SSH_PASSWORD:-${DEPLOY_PASSWORD:-${SSHPASS:-${ssh_pass:-resu100gabao}}}}}"

usage() {
  cat <<EOF
Uso: $0 [--prod|--dev] [--build|--no-build] [--pull] [--frontend-only] [--api-only] [--host HOST] [--user USER] [--dir DIR] [--port PORT] [--key PATH] [--password PASS]

Exemplos:
  $0 --prod --build --host 10.10.2.30 --user root --dir /opt/aprende-ai
  $0 --prod --build --host 10.10.2.30 --user root --password 'sua_senha'
  DEPLOY_HOST=10.10.2.30 DEPLOY_USER=root DEPLOY_DIR=/opt/aprende-ai $0 --prod --no-build
  SSH_PASS='sua_senha' $0 --prod --build
  # Defaults sem flags: host=10.10.2.30, user=root, dir=/opt/aprende-ai
  # senha padrão: resu100gabao
  $0 --prod --build
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --prod)
      MODE="prod"
      COMPOSE_FILE="docker-compose.prod.yml"
      shift
      ;;
    --dev)
      MODE="dev"
      COMPOSE_FILE="docker-compose.yml"
      shift
      ;;
    --build)
      BUILD=true
      shift
      ;;
    --no-build)
      BUILD=false
      shift
      ;;
    --pull)
      PULL=true
      shift
      ;;
    --frontend-only)
      BUILD_SERVICE="frontend"
      shift
      ;;
    --api-only)
      BUILD_SERVICE="api"
      shift
      ;;
    --host)
      REMOTE_HOST="$2"
      shift 2
      ;;
    --user)
      REMOTE_USER="$2"
      shift 2
      ;;
    --dir)
      REMOTE_DIR="$2"
      shift 2
      ;;
    --port)
      SSH_PORT="$2"
      shift 2
      ;;
    --key)
      SSH_KEY="$2"
      shift 2
      ;;
    --password)
      SSH_PASSWORD="$2"
      shift 2
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      error "Argumento desconhecido: $1"
      usage
      exit 1
      ;;
  esac
done

if [[ -z "$REMOTE_HOST" ]]; then
  error "Host remoto não informado. Use --host ou DEPLOY_HOST."
  usage
  exit 1
fi

if [[ -z "$SSH_PASSWORD" && ! -f "$SSH_KEY" ]]; then
  error "Chave SSH não encontrada: $SSH_KEY"
  error "Informe --password/SSH_PASS ou configure uma chave SSH válida"
  exit 1
fi

if [[ -n "$SSH_PASSWORD" ]] && ! command -v sshpass >/dev/null 2>&1; then
  error "sshpass não está instalado e é necessário para autenticação por senha"
  error "Instale com: sudo apt-get install -y sshpass"
  exit 1
fi

if ! command -v rsync >/dev/null 2>&1; then
  error "rsync não está instalado localmente"
  exit 1
fi

SSH_OPTS="-o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null -o ConnectTimeout=30 -o ServerAliveInterval=30 -o ServerAliveCountMax=20"
if [[ -n "$SSH_PASSWORD" ]]; then
  export SSHPASS="$SSH_PASSWORD"
  SSH_CMD="sshpass -e ssh -p $SSH_PORT $SSH_OPTS"
  RSYNC_SSH_CMD="sshpass -e ssh -p $SSH_PORT $SSH_OPTS"
  AUTH_METHOD="senha (sshpass)"
else
  SSH_CMD="ssh -i $SSH_KEY -p $SSH_PORT $SSH_OPTS"
  RSYNC_SSH_CMD="ssh -i $SSH_KEY -p $SSH_PORT $SSH_OPTS"
  AUTH_METHOD="chave ($SSH_KEY)"
fi

section "Deploy aprende-ai - Modo: $MODE"
info "Host: $REMOTE_HOST"
info "User: $REMOTE_USER"
info "Diretório remoto: $REMOTE_DIR"
info "Autenticação SSH: $AUTH_METHOD"
info "Build: $BUILD"
info "Serviço de build: ${BUILD_SERVICE:-todos}"
info "Compose: $COMPOSE_FILE"

section "Testando conectividade de rede"
if command -v ping >/dev/null 2>&1; then
  info "Executando ping em $REMOTE_HOST"
  if ping -c 1 -W 2 "$REMOTE_HOST" >/dev/null 2>&1; then
    info "Ping OK"
  else
    error "Ping falhou para $REMOTE_HOST"
    error "Verifique se o servidor está online e acessível na rede"
    exit 1
  fi
else
  warn "Comando ping não encontrado localmente; pulando teste de rede"
fi

section "Testando conexão SSH"
$SSH_CMD "$REMOTE_USER@$REMOTE_HOST" "echo 'Conexão OK'" >/dev/null
info "Conexão SSH estabelecida"

section "Preparando diretório remoto"
$SSH_CMD "$REMOTE_USER@$REMOTE_HOST" "mkdir -p '$REMOTE_DIR'"

section "Sincronizando arquivos"
rsync -az --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'frontend/dist' \
  --exclude 'api/node_modules' \
  --exclude 'frontend/node_modules' \
  --exclude '.env' \
  --exclude 'api/.env' \
  -e "$RSYNC_SSH_CMD" \
  "$PROJECT_ROOT/" "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/"
info "Arquivos sincronizados"

section "Verificando .env remoto"
if ! $SSH_CMD "$REMOTE_USER@$REMOTE_HOST" "test -f '$REMOTE_DIR/.env'"; then
  warn ".env não encontrado, copiando .env.example para .env"
  $SSH_CMD "$REMOTE_USER@$REMOTE_HOST" "cd '$REMOTE_DIR' && cp -n .env.example .env"
  warn "Revise o .env remoto com valores de produção após este deploy"
fi

section "Selecionando docker compose remoto"
REMOTE_COMPOSE_BIN="$($SSH_CMD "$REMOTE_USER@$REMOTE_HOST" "if command -v docker-compose >/dev/null 2>&1; then echo docker-compose; else echo 'docker compose'; fi")"
info "Compose remoto: $REMOTE_COMPOSE_BIN"

section "Validando portas remotas (fixas)"
PORT_RESOLVE_OUTPUT="$($SSH_CMD "$REMOTE_USER@$REMOTE_HOST" "REMOTE_DIR='$REMOTE_DIR' bash -s" <<'EOF'
set -e

cd "$REMOTE_DIR"
PROJECT_NAME="$(basename "$REMOTE_DIR")"

get_env_val() {
  local key="$1"
  local line
  line="$(grep -E "^${key}=" .env 2>/dev/null | tail -n 1 || true)"
  if [ -z "$line" ]; then
    return 0
  fi
  printf '%s' "${line#*=}" | tr -d '\r\n'
}

docker_users_for_port() {
  local port="$1"
  docker ps --filter publish="$port" --format '{{.Names}}'
}

port_used_by_other_stack() {
  local port="$1"
  local names
  names="$(docker_users_for_port "$port" | grep -v "^${PROJECT_NAME}-" || true)"
  if [ -n "$names" ]; then
    echo "$names"
    return 0
  fi
  return 1
}

API_PORT_VAL="$(get_env_val API_PORT)"
FRONTEND_PORT_VAL="$(get_env_val FRONTEND_PORT)"
API_PORT_VAL="${API_PORT_VAL:-3015}"
FRONTEND_PORT_VAL="${FRONTEND_PORT_VAL:-8088}"

if API_CONFLICTS="$(port_used_by_other_stack "$API_PORT_VAL")"; then
  echo "ERROR: API_PORT_CONFLICT=${API_PORT_VAL}"
  echo "ERROR: Containers conflitantes: ${API_CONFLICTS}"
  echo "ERROR: Libere a porta ${API_PORT_VAL} no host remoto ou ajuste API_PORT com cautela."
  exit 12
fi

if FRONTEND_CONFLICTS="$(port_used_by_other_stack "$FRONTEND_PORT_VAL")"; then
  echo "ERROR: FRONTEND_PORT_CONFLICT=${FRONTEND_PORT_VAL}"
  echo "ERROR: Containers conflitantes: ${FRONTEND_CONFLICTS}"
  echo "ERROR: FRONTEND_PORT precisa permanecer fixa para o Apache. Libere a porta ${FRONTEND_PORT_VAL}."
  exit 13
fi

echo "INFO: API_PORT=${API_PORT_VAL}"
echo "INFO: FRONTEND_PORT=${FRONTEND_PORT_VAL}"
EOF
)"

echo "$PORT_RESOLVE_OUTPUT"
if echo "$PORT_RESOLVE_OUTPUT" | grep -q "^ERROR:"; then
  error "Falha ao resolver portas remotas"
  exit 1
fi

section "Deploy remoto"
if [[ "$PULL" == "true" ]]; then
  $SSH_CMD "$REMOTE_USER@$REMOTE_HOST" "cd '$REMOTE_DIR' && $REMOTE_COMPOSE_BIN -f '$COMPOSE_FILE' pull --ignore-pull-failures || true"
fi

if [[ "$BUILD" == "true" ]]; then
  if [[ -n "$BUILD_SERVICE" ]]; then
    $SSH_CMD "$REMOTE_USER@$REMOTE_HOST" "cd '$REMOTE_DIR' && $REMOTE_COMPOSE_BIN -f '$COMPOSE_FILE' build --pull '$BUILD_SERVICE'"
  else
    $SSH_CMD "$REMOTE_USER@$REMOTE_HOST" "cd '$REMOTE_DIR' && $REMOTE_COMPOSE_BIN -f '$COMPOSE_FILE' build --pull"
  fi
fi

if [[ -n "$BUILD_SERVICE" ]]; then
  $SSH_CMD "$REMOTE_USER@$REMOTE_HOST" "cd '$REMOTE_DIR' && $REMOTE_COMPOSE_BIN -f '$COMPOSE_FILE' up -d '$BUILD_SERVICE'"
else
  $SSH_CMD "$REMOTE_USER@$REMOTE_HOST" "cd '$REMOTE_DIR' && $REMOTE_COMPOSE_BIN -f '$COMPOSE_FILE' up -d --remove-orphans"
fi

section "Status"
$SSH_CMD "$REMOTE_USER@$REMOTE_HOST" "cd '$REMOTE_DIR' && $REMOTE_COMPOSE_BIN -f '$COMPOSE_FILE' ps"

info "Deploy remoto concluído com sucesso"
