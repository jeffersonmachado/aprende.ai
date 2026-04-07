# Journey Experience Runtime

## Objetivo
Consolidar a experiencia principal do aluno em um contrato unico backend-first, sem mover regras criticas para o frontend.

## Selecionador de missao (runtime)
- O runtime prioriza missoes por score de aderencia considerando:
  - estilo dominante do aprendiz (`learningStyle.dominantStyle`)
  - area do perfil (`learner.profile.area`)
  - sinais textuais da meta ativa (`goalType`, `goal.title`, `goal.description`) contra `mission.trackSlug`
- Em empate, preserva ordenacao pedagogica por `sortOrder`.

## Endpoints
- `GET /api/journey-runtime`
  - Retorna snapshot unificado da campanha do aluno.
- `POST /api/journey-runtime/plot-twist`
  - Aciona plot twist real, persiste no estado e registra telemetria.
- `POST /api/journey-runtime/plot-twist/resolve`
  - Resolve o twist ativo (ou por `twistLogId`), registra telemetria de resolucao e atualiza runtime.
- `GET /api/journey-runtime/analytics/effectiveness`
  - Endpoint administrativo por tenant para analytics de efetividade.
  - Filtros opcionais: `days`, `style`, `kind`.
  - Blocos de resposta adicionais para visualizacao avancada:
    - `timeSeries` (série diária de triggered/resolved/resolutionRate)
    - `heatmapKindStyle` (matriz de combinação kind x estilo)

## Catalogo persistente (tenant)
- `journey_missions`
  - Missao curada por tenant com contexto, escolhas, criterios e competencias impactadas.
  - Segmentacao opcional por `track_slug`, `target_area` e `audience_styles_json`.
- `journey_twist_rules`
  - Regras de reviravolta por tenant (kind, narrativa, impacto, prioridade).
- `journey_twist_logs`
  - Historico de twists disparados/resolvidos por usuario na jornada.

## Contrato principal (resumo)
- `runtimeVersion`
- `learner`
  - perfil
  - meta ativa
  - estilo de aprendizagem
- `journey`
  - `state` (estado oficial reutilizavel no `JourneyEngine`)
  - `activeStepId`
  - `progressPercent`
  - `level`, `xpTotal`, `streak`
  - `map` (nodes mission/event/boss + unlockConditions)
- `mission`
  - id, title, context, stakeholders, riskLevel, objective
  - choices
  - consequences
  - evidenceTargets
  - competenciesImpacted
  - completionCriteria
  - optionalTwistTriggers
  - targeting (trackSlug, targetArea, audienceStyles)
- `plotTwist`
  - latest
  - nextCandidate
  - triggerHints
- `mentor`
  - modo contextual
  - papeis ativos (mentor, avaliador, diretor de jogo)
- `competencies`
  - catalogo operacional
  - dimensoes e pesos
  - scores
  - evidencias diretas e inferidas
  - forcas e focos
- `phaseResult`
  - status
  - desempenho
  - lacunas recorrentes
  - recomendacao de proxima trilha
- `effectiveness`
  - `twist`
    - totalTriggered, totalResolved, resolutionRate
    - byKind (taxa de resolucao por tipo de twist)
    - latestKind, latestStatus
    - windows (last7Days, last30Days)
    - profileComparison (usuario vs media do estilo dominante e media do tenant)
  - `competencies`
    - averageScore
    - directEvidenceRatio, inferredEvidenceRatio
    - evidenceTotal
  - `mission`
    - impactedCount
    - focusCoverage, strengthCoverage
- `telemetry`
  - eventos rastreados
  - simulacoes recentes

## Fonte de verdade
- Backend: autoridade sobre estado, progresso, regras, recompensas, evidencias e telemetria.
- Frontend: renderizacao, interacao, motion e apresentacao da campanha.

## Integracoes reaproveitadas
- `journey-flow.service`
- `competency.service`
- `gamification.service`
- modelos `JourneyState`, `JourneyEvent`, `SimulationRun`, `LearningGoal`, `LearningStyleProfile`

## Governanca multi-tenant
Todos os acessos usam `tenantId` e `userId` do contexto autenticado da requisicao.
