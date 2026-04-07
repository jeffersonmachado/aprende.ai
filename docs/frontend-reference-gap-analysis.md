# Frontend Reference Gap Analysis

Data: 2026-04-01
Escopo: experiencia do aluno em /journey e onboarding, com referencia visual prioritaria (onboarding, mapa, missao, plot twist, dashboard de competencias e resultado final)

## Leitura do estado atual (codigo real)

Base validada como existente e reutilizavel:
- Rota principal e runtime unificado em [frontend/src/App.jsx](frontend/src/App.jsx) e [frontend/src/context/JourneyRuntimeContext.jsx](frontend/src/context/JourneyRuntimeContext.jsx)
- Home de campanha em [frontend/src/features/journey-runtime/JourneyExperiencePage.jsx](frontend/src/features/journey-runtime/JourneyExperiencePage.jsx)
- Motor de mapa e mentor/recompensa em [frontend/src/components/journey/JourneyEngine.jsx](frontend/src/components/journey/JourneyEngine.jsx)
- Onboarding 3 etapas funcional em [frontend/src/features/onboarding/OnboardingPage.jsx](frontend/src/features/onboarding/OnboardingPage.jsx)
- Tokens/componentes reutilizaveis em [frontend/src/components/experience/ExperienceCard.jsx](frontend/src/components/experience/ExperienceCard.jsx), [frontend/src/components/experience/StageWrapper.jsx](frontend/src/components/experience/StageWrapper.jsx) e [frontend/src/styles/index.css](frontend/src/styles/index.css)

Conclusao: a arquitetura e os contratos backend-first ja estao corretos. O gap principal esta na camada de experiencia visual, hierarquia, dramatizacao e unificacao cinematografica.

## Gaps exatos contra a referencia

### 1) Shell e HUD
- Atual: shell com boa organizacao, mas visual ainda hibrido entre dashboard claro e campanha.
- Gap: falta atmosfera espacial/cinematografica consistente, com foco em trilha ativa e HUD premium.

### 2) Onboarding
- Atual: fluxo 3 etapas pronto (perfil, meta, estilo), mas com cara de formulario/cartoes simples.
- Gap: precisa parecer selecao de personagem/jornada com stepper hero, cards com identidade forte e preview mais aspiracional.

### 3) Mapa da jornada
- Atual: mapa funcional com path e nos, porem em superficie muito clara e impacto moderado.
- Gap: falta protagonismo visual do mapa, conexoes mais energeticas, destaque de boss/final e legibilidade premium em todos estados.

### 4) Missao
- Atual: blocos de contexto/decisao/mentor existentes.
- Gap: missao ainda nao e palco principal; opcoes parecem blocos utilitarios e nao comandos estrategicos de campanha.

### 5) Plot twist
- Atual: banner existente e funcional.
- Gap: evento ainda pouco dramatico, com entrada visual moderada e baixa sensacao de urgencia narrativa.

### 6) Competencias
- Atual: lista de barras e forcas/focos funcional.
- Gap: falta assinatura visual de status real (radar/hero, composicao de progressao, leitura de forcas e focos mais memoravel).

### 7) Resultado final
- Atual: card de fase com progresso e recomendacao.
- Gap: precisa de fechamento celebrativo sobrio, com headline forte, recompensas e proxima trilha claramente destacadas.

### 8) Mentor
- Atual: contexto textual presente.
- Gap: mentor ainda pode parecer bloco separado da missao; precisa integrar melhor na narrativa de decisao sem competir de forma ruim.

### 9) Linguagem visual e motion
- Atual: base de classes e motion existe.
- Gap: gradientes, glow, superficies, estados e microinteracoes ainda nao estao totalmente unificados no padrao da referencia.

### 10) Responsividade
- Atual: regras responsivas basicas prontas.
- Gap: falta priorizacao mobile mais forte para HUD, mapa, mentor recolhivel e cards de decisao com toque mais seguro.

## Direcao de implementacao adotada

- Nao recriar arquitetura.
- Nao duplicar experiencia existente com novos fluxos paralelos.
- Evoluir componentes reais em ondas: shell -> onboarding -> mapa -> missao/twist -> competencias/resultado -> mentor -> polish responsivo.
- Preservar backend como autoridade (frontend apenas apresentacao e interacao).
