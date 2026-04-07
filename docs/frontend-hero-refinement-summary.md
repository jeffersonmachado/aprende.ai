# Frontend Hero Refinement Summary

Data: 2026-04-02
Escopo: refinamento premium do frontend existente com foco em /campaign, onboarding, mapa, missão, twist, competências, mentor e fechamento.

## O que foi refinado

- Shell da campanha elevada para um modo mais distinto do restante do app, com atmosfera mais profunda, topbar mais dramática, HUD reforçada e navegação menos parecida com menu estrutural.
- Onboarding de 3 etapas preservado, mas transformado em uma entrada de campanha mais hero, com banner de abertura, cards de papel mais fortes, preview imediato da jornada e CTAs com mais presença.
- Mapa da jornada refinado com overlay espacial, trilha mais viva, HUD interno do mapa, boss mais destacado e nodes ativos com mais sensação de energia e progressão.
- Missão reorganizada visualmente para enfatizar quatro zonas claras: situação, decisão, mentor/reflexão e consequência, com escolhas mais táticas e menos cara de cards comuns.
- Twist reforçado como evento dramático com leitura mais urgente, melhor contraste e comportamento visual mais memorável.
- Painel de competências e evolução elevados com vitals hero, radar mais integrado, leitura de forças/focos mais forte e fechamento mais comemorativo.
- Mentor melhor integrado ao palco da decisão, com sinais de contexto mais claros e melhor presença sem competir demais com a missão.
- Linguagem visual consolidada entre onboarding, campanha, mapa, mentor, competências e resultado, com gradientes, glow, superfícies e motion mais consistentes.
- Responsividade refinada para mobile em HUD, onboarding, mapa, radar, missão, mentor e fechamento.

## Arquivos alterados nesta rodada

- frontend/src/components/Layout.jsx
- frontend/src/components/core/Navigation.jsx
- frontend/src/features/campaign/CampaignFlowPage.jsx
- frontend/src/features/onboarding/OnboardingPage.jsx
- frontend/src/features/journey-runtime/JourneyExperiencePage.jsx
- frontend/src/features/evolution/EvolutionPage.jsx
- frontend/src/components/journey/JourneyMapCanvas.jsx
- frontend/src/components/journey/JourneyNode.jsx
- frontend/src/components/journey/JourneyHeader.jsx
- frontend/src/components/journey/JourneyMentorPanel.jsx
- frontend/src/styles/index.css
- frontend/src/styles/globals.css
- docs/frontend-hero-refinement-gap.md

## Ganhos em relação à imagem de referência

- A campanha agora se aproxima mais da referência no que mais importava: sensação de palco principal, profundidade espacial, glow controlado, hierarquia hero e fechamento celebrativo.
- O onboarding saiu mais claramente do território de wizard funcional para uma experiência de entrada em campanha com papel, meta e estilo mais expressivos.
- O mapa ganhou mais assinatura visual e contraste entre estados, especialmente no node ativo e no boss/final.
- A missão ficou menos dashboard e mais cena de decisão, com cards que carregam comando, risco, impacto e consequência de forma mais teatral.
- Competências e resultado final ficaram mais aspiracionais e menos parecidos com métricas isoladas.

## O que ainda falta para chegar ainda mais perto

- Substituir avatares simbólicos do onboarding por visuais reais ou ilustrações dirigidas ao mesmo idioma cinematográfico da referência.
- Aprofundar motion de transição entre fases da campanha com coreografia dedicada por evento importante.
- Reforçar ainda mais o boss/final com assets ou efeitos específicos se houver margem de performance e direção de arte.
- Evoluir badges e recompensas com uma camada visual própria de coleção/conquista.

## Riscos e próximos passos

- O aumento de densidade visual exige observação contínua de contraste e legibilidade em telas mais simples.
- A camada estética ficou mais forte sem mudar contratos; isso é bom para segurança técnica, mas ainda depende de direção de arte futura para chegar ao limite da referência.
- Próximos passos naturais:
  1. validar visualmente em desktop e mobile reais
  2. ajustar detalhes finos de spacing/motion a partir dessa validação
  3. evoluir assets ilustrados do onboarding e do boss final

## Validação técnica

- Build do frontend executado com sucesso em 2026-04-02.
- Ajuste aplicado no CSS para compatibilidade do efeito de máscara no mapa.