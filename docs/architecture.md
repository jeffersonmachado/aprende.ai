# Arquitetura do aprende-ai v2

## Objetivo
Manter o **aprende.AI** como projeto próprio, com domínio educacional isolado, mas preparado para integração com o **r-agent2** por APIs e eventos.

## Princípios
- separação de domínio
- multi-tenant desde o início
- baixo acoplamento com r-agent2
- mesma linha de stack e organização técnica
- expansão futura para IA, RAG e simulações

## Backend-first runtime da jornada
- `journey-flow` continua como agregador de runtime e analytics pedagógicos.
- `journey-engine` atua como orquestrador transacional do loop de campanha.
- Estado oficial da campanha permanece no backend e é persistido em `JourneyState.stateJson`.
- Frontend não decide fase, score, reward ou world state: apenas renderiza e envia intenções.

## Módulos centrais da campanha
- `api/modules/journey-flow`
	- runtime consolidado, campanha, plot twists e analytics de efetividade
- `api/modules/journey-engine`
	- start de fase, decisão, consequence, twist, reflexão, finalize, progress e dashboard de competências
- `api/modules/competency`
	- motor único de score e evolução das competências
- `api/modules/assessment`
	- avaliação conectada ao mesmo motor de competências
- `api/modules/gamification`
	- eventos de XP e badges

## Contrato operacional da campanha
Cada capítulo usa sete fases explícitas:

1. `briefing`
2. `mission`
3. `consequence`
4. `plot-twist`
5. `reflection`
6. `phase-result`
7. `progression`

Esse contrato alimenta tanto as rotas backend quanto as telas dedicadas do frontend.

## Referências
- Ver [docs/journey-experience-runtime.md](/opt/results/ria/aprende-ai/docs/journey-experience-runtime.md) para o snapshot consolidado da experiência.
- Ver [docs/journey-engine-runtime.md](/opt/results/ria/aprende-ai/docs/journey-engine-runtime.md) para o contrato operacional do engine da campanha.
