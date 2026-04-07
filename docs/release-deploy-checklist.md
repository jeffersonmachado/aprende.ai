# Release e Deploy Checklist

Data: 2026-04-02

Versao alvo do artefato: `2.1.0`
Commit curto esperado no manifesto atual: `56dea28`
Branch esperada no manifesto atual: `visual-guinada`
Estado esperado do worktree no manifesto atual: `dirty`
Status esperado de publicação no manifesto atual: `publishReady=false`
Arquivo esperado de notas no manifesto atual: `docs/release-notes.md`

## 1. Fechamento local
- Confirmar workspace verde com `npm run validate`.
- Confirmar smoke browser com `npm run test:e2e` quando a entrega exigir validação E2E explícita.
- Preferir o fluxo unificado `npm run release:artifact` para gerar e validar o pacote final.
- Para publicação estrita com árvore limpa, usar `npm run release:artifact:clean`.
- O modo `release:artifact:clean` deve abortar antes de gerar ZIP se o worktree estiver sujo.
- Se necessário executar de forma separada, usar `npm run zip` seguido de `npm run zip:verify`.
- Para verificação estrita isolada, usar `npm run zip:verify:clean`.
- Atualizar e conferir o índice consolidado de releases com `npm run release:index` quando precisar regenerar o histórico manualmente.
- Atualizar e conferir o changelog legível de releases com `npm run release:changelog` quando precisar regenerar o histórico textual.
- Revisar e manter as notas humanas por versão em `docs/release-notes.md`.
- Registrar o checksum SHA-256 emitido pelo próprio `npm run zip`.
- Confirmar a geração do arquivo acompanhante `*.zip.sha256` no diretório `dist/`.
- Confirmar a geração do manifesto acompanhante `*.zip.manifest.json` no diretório `dist/`.
- Confirmar a geração/atualização do índice `dist/releases.json`.
- Confirmar a geração/atualização do changelog `dist/releases.md`.
- Confirmar no manifesto se o release foi gerado com worktree limpo ou sujo (`gitDirty`).
- Confirmar no manifesto se o artefato está marcado como publicável (`publishReady`).
- Confirmar no manifesto e no changelog a presença do resumo de notas da release (`releaseNotesSummary`).
- Registrar o ZIP final entregue:
  - arquivo: `dist/aprende-ai-v2.1.0-20260402-173153.zip`
  - checksum file: `dist/aprende-ai-v2.1.0-20260402-173153.zip.sha256`
  - manifest file: `dist/aprende-ai-v2.1.0-20260402-173153.zip.manifest.json`
  - tamanho aproximado: `36 MB`
  - commit curto: `56dea28`
  - branch: `visual-guinada`
  - worktree: `dirty`
  - publishReady: `false`
  - releaseNotesFile: `docs/release-notes.md`
  - SHA-256: `d57b7036401753409d1a47da9c28e980801137804f1169476b6d8ccc72b1be0a`

## 2. Pré-requisitos de infraestrutura
- Host remoto acessível por SSH.
- `rsync` disponível na máquina local.
- `docker compose` ou `docker-compose` disponível no host remoto.
- Se autenticação for por senha, `sshpass` instalado localmente.
- PostgreSQL será provisionado pelo `docker-compose.prod.yml` no serviço `db`.

## 3. Variáveis e segredos
- Validar `.env` remoto em `${DEPLOY_DIR:-/opt/aprende-ai}`.
- Garantir troca de defaults inseguros antes de produção:
  - `JWT_SECRET`
  - `DB_PASSWORD`
  - `CORS_ORIGIN`
- Validar portas remotas esperadas:
  - `API_PORT` padrão: `3015`
  - `FRONTEND_PORT` padrão: `8088`
- Validar build args do frontend quando aplicável:
  - `VITE_API_BASE_URL`
  - `VITE_APP_BASE_PATH`
  - `VITE_TENANT_SLUG`

## 4. Deploy remoto padrão
- Script principal: `bash ./scripts/deploy.sh`
- Script expandido: `bash ./scripts/docker-deploy.sh --prod --build`
- Parâmetros suportados:
  - `--host`
  - `--user`
  - `--dir`
  - `--port`
  - `--key`
  - `--password`
  - `--api-only`
  - `--frontend-only`
  - `--no-build`
  - `--pull`

## 5. Exemplo de execução
```bash
bash ./scripts/docker-deploy.sh \
  --prod \
  --build \
  --host 10.10.2.30 \
  --user root \
  --dir /opt/aprende-ai
```

## 6. O que o script de deploy já faz
- Testa conectividade de rede com `ping` quando disponível.
- Testa conexão SSH.
- Cria o diretório remoto se necessário.
- Sincroniza arquivos com `rsync` excluindo `node_modules`, `.git`, builds locais e `.env` locais.
- Mantém `.env` remoto; se não existir, copia `.env.example` para `.env` como bootstrap.
- Resolve automaticamente se o host remoto usa `docker compose` ou `docker-compose`.
- Valida conflito nas portas publicadas antes de subir a stack.
- Executa `build` e `up -d` da stack de produção.

## 7. Verificações pós-deploy
- Validar status dos containers:
  - `docker compose -f docker-compose.prod.yml ps`
- Validar healthcheck da API:
  - `GET /health`
- Validar carregamento do frontend publicado.
- Validar login com tenant demo ou tenant de produção configurado.
- Validar fluxo mínimo:
  - autenticação
  - carregamento de `/journey`
  - carregamento de `/campaign`
  - carregamento de `/system/analytics/effectiveness` para perfil admin

## 8. Rollback operacional
- Reexecutar deploy do último commit/artefato estável conhecido.
- Se a falha estiver restrita a um serviço, usar deploy segmentado:
  - `--api-only`
  - `--frontend-only`
- Se necessário, subir sem rebuild para retorno rápido da stack já sincronizada:
  - `--no-build`

## 9. Checklist de aceite
- Build do frontend concluído.
- API validada com `17 suites / 84 testes`.
- Frontend validado com `23 suites / 64 testes`.
- Playwright validado com `14 cenários`.
- Relatório final atualizado.
- Artefato ZIP versionado e checksum registrado.