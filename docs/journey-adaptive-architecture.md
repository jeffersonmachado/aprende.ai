# Journey Adaptive Architecture

## Objetivo

Implementar geração adaptativa de capítulos com IA controlada, mantendo:

- competência como unidade central de progressão
- backend como autoridade oficial de estado, evidência, avaliação e encerramento
- IA como mecanismo de sugestão, nunca como fonte de verdade
- personalização por perfil de usuário, meta de aprendizagem e perfil de aprendizagem
- ciclo pedagógico `Contexto -> Desafio -> Decisão -> Consequência -> Reflexão -> Avaliação -> Ajuste`

## Onde o módulo vive

O módulo principal foi criado em `api/modules/journey-adaptive/`.

Ele complementa o `journey-engine`, mas não duplica o motor antigo:

- `journey-engine` continua sendo o runtime operacional legado da campanha
- `journey-adaptive` passa a ser o runtime oficial da jornada adaptativa por competência
- ambos persistem dentro de `JourneyState.stateJson`, preservando uma fonte oficial unificada por usuário

## Camadas implementadas

### 1. Framework pedagógico fixo

Arquivo: `api/modules/journey-adaptive/journey-adaptive.constants.js`

Define:

- competências suportadas
- níveis de proficiência
- score alvo
- consistência mínima
- mínimo de evidências
- limites mínimo e máximo de capítulos
- pesos por tipo de capítulo
- critérios de reforço, consolidação e encerramento
- presets auditáveis de mentoria

### 2. Biblioteca controlada de capítulos-base

Arquivo: `api/modules/journey-adaptive/journey-adaptive.fixtures.js`

Contém capítulos-base controlados com:

- `id`, `slug`, `titulo`, `descricao`, `tipo`
- competência principal e secundárias
- compatibilidade por perfil de usuário, meta e perfil de aprendizagem
- objetivo pedagógico, formato narrativo, critérios de sucesso/falha
- evidências esperadas, variações narrativas e parâmetros de avaliação
- conteúdo de ciclo para renderização no frontend

Inicialmente há biblioteca para:

- `negociacao_adaptativa`
- `priorizacao_estrategica`
- `comunicacao_influencia`

### 3. Motor de inferência com IA validada

Arquivo: `api/modules/journey-adaptive/journey-adaptive.inference.service.js`

Fluxo:

1. monta um plano determinístico com base em compatibilidade e regras do framework
2. tenta obter uma sugestão estruturada via LLM
3. valida e saneia o retorno da IA
4. reimpõe diagnóstico inicial e consolidação obrigatória
5. recusa qualquer capítulo fora da biblioteca controlada

Contrato de retorno:

```json
{
  "estimatedChapterCount": 6,
  "learningStrategy": "analitico_improve_performance",
  "journeyPlan": [
    {
      "chapterBaseId": "diag-negociacao-01",
      "reason": "diagnóstico inicial da competência",
      "priority": 1,
      "type": "diagnostico"
    }
  ],
  "reinforcementPolicy": {
    "insertIfStagnation": true,
    "stagnationThreshold": 2
  },
  "accelerationPolicy": {
    "allowEarlyClosure": true,
    "minimumConsistentSuccesses": 2
  }
}
```

### 4. Orquestrador backend da jornada

Arquivo: `api/modules/journey-adaptive/journey-adaptive.service.js`

Responsável por:

- iniciar diagnóstico
- criar jornada adaptativa oficial
- expor capítulo atual
- receber decisão do aprendiz
- avaliar o capítulo
- registrar evidências
- atualizar score, confiança e consistência
- decidir `continue`, `insert_reinforcement`, `accelerate`, `close`, `close_blocked`
- recalcular jornada
- encerrar somente quando os critérios oficiais forem atendidos

### 5. Avaliação contínua por competência

Arquivo: `api/modules/journey-adaptive/journey-adaptive.progression.service.js`

Cada capítulo pode gerar:

- `scoreDelta`
- `confidenceDelta`
- `evidenceGenerated`
- `consistencySignal`
- `mentorFeedback`
- `errorPattern`
- `successPattern`

O fechamento considera obrigatoriamente:

- score alvo
- consistência mínima
- quantidade mínima de evidências
- diversidade mínima de tipos de evidência
- desempenho suficiente em capítulos críticos

### 6. Mentoria adaptativa

Arquivo: `api/modules/journey-adaptive/journey-adaptive.constants.js`

Perfis suportados:

- `explorador`
- `pratico`
- `narrativo`
- `analitico`

Cada preset define:

- tom
- nível de diretividade
- rótulo auditável
- instrução oficial de mentoria

### 7. API e contratos

Arquivos:

- `api/modules/journey-adaptive/journey-adaptive.controller.js`
- `api/modules/journey-adaptive/journey-adaptive.routes.js`
- `api/modules/journey-adaptive/journey-adaptive.schemas.js`

Endpoints implementados:

- `POST /api/journey-adaptive/diagnostic/start`
- `POST /api/journey-adaptive/session`
- `GET /api/journey-adaptive/runtime`
- `GET /api/journey-adaptive/current-chapter`
- `POST /api/journey-adaptive/decision`
- `POST /api/journey-adaptive/recalculate`
- `GET /api/journey-adaptive/progress`
- `GET /api/journey-adaptive/evidences`
- `GET /api/journey-adaptive/history`
- `GET /api/journey-adaptive/explanations`
- `POST /api/journey-adaptive/complete`

Os payloads são validados com `zod` e retornam `422` quando inválidos.

### 8. Frontend

Arquivos:

- `frontend/src/services/journeyAdaptiveApi.js`
- `frontend/src/features/journey-adaptive/AdaptiveJourneyPage.jsx`
- `frontend/src/pages/DashboardPage.jsx`
- `frontend/src/features/campaign/CampaignFlowPage.jsx`
- rota canônica `frontend/src/App.jsx` em `/adaptive-journey`

O frontend:

- mostra capítulo atual
- renderiza contexto, desafio, decisão e reflexão
- exibe progresso oficial por competência
- mostra mentoria ativa
- consome justificativas de reforço, aceleração e encerramento
- nunca calcula score oficial ou fechamento por conta própria

Integração atual no produto:

- a rota oficial da experiência adaptativa é `/adaptive-journey`
- os caminhos legados `/campaign/adaptive` e `/journey/adaptive` redirecionam para a rota canônica
- o menu principal expõe a entrada `Jornada Adaptativa`
- o dashboard principal mostra um resumo adaptativo com competência, score, capítulo atual e CTA de retomada/encerramento
- a campanha linear mostra CTA contextual para a jornada adaptativa e personaliza a mensagem com base no runtime adaptativo oficial quando houver sessão ativa

Comportamento de fallback:

- se não houver sessão adaptativa ativa, dashboard e campanha degradam para estado vazio controlado
- a ausência da sessão adaptativa não quebra o carregamento do dashboard nem da campanha

### 9. Observabilidade e auditoria

Arquivos:

- `api/modules/journey-adaptive/journey-adaptive.audit.service.js`
- `api/modules/journey-adaptive/journey-adaptive.state.service.js`

Persistência auditável:

- trilha em `JourneyState.stateJson.journeyAdaptive.auditTrail`
- eventos estruturados em `JourneyEvent`

Permite reconstruir:

- plano inicial
- capítulos executados
- razões de reforço
- razões de aceleração
- bloqueios de encerramento
- execução e evidências geradas

### 10. Testes

Arquivos:

- `api/tests/journeyAdaptive.inference.service.test.js`
- `api/tests/journeyAdaptive.progression.service.test.js`
- `api/tests/journeyAdaptive.service.test.js`
- `api/tests/journeyAdaptive.integration.test.js`

Cobertura principal:

- inferência inicial de jornada
- cenário de 4 capítulos
- cenário de 10 capítulos
- adaptação por perfil narrativo e analítico
- adaptação por meta de aprendizagem
- adaptação por perfil de usuário
- inserção automática de reforço
- aceleração por domínio consistente
- bloqueio de encerramento sem evidência suficiente
- rastreabilidade completa
- rejeição de payload inválido

## Decisões de compatibilidade

- Nenhum cálculo oficial foi movido para o frontend.
- Nenhuma regra oficial de competência foi delegada à IA.
- A IA só sugere composição de plano; o backend valida e saneia tudo.
- O estado oficial continua centralizado em `JourneyState` e `JourneyEvent`.
- O módulo foi adicionado sem remover ou enfraquecer o runtime existente.
- A rota adaptativa foi promovida a endpoint canônico de navegação no frontend, evitando acoplamento semântico ao namespace da campanha linear.
- Campanha, dashboard e jornada adaptativa compartilham o mesmo estado oficial de backend; o frontend apenas lê e direciona o usuário entre experiências complementares.

## Validação recente do frontend

- `npm run validate` em `frontend/`: verde
- suíte unitária/integrada do frontend: `24` arquivos e `70` testes passando
- Playwright de navegação: cenário cobrindo `dashboard -> adaptive-journey` validado
