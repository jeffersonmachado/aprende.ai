#!/usr/bin/env bash

set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

error() { echo -e "${RED}[ERROR]${NC} $1" >&2; }
info() { echo -e "${GREEN}[INFO]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DIST_DIR="$PROJECT_DIR/dist"

usage() {
  cat <<'EOF'
Uso: ./scripts/verify-artifact.sh [--require-clean] [ARQUIVO.zip|ARQUIVO.zip.sha256]

Sem argumento, valida automaticamente o ZIP mais recente encontrado em ./dist.
EOF
}

REQUIRE_CLEAN=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --require-clean)
      REQUIRE_CLEAN=true
      shift
      ;;
    --help|-h)
      usage
      exit 0
      ;;
    *)
      break
      ;;
  esac
done

resolve_sha_file() {
  local input="${1:-}"

  if [[ -z "$input" ]]; then
    local latest_zip
    latest_zip="$(ls -1t "$DIST_DIR"/*.zip 2>/dev/null | head -n 1 || true)"
    if [[ -z "$latest_zip" ]]; then
      error "Nenhum arquivo ZIP encontrado em $DIST_DIR"
      exit 1
    fi
    printf '%s.sha256\n' "$latest_zip"
    return
  fi

  if [[ "$input" == *.sha256 ]]; then
    printf '%s\n' "$input"
    return
  fi

  if [[ "$input" == *.zip ]]; then
    printf '%s.sha256\n' "$input"
    return
  fi

  error "Argumento inválido: $input"
  usage
  exit 1
}

SHA_FILE="$(resolve_sha_file "${1:-}")"
ZIP_FILE="${SHA_FILE%.sha256}"
MANIFEST_FILE="${ZIP_FILE}.manifest.json"

if [[ ! -f "$ZIP_FILE" ]]; then
  error "ZIP não encontrado: $ZIP_FILE"
  exit 1
fi

if [[ ! -f "$SHA_FILE" ]]; then
  error "Arquivo de checksum não encontrado: $SHA_FILE"
  exit 1
fi

if command -v sha256sum >/dev/null 2>&1; then
  (cd "$(dirname "$SHA_FILE")" && sha256sum -c "$(basename "$SHA_FILE")")
elif command -v shasum >/dev/null 2>&1; then
  (cd "$(dirname "$SHA_FILE")" && shasum -a 256 -c "$(basename "$SHA_FILE")")
else
  error "Nem sha256sum nem shasum estão disponíveis para validar o artefato"
  exit 1
fi

if [[ -f "$MANIFEST_FILE" ]]; then
  node - <<'EOF' "$ZIP_FILE" "$SHA_FILE" "$MANIFEST_FILE"
const fs = require('fs');
const path = require('path');

const [zipFile, shaFile, manifestFile] = process.argv.slice(2);
const manifest = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
const shaLine = fs.readFileSync(shaFile, 'utf8').trim();
const [shaFromFile] = shaLine.split(/\s+/);
const expectedProject = 'aprende-ai';

if (manifest.artifact !== path.basename(zipFile)) {
  console.error(`Manifest artifact mismatch: ${manifest.artifact} != ${path.basename(zipFile)}`);
  process.exit(1);
}

if (manifest.project !== expectedProject) {
  console.error(`Manifest project mismatch: ${manifest.project} != ${expectedProject}`);
  process.exit(1);
}

if (!manifest.version) {
  console.error('Manifest version missing');
  process.exit(1);
}

if (typeof manifest.gitCommit !== 'string') {
  console.error('Manifest gitCommit missing');
  process.exit(1);
}

if (manifest.gitCommit && !/^[0-9a-f]+$/i.test(manifest.gitCommit)) {
  console.error(`Manifest gitCommit invalid: ${manifest.gitCommit}`);
  process.exit(1);
}

if (typeof manifest.gitBranch !== 'string') {
  console.error('Manifest gitBranch missing');
  process.exit(1);
}

if (typeof manifest.gitDirty !== 'boolean') {
  console.error('Manifest gitDirty missing or invalid');
  process.exit(1);
}

if (typeof manifest.publishReady !== 'boolean') {
  console.error('Manifest publishReady missing or invalid');
  process.exit(1);
}

if (typeof manifest.releaseNotesFile !== 'string') {
  console.error('Manifest releaseNotesFile missing');
  process.exit(1);
}

if (typeof manifest.releaseNotesSummary !== 'string') {
  console.error('Manifest releaseNotesSummary missing or invalid');
  process.exit(1);
}

if (!Array.isArray(manifest.releaseNotesItems)) {
  console.error('Manifest releaseNotesItems missing or invalid');
  process.exit(1);
}

if (manifest.checksumFile !== path.basename(shaFile)) {
  console.error(`Manifest checksumFile mismatch: ${manifest.checksumFile} != ${path.basename(shaFile)}`);
  process.exit(1);
}

if (manifest.sha256 !== shaFromFile) {
  console.error(`Manifest sha256 mismatch: ${manifest.sha256} != ${shaFromFile}`);
  process.exit(1);
}

console.log(`Manifest OK: ${path.basename(manifestFile)}`);
EOF
else
  warn "Manifesto não encontrado: $MANIFEST_FILE"
fi

if [[ -f "$MANIFEST_FILE" ]]; then
  MANIFEST_GIT_DIRTY="$(node - <<'EOF' "$MANIFEST_FILE"
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
process.stdout.write(String(manifest.gitDirty));
EOF
)"
  MANIFEST_PUBLISH_READY="$(node - <<'EOF' "$MANIFEST_FILE"
const fs = require('fs');
const manifest = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
process.stdout.write(String(manifest.publishReady));
EOF
)"

  if [[ "$MANIFEST_GIT_DIRTY" == "true" ]]; then
    warn "Artefato gerado com worktree sujo"
  fi

  if [[ "$MANIFEST_PUBLISH_READY" != "true" ]]; then
    warn "Artefato marcado como não publicável (publishReady=false)"
  fi

  if [[ "$REQUIRE_CLEAN" == true && "$MANIFEST_GIT_DIRTY" == "true" ]]; then
    error "Verificação estrita falhou: o artefato foi gerado com worktree sujo"
    exit 1
  fi
fi

info "Artefato validado com sucesso"
info "ZIP: $ZIP_FILE"
info "SHA: $SHA_FILE"
if [[ -f "$MANIFEST_FILE" ]]; then
  info "Manifesto: $MANIFEST_FILE"
fi