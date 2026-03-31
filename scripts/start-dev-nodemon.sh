#!/usr/bin/env bash

set -u

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
API_PORT="${API_PORT:-${PORT:-3015}}"
FRONTEND_PORT="${FRONTEND_PORT:-5176}"
VITE_API_BASE="${VITE_API_BASE:-http://localhost:${API_PORT}/api}"

API_PID=""
FRONTEND_PID=""
API_STARTED=false
FRONTEND_STARTED=false

echo -e "${BLUE}Iniciando servidores de desenvolvimento (nodemon + Vite)...${NC}"

check_port() {
  local port="$1"

  if command -v lsof >/dev/null 2>&1 && lsof -Pi :"$port" -sTCP:LISTEN -t >/dev/null 2>&1; then
    return 0
  fi

  if command -v fuser >/dev/null 2>&1 && fuser "$port"/tcp >/dev/null 2>&1; then
    return 0
  fi

  if command -v ss >/dev/null 2>&1 && ss -tln 2>/dev/null | grep -q ":$port "; then
    return 0
  fi

  return 1
}

get_port_pid() {
  local port="$1"
  local pid=""

  if command -v lsof >/dev/null 2>&1; then
    pid="$(lsof -ti :"$port" 2>/dev/null | head -1)"
  fi

  if [ -z "$pid" ] && command -v fuser >/dev/null 2>&1; then
    pid="$(fuser "$port"/tcp 2>/dev/null | awk '{print $1}' | head -1)"
  fi

  if [ -z "$pid" ] && command -v ss >/dev/null 2>&1; then
    pid="$(ss -tlnp 2>/dev/null | grep ":$port " | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | head -1)"
  fi

  printf '%s' "$pid"
}

kill_processes_by_pattern() {
  local pattern="$1"
  local description="$2"
  local pids

  pids="$(ps aux | grep -E "$pattern" | grep "$PROJECT_ROOT" | grep -v grep | awk '{print $2}' | sort -u)"

  if [ -n "$pids" ]; then
    echo -e "${BLUE}  Encontrados processos ${description}:${NC}"
    ps aux | grep -E "$pattern" | grep "$PROJECT_ROOT" | grep -v grep | awk '{print "    PID", $2, "-", $11, $12, $13, $14, $15}'
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi
}

kill_port_if_busy() {
  local port="$1"
  local service_name="$2"

  if ! check_port "$port"; then
    echo -e "${GREEN}Porta ${port} (${service_name}) está livre${NC}"
    return 0
  fi

  echo -e "${YELLOW}Porta ${port} (${service_name}) está em uso.${NC}"
  echo -e "${BLUE}Processos usando a porta ${port}:${NC}"
  if command -v lsof >/dev/null 2>&1; then
    lsof -i :"$port" 2>/dev/null | head -10 || true
  fi

  local pids
  pids="$(lsof -ti :"$port" 2>/dev/null | sort -u)"

  if [ -z "$pids" ] && command -v fuser >/dev/null 2>&1; then
    pids="$(fuser "$port"/tcp 2>/dev/null | tr ' ' '\n' | grep -E '^[0-9]+$' | sort -u)"
  fi

  if [ -n "$pids" ]; then
    echo -e "${YELLOW}Matando processos...${NC}"
    echo -e "${BLUE}  Matando PIDs: $(echo "$pids" | tr '\n' ' ')${NC}"
    echo "$pids" | xargs kill -9 2>/dev/null || true
    sleep 1
  fi

  if check_port "$port"; then
    echo -e "${RED}Erro: não foi possível liberar a porta ${port}${NC}"
    return 1
  fi

  echo -e "${GREEN}✅ Porta ${port} liberada${NC}"
}

kill_project_processes() {
  echo -e "${YELLOW}Matando processos relacionados ao projeto...${NC}"
  kill_processes_by_pattern 'nodemon.*server\.js|node.*server\.js' 'da API'
  kill_processes_by_pattern 'vite|npm.*run dev|npm.*vite' 'do frontend'
}

cleanup() {
  echo -e "\n${BLUE}Parando servidores...${NC}"

  if [ "$FRONTEND_STARTED" = true ] && [ -n "$FRONTEND_PID" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi

  if [ "$API_STARTED" = true ] && [ -n "$API_PID" ]; then
    kill "$API_PID" 2>/dev/null || true
  fi
}

trap cleanup INT TERM EXIT

kill_project_processes

kill_port_if_busy "$API_PORT" "API" || exit 1
kill_port_if_busy "$FRONTEND_PORT" "Frontend" || exit 1

echo -e "${GREEN}Aplicando migrations da API...${NC}"
(
  cd "$PROJECT_ROOT/api" && npm run db:migrate
) || {
  echo -e "${RED}Erro ao aplicar migrations${NC}"
  exit 1
}

echo -e "${GREEN}Garantindo seed de acesso demo...${NC}"
(
  cd "$PROJECT_ROOT/api" && npm run db:seed
) || {
  echo -e "${RED}Erro ao garantir seed demo${NC}"
  exit 1
}

echo -e "${GREEN}Iniciando API com nodemon na porta ${API_PORT}...${NC}"
(
  cd "$PROJECT_ROOT/api" && PORT="$API_PORT" npm run dev
) &
API_PID=$!
API_STARTED=true
sleep 2

if ! kill -0 "$API_PID" 2>/dev/null; then
  echo -e "${RED}Erro: API não iniciou corretamente${NC}"
  exit 1
fi

echo -e "${GREEN}Iniciando frontend Vite na porta ${FRONTEND_PORT}...${NC}"
(
  cd "$PROJECT_ROOT/frontend" && VITE_API_BASE="$VITE_API_BASE" npm run dev -- --port "$FRONTEND_PORT" --strictPort
) &
FRONTEND_PID=$!
FRONTEND_STARTED=true
sleep 2

if ! kill -0 "$FRONTEND_PID" 2>/dev/null; then
  echo -e "${RED}Erro: frontend não iniciou corretamente${NC}"
  exit 1
fi

echo -e "${GREEN}Ambiente de desenvolvimento iniciado.${NC}"
echo -e "${BLUE}API:${NC} http://localhost:${API_PORT}"
echo -e "${BLUE}Frontend:${NC} http://localhost:${FRONTEND_PORT}"
echo -e "${YELLOW}Pressione Ctrl+C para parar os processos iniciados por este script.${NC}"

wait