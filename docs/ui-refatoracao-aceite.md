# UI Refatoracao - Cobertura de Criterios de Aceite

Data: 2026-03-31
Escopo: frontend aprende.ai

## Resumo
A interface foi reorganizada para tornar a jornada o centro da experiencia, separando claramente areas de Experiencia, Estrutura e Sistema. O backend permanece como fonte oficial de estado e decisao.

## Cobertura por criterio

1. Backend como autoridade central
- Frontend continua consumindo APIs para jornada, simulacao, evolucao, mentor e feedback.
- Persistencia de estado da jornada continua em /api/journey-flow/state.

2. Frontend sem decisao critica
- Regras de negocio nao foram movidas para o frontend.
- UI prioriza exibicao de estado retornado pela API e feedback visual.

3. Jornada como centro visual
- Rota principal redirecionada para /journey-flow.
- Sidebar com Minha Jornada como primeiro item da Experiencia.

4. Aparencia de produto educacional premium
- Novos componentes de dominio: journey-stage-card, scenario-option-card, mentor-card, competency-meter, reward-pill, timeline-step, journey-summary-card e diagnostic-mini-card.

5. Navegacao clara entre experiencia, estrutura e sistema
- Sidebar segmentada em tres blocos visuais com titulos dedicados.
- Rotas de sistema agrupadas e protegidas com guard de acesso.

6. Comunicacao de simulacao, progressao, mentoria e evolucao
- JourneyFlow reforca narrativa de cenario, decisao, impacto e mentoria.
- Dashboard pedagogico destaca progressao, competencias e recomendacao.

7. Gamificacao sobria e profissional
- XP, streak e badges aplicados em pills discretas.
- Sem excesso de efeitos visuais.

## Cobertura por tarefa solicitada

1) Reorganizar layout e navegacao
- Sidebar por grupos implementada.
- Home principal aponta para jornada.
- Mobile com drawer.

2) LoginPage
- Hero alterado para proposta de valor educacional.

3) DashboardPage
- Separacao entre dashboard do usuario e dashboard tecnico/admin.

4) JourneyFlowPage
- 15 telas refatoradas com hierarquia visual e narrativa orientada por decisao.

5) SimulationPage
- Estrutura premium de missao com contexto, risco, stakeholders e opcoes em cards.

6) FeedbackPage
- Reposicionado como utilitario tecnico/admin.

7) MentorPage
- Contexto visivel de mentoria antes da conversa.

8) AssessmentPage
- Exibe competencia, criterio, nivel, evidencia e recomendacao pratica.

9) TracksPage
- Trilhas destacam publico, dificuldade, competencias e recomendacao.

10) CompetenciesPage
- Competencias com tipo, dimensoes, peso, evidencia e impacto na jornada.

11) CSS global e design system
- Classes de dominio adicionadas e reaproveitadas.

12) Hierarquia visual
- Diferenciacao por tipo de tela (decisao, feedback, evolucao, admin, mentor, jornada).

13) Responsividade
- Drawer mobile e reorganizacao vertical dos blocos centrais.

14) Gamificacao
- Exibicao de XP, streak e badges com sobriedade.

15) Integracao com backend
- Sem transferencia de logica critica para frontend.
- Loading states com skeletons e transicoes suaves nos fluxos centrais.

## Validacao
- Testes frontend executados com sucesso: 20 suites, 51 testes aprovados.
