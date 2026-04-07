# Runtime Gap Analysis - aprende-ai

Data: 2026-04-01

## Diagnostico objetivo

## O que ja existia e foi reaproveitado
- Backend multi-tenant com autoridade em estado (`JourneyState`), progresso, eventos, recompensas, gamificacao e mentor.
- Motor de jornada com 15 etapas em `journey-flow`.
- Simulacao com registro de decisao (`DecisionLog`) e impacto em competencias (`UserCompetencyScore`).
- IA via backend em mentor e geracao adaptativa.
- Frontend com componentes de jornada (`JourneyEngine`) e base visual de gamificacao.

## Gaps principais encontrados
- Home do aluno apontava para fluxo tecnico, sem runtime unificado de campanha.
- Onboarding estava funcional, mas com UX de formulario fragmentado.
- Plot twist existia apenas como conceito visual, sem engine dedicada no runtime.
- Modelo de competencias sem matriz operacional consolidada para leitura pedagogica (direta vs inferida).
- Navegacao misturava experiencia do aluno com rotas estruturais e sistema em excesso.
- Dashboard de progresso disperso entre telas, sem centro unico de campanha.

## Duplicidades e riscos
- Sobreposicao parcial entre `dashboard`, `journey-flow` e `simulation` para mostrar estado da jornada.
- Acoplamento visual entre areas de aluno e areas tecnicas.
- Ausencia de contrato unico frontend/backend para consumir estado completo da campanha.

## Direcao arquitetural aplicada
- Criado `Journey Experience Runtime` no backend para consolidar estado oficial da campanha.
- Frontend passa a consumir runtime unificado em rota principal do aluno (`/journey`).
- Plot twist virou evento real persistido e telemetrizado.
- Competencias ganham matriz operacional com evidencias diretas e inferidas.
- `Journey Engine` foi introduzido como camada operacional da campanha, mantendo o backend como autoridade sobre fase, consequência, world state, rewards e auditoria.

## Escopo implementado nesta rodada
- Endpoint runtime unificado.
- Endpoint de plot twist.
- Matriz operacional de competencias.
- Home central de campanha no frontend.
- Onboarding premium em fluxo de 3 etapas.
- Documentacao de ondas de implementacao.

## Escopo que foi fechado nas ondas seguintes
- Engine operacional com endpoints próprios de start/decision/twist/reflection/finalize/result/progress/competencies.
- Contrato de campanha remodelado para sete fases explícitas por capítulo.
- World state persistido no backend com snapshots.
- Dashboard oficial de competências no frontend.
- Mapa da jornada separado em rota própria.
- Cobertura de testes ampliada no backend e frontend.
- Smoke E2E em navegador com Playwright para o fluxo principal da campanha.
- Pipeline consolidado validado com sucesso.

## Pendencias estruturais para proximas ondas
- Expandir a suíte E2E para cenários alternativos, falhas e capítulos adicionais.
- Integrar radar visual de competencias com renderizacao poligonal dedicada.
- Aprofundar catalogo inicial de missoes por tenant com seed formal em migracoes.
