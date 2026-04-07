#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REQUIRE_CLEAN=false

while [[ $# -gt 0 ]]; do
	case "$1" in
		--require-clean)
			REQUIRE_CLEAN=true
			shift
			;;
		--help|-h)
			echo "Uso: ./scripts/release-artifact.sh [--require-clean]"
			exit 0
			;;
		*)
			echo "Argumento inválido: $1" >&2
			exit 1
			;;
	esac
done

cd "$PROJECT_DIR"

if [[ "$REQUIRE_CLEAN" == true ]]; then
	if [[ -n "$(git -C "$PROJECT_DIR" status --short 2>/dev/null || true)" ]]; then
		echo "[release] abortado: worktree sujo; nenhum artefato foi gerado" >&2
		exit 1
	fi
	if [[ -z "$(git -C "$PROJECT_DIR" rev-parse --short HEAD 2>/dev/null || true)" ]]; then
		echo "[release] abortado: commit git indisponível; nenhum artefato foi gerado" >&2
		exit 1
	fi
fi

echo "[release] gerando artefato..."
bash ./scripts/generate-zip.sh

echo "[release] verificando artefato mais recente..."
if [[ "$REQUIRE_CLEAN" == true ]]; then
	bash ./scripts/verify-artifact.sh --require-clean
else
	bash ./scripts/verify-artifact.sh
fi

echo "[release] atualizando indice de releases..."
bash ./scripts/update-release-index.sh

echo "[release] atualizando changelog de releases..."
bash ./scripts/update-release-changelog.sh

LATEST_ZIP="$(ls -1t dist/*.zip | head -n 1)"
echo "[release] artefato pronto: $LATEST_ZIP"
echo "[release] checksum: ${LATEST_ZIP}.sha256"
echo "[release] manifesto: ${LATEST_ZIP}.manifest.json"
echo "[release] indice: dist/releases.json"
echo "[release] changelog: dist/releases.md"