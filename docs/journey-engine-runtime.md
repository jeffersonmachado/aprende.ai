# Journey Engine Runtime

## Objetivo
Consolidar o loop oficial da campanha como um motor backend-first, com estado persistido, world state acumulado, fases explícitas e contrato único para frontend e analytics.

## Papel arquitetural
- `journey-runtime`: snapshot pedagógico amplo da experiência do aluno, incluindo missão ativa, mapa, mentor, competências e analytics de efetividade.
- `journey-engine`: orquestração transacional da campanha em fases explícitas, com persistência do world state, decisão, consequência, twist, reflexão, resultado e progressão.

Os dois módulos coexistem por design:
- `journey-runtime` continua sendo a base de leitura consolidada.
- `journey-engine` adiciona autoridade operacional sobre o ciclo da fase.

## Fonte de verdade
- Persistência principal: `JourneyState.stateJson`
- Escopo: `tenantId` + `userId`
- Autoridade do estado:
  - backend decide fase ativa
  - backend calcula world delta
  - backend registra twist, recompensa, competência e auditoria
  - frontend renderiza e envia intenções

## Sequência oficial de fases
O contrato atual da campanha trabalha com sete fases explícitas por capítulo:

1. `briefing`
2. `mission`
3. `consequence`
4. `plot-twist`
5. `reflection`
6. `phase-result`
7. `progression`

No frontend, o mapeamento visual correspondente é:

1. `briefing` -> `briefing`
2. `mission` -> `mission-play`
3. `consequence` -> `consequence`
4. `plot-twist` -> `plot-twist`
5. `reflection` -> `reflection`
6. `phase-result` -> `phase-result`
7. `progression` -> `progression`

## Endpoints do Journey Engine
- `GET /api/journey-engine/runtime`
  - Retorna snapshot atual do engine já apresentado para o frontend.
- `POST /api/journey-engine/phases/:phaseId/start`
  - Inicia formalmente a fase atual e registra auditoria.
- `POST /api/journey-engine/decision`
  - Processa a decisão principal da missão, aplica consequência e world delta.
- `POST /api/journey-engine/twist/resolve`
  - Resolve o twist ativo e move o fluxo para reflexão.
- `POST /api/journey-engine/reflection`
  - Registra a reflexão do aprendiz e prepara o resultado da fase.
- `POST /api/journey-engine/finalize`
  - Fecha a fase e libera progressão.
- `GET /api/journey-engine/result`
  - Retorna o resultado consolidado da fase atual.
- `GET /api/journey-engine/progress`
  - Retorna fase ativa, timeline, world state e progressão.
- `GET /api/journey-engine/competencies`
  - Retorna o dashboard oficial de competências derivado do runtime consolidado.

## Componentes internos principais
- `phase-resolver.service.js`
  - sequência oficial, labels e próximo passo
- `state-manager.service.js`
  - normalização, snapshots, audit trail e world state
- `decision-processor.service.js`
  - leitura da decisão principal
- `consequence-engine.service.js`
  - narrativa e delta de impacto
- `twist-engine.service.js`
  - gatilho de plot twist por condição do mundo
- `reward-engine.service.js`
  - XP, badges e resumo de recompensa
- `competency-engine.service.js`
  - aplicação de impacto no motor de competências
- `mentor-bridge.service.js`
  - prompt de reflexão e debrief
- `runtime-presenter.service.js`
  - shape final entregue ao frontend

## World State oficial
O engine normaliza e persiste indicadores contínuos, hoje incluindo:
- `tension_level`
- `stakeholder_trust`
- `budget`
- `morale`
- `time_pressure`
- `learning_confidence`
- `team_alignment`
- `market_perception`
- `execution_risk`

Cada decisão pode:
- alterar um ou mais indicadores
- produzir consequência narrativa
- disparar um twist
- influenciar competências
- gerar recompensa

## Competências
O engine usa o `competency.service.js` como motor único de evolução. O contrato consolidado inclui:
- dimensões `K`, `A`, `J`, `C`
- `mastery`
- `confidence`
- `consistency`
- `growth`
- `globalScore`
- histórico, tendência e recomendação

Isso evita motores paralelos de score entre assessment, missão e runtime.

## Fluxo operacional resumido
1. frontend carrega `GET /api/journey-engine/runtime`
2. fase atual é iniciada em `POST /phases/:phaseId/start`
3. missão registra decisão em `POST /decision`
4. backend aplica consequence + world delta + competências + rewards
5. se necessário, twist é resolvido em `POST /twist/resolve`
6. reflexão é enviada em `POST /reflection`
7. fase é encerrada em `POST /finalize`
8. frontend pode consumir `result`, `progress` e `competencies`

## Integração com frontend
Arquivos principais de integração:
- `frontend/src/services/journeyEngineApi.js`
- `frontend/src/context/JourneyEngineRuntimeContext.jsx`
- `frontend/src/context/CampaignRuntimeContext.jsx`
- `frontend/src/features/campaign/CampaignFlowPage.jsx`
- `frontend/src/features/journey-engine/*`
- `frontend/src/pages/JourneyMapPage.jsx`
- `frontend/src/pages/CompetencyDashboardPage.jsx`

Canonicalização da rota de campanha:
- a entrada em `/campaign` é apenas um ponto de bootstrap
- o frontend converte a rota para a fase canônica persistida em `campaignProgress` assim que o runtime oficial estiver disponível
- isso garante estabilidade de URL mesmo quando a fase atual falha ao iniciar no `journey-engine`
- a forma canônica permanece ` /campaign/:chapterId/:phaseId `

Convivência com a jornada adaptativa:
- a campanha linear continua usando o `journey-engine` como autoridade operacional da fase
- a experiência adaptativa vive em rota canônica própria (`/adaptive-journey`)
- campanha e dashboard podem ler o runtime adaptativo apenas para orientar navegação e continuidade por competência, sem assumir autoridade de cálculo

## Observações de implementação
- O frontend não calcula progressão real nem world state oficial.
- O engine reaproveita o runtime consolidado para montar o snapshot final.
- O estado de capítulo e fase continua compatível com persistência de campanha e analytics existentes.
- A canonicalização de `/campaign` para a fase persistida foi endurecida no `CampaignRuntimeContext` para evitar rotas intermediárias instáveis em cenários de falha de `startPhase`.