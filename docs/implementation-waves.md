# Implementation Waves - Jornada Unificada

Data: 2026-04-02

## Wave 0 - Leitura profunda e diagnostico
Status: concluida
- Inspecao de arquitetura real (frontend + backend + modelos + docs + testes).
- Mapeamento de reuso em `journey-flow`, `simulation`, `mentor`, `competency`, `gamification`.
- Registro de gap analysis em documento dedicado.

## Wave 1 - Nucleo de runtime da experiencia
Status: concluida
- Criado backend `Journey Experience Runtime`:
  - `GET /api/journey-runtime`
  - `POST /api/journey-runtime/plot-twist`
- Runtime consolida:
  - jornada ativa e mapa
  - missao atual
  - mentor contextual
  - candidato de plot twist
  - competencias operacionais
  - resultado de fase
  - resumo de telemetria

## Wave 2 - Competencias operacionais
Status: concluida
- Evolucao de `competency.service`:
  - Persistencia de `CompetencyEvidence` durante update de score.
  - Matriz operacional com:
    - catalogo + dimensoes + pesos
    - score por competencia
    - evidencias diretas vs inferidas
    - forcas e focos
- Novo endpoint:
  - `GET /api/competencies/me/matrix`

## Wave 3 - Experiencia principal unificada no frontend
Status: concluida
- Criada rota principal do aluno:
  - `/journey`
- Criado `JourneyRuntimeContext` para consumo central do runtime.
- Criado `JourneyExperiencePage` com blocos:
  - HUD da jornada
  - mapa vivo
  - missao (contexto + decisoes)
  - mentor contextual
  - plot twist acionavel
  - dashboard de competencias
  - resultado de fase

## Wave 4 - Onboarding premium
Status: concluida
- Refatorado onboarding para fluxo continuo em 3 etapas:
  - perfil
  - meta
  - estilo
- UX de selecao por cards grandes.
- Persistencia segue no backend (`/api/profile/onboarding`).
- Exposicao de seed da jornada no resumo da etapa final.

## Wave 5 - Separacao de experiencia x estrutura x sistema
Status: concluida
- Navegacao reorganizada por dominios.
- Home default autenticada passa a ser campanha (`/journey`).
- HUD com nivel, XP e streak no topo da aplicacao do aluno.

## Wave 6 - Validacao tecnica
Status: concluida
- Ajustes em testes frontend para nova rota inicial e novo provider de runtime.
- Execucao de testes/build e correcoes de regressao.

## Wave 7 - Missao interativa conectada ao backend
Status: concluida
- Escolhas da missao na pagina de campanha agora executam decisao real via modulo `simulation`.
- Feedback da escolha e atualizacao do runtime no mesmo fluxo.
- Missoes de fixture permanecem em modo narrativo controlado, sem mover regra critica para frontend.

## Wave 8 - Catalogo persistente de missao/twist
Status: concluida
- Criadas tabelas multi-tenant:
  - `journey_missions`
  - `journey_twist_rules`
  - `journey_twist_logs`
- Runtime agora prioriza catalogo persistido por tenant antes de fallback para fixture.
- Adicionado endpoint `POST /api/journey-runtime/plot-twist/resolve`.
- Migracao aplicada localmente com sucesso.
- Seed demo evoluido para upsert de catalogo (idempotente), incluindo expansao de missoes e twists por contexto.

## Wave 11 - Testes de integracao de runtime/twist
Status: concluida
- Nova suite da API cobrindo contrato e status codes de runtime:
  - `GET /api/journey-runtime`
  - `POST /api/journey-runtime/plot-twist`
  - `POST /api/journey-runtime/plot-twist/resolve`
- Inclui validacao de propagacao de erro do runtime service.

## Wave 12 - Segmentacao explicita de missao
Status: concluida
- Nova migracao de schema para `journey_missions` com campos de targeting:
  - `track_slug`
  - `target_area`
  - `audience_styles_json`
- Runtime passou a selecionar missao por fit de estilo dominante e area do aprendiz.
- Seed demo ajustado para upsert com preenchimento de targeting por missao.

## Wave 13 - Matching por meta ativa
Status: concluida
- Selecionador de missao passou a considerar sinais da meta ativa (`goalType`, `title`, `description`) para reforcar aderencia a `track_slug`.
- Mantida ordenacao de desempate por `sortOrder` para preservar progressao pedagogica.

## Wave 14 - Integracao ponta a ponta runtime/twist
Status: concluida
- Nova suite de persistencia real no banco validando:
  - leitura de runtime com missao aderente por targeting
  - trigger de twist com criacao de `journey_twist_logs`
  - resolve de twist com atualizacao de status e notas
  - leitura consolidada do runtime apos resolucao
- Ajuste de compatibilidade em `IntegrationEvent` para schema atual (`provider`, `event_name`) utilizado na telemetria.

## Wave 15 - Indicadores de efetividade pedagogica
Status: concluida
- Runtime passou a expor bloco `effectiveness` com:
  - taxa de resolucao de twists (global e por tipo)
  - sinais de momentum de competencias (score medio e proporcao de evidencia)
  - cobertura da missao atual sobre focos e forcas
- Suite de persistencia real atualizada para validar os indicadores apos trigger/resolve.

## Wave 16 - Janela temporal e benchmark por perfil
Status: concluida
- Runtime passou a expor recortes temporais de twist em 7 e 30 dias.
- Adicionado comparativo do usuario contra media do estilo dominante e media geral do tenant no ultimo ciclo de 30 dias.
- Teste de persistencia validando os novos campos no contrato `effectiveness.twist`.

## Wave 17 - Endpoint admin de analytics por tenant
Status: concluida
- Novo endpoint administrativo: `GET /api/journey-runtime/analytics/effectiveness`.
- Filtros implementados: `days`, `style`, `kind`.
- Resposta inclui resumo global, distribuicao por tipo de twist, comparativo por estilo e ranking de usuarios.
- Protegido por role `admin`.

## Wave 18 - Frontend admin para analytics
Status: concluida
- Nova pagina administrativa de efetividade com consumo de endpoint backend e filtros:
  - janela em dias
  - estilo dominante
  - kind de twist
- Integrada em rota protegida de sistema e no menu da aplicacao.
- Cobertura de testes para pagina, rota e navegacao.

## Wave 19 - Visualizacao comparativa avancada
Status: concluida
- Endpoint admin expandido com:
  - `timeSeries` diaria para evolucao de resolução no periodo
  - `heatmapKindStyle` para leitura de efetividade por combinacao kind x estilo
- Frontend admin evoluido para exibir serie temporal e heatmap em cards dedicados.
- Validacao completa em suites de API e frontend.

## Wave 20 - Journey Engine operacional
Status: concluida
- Novo modulo backend `journey-engine` criado como orquestrador do ciclo de fase.
- Endpoints adicionados para runtime, start, decision, twist resolve, reflection, finalize, result, progress e competencies.
- World state oficial persistido no backend com snapshots e audit trail.
- Consequence engine, reward engine, twist engine e runtime presenter integrados.

## Wave 21 - Contrato de campanha em fases explicitas
Status: concluida
- `journey-runtime` passou a expor sete fases oficiais por capítulo:
  - `briefing`
  - `mission`
  - `consequence`
  - `plot-twist`
  - `reflection`
  - `phase-result`
  - `progression`
- Persistencia de progresso da campanha atualizada para esse contrato.

## Wave 22 - Frontend por fase e mapa dedicado
Status: concluida
- `CampaignFlowPage` conectado ao Journey Engine.
- Criadas telas dedicadas para briefing, missão, consequência, twist, reflexão, resultado e progressão.
- Nova rota `/journey-map` criada para mapa da jornada como tela própria.
- Nova rota `/competency-dashboard` criada para dashboard oficial de competências.

## Wave 23 - Dashboard oficial de competências
Status: concluida
- Frontend passou a consumir `GET /api/journey-engine/competencies`.
- Dashboard agora exibe forças, focos, métricas compostas e recomendações derivadas do motor de competências.

## Wave 24 - Cobertura e estabilizacao final
Status: concluida
- Suite de integração da API para `journey-engine` adicionada.
- Suites unitárias do backend ampliadas para `state-manager.service` e `runtime-presenter.service`, cobrindo audit trail, normalização defensiva e montagem do snapshot consolidado.
- Suite de persistência do `journey-runtime.service` ampliada para filtros combinados de analytics (`style`, `kind`, `chapterId`, `phaseId`, `runStatus`, `linkMode`), incluindo cenários `linked`, `unlinked` e isolamento multiusuário por estilo, acompanhada de correção no agregador para manter a resolução de vínculos por `simulationRunId` independentemente dos filtros de fase/status.
- Suites de frontend ampliadas para campanha, mapa, dashboard de competências, wrappers do engine e rotas novas.
- Ajustes de timing e isolamento de mocks estabilizaram a suíte completa do frontend.
- Pipeline consolidado ficou verde em `npm run validate`.

## Wave 25 - Higiene do pipeline
Status: concluida
- Warnings do React Router removidos dos testes do frontend.
- Scripts da API ajustados para suprimir warnings de ambiente do Node/Jest durante a suíte.

## Wave 26 - Smoke E2E da campanha
Status: concluida
- Playwright adicionado ao frontend com `playwright.config.js` dedicado.
- Smoke test browser criado para login + briefing + missão + consequência + twist + reflexão + resultado + progressão.
- Segundo cenário E2E adicionado para mapa da jornada e dashboard de competências em sessão autenticada.
- Cenários negativos adicionados para sessão expirada no bootstrap e falha de API no dashboard de competências.
- Progressão multi-capítulo validada com desbloqueio real do capítulo seguinte e navegação para o novo briefing.
- Falha do runtime principal coberta para validar exposição de erro na experiência protegida.
- Falhas transacionais do `journey-engine` cobertas para `runtime`, `startPhase` e `finalize`.
- Caminho alternativo de decisão agora coberto em browser, validando consequência e twist de maior risco a partir de uma escolha agressiva.
- Caminho sem twist ativo agora coberto em browser, validando continuação neutra da fase `plot-twist` quando nenhuma ruptura é disparada.
- Segundo capítulo agora possui cobertura browser para briefing e decisão própria, validando feedback executivo específico após o desbloqueio.
- Segundo capítulo agora também fecha em browser até `consequence`, `plot-twist`, `reflection`, `phase-result` e `progression`, consolidando o capítulo completo no ambiente mockado.
- Segundo capítulo agora também cobre a ramificação alternativa de maior ruído político até `progression`, validando o fechamento ruim completo no ambiente mockado.
- Progressão do segundo capítulo agora desbloqueia o terceiro em browser, com fechamento multi-capítulo completo cobrindo `briefing`, `mission`, `consequence`, `plot-twist`, `reflection`, `phase-result` e `progression` do capítulo 3.
- Capítulo 3 agora também cobre a ramificação negativa com desalinhamento entre parceiros até o encerramento, validando a deterioração de confiança e o fechamento ruim completo no ambiente mockado.
- Capítulo 3 agora também cobre a ramificação neutra sem ruptura ativa entre parceiros até o encerramento, validando fechamento equilibrado sem `plot-twist` acionado na decisão final.
- Progressão do terceiro capítulo agora também desbloqueia o quarto em browser, validando a entrada em um ciclo de recuperação de mercado com briefing e decisão própria de governança adaptativa.
- Capítulo 4 agora também cobre fechamento negativo por sobrepromessa sem disciplina operacional e fechamento neutro com checkpoints verificáveis, completando as três variantes pedagógicas principais do novo capítulo.
- Progressão do quarto capítulo agora também desbloqueia o quinto em browser, com fechamento completo de escala institucional cobrindo `briefing`, `mission`, `consequence`, `plot-twist`, `reflection`, `phase-result` e `progression` do capítulo 5.
- Capítulo 5 agora também cobre fechamento negativo por autonomia sem revisão institucional compartilhada e fechamento neutro com ondas auditáveis sem twist ativo, completando as três variantes pedagógicas principais do capítulo.
- Suite Playwright segmentada por domínio em `campaign-core`, `navigation` e `resilience` com fixtures compartilhados.
- Suite unitária isolada de `frontend/e2e/**` para evitar conflito entre Vitest e Playwright.

## Proximas waves recomendadas
- Wave 9: telemetria pedagogica enriquecida (tempo por etapa, abandono/retomada, eficacia de mentor por estilo).
- Wave 10: catalogo inicial multi-tenant seedado por trilha com 3-5 missoes completas.
- Wave 27: adicionar exportacao CSV e snapshots comparativos (7/30/90 dias) na area admin.
- Wave 28: expandir a suíte E2E para campanhas com mais de cinco capítulos e cenários pedagógicos ainda não modelados a partir do capítulo 6.
- Wave 29: formalizar empacotamento final com artefatos versionados e checklist de entrega.
