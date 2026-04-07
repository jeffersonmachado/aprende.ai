export const DEFAULT_MISSION_LIBRARY = [
  {
    id: 'mission-001',
    title: 'Alinhamento de Crise com Cliente',
    context: 'Um cliente enterprise reportou falha em producao e pediu posicionamento executivo em 2 horas.',
    stakeholders: ['cliente', 'squad tecnico', 'lideranca produto', 'operacoes'],
    riskLevel: 'alto',
    objective: 'Reduzir risco de churn e restaurar confianca com plano realista.',
    choices: [
      {
        id: 'm1-c1',
        label: 'Prometer prazo agressivo sem validar capacidade',
        consequence: 'Gera alivio imediato, mas aumenta risco de novo rompimento de expectativa.'
      },
      {
        id: 'm1-c2',
        label: 'Assumir falha, abrir plano em fases e checkpoints',
        consequence: 'Cria transparencia e reduz risco sistemico no medio prazo.'
      },
      {
        id: 'm1-c3',
        label: 'Escalar para diretoria sem plano tecnico',
        consequence: 'Aumenta ruido politico e reduz autonomia de execucao.'
      }
    ],
    competenciesImpacted: ['tomada de decisao', 'comunicacao', 'analise de risco'],
    completionCriteria: ['explicitar trade-offs', 'definir responsavel por frente', 'registrar proximo checkpoint'],
    optionalTwistTriggers: ['deadline_reduction', 'new_stakeholder']
  },
  {
    id: 'mission-002',
    title: 'Priorizacao de Backlog Sob Pressao',
    context: 'Entradas emergenciais competem com demandas estrategicas e o time perdeu foco da sprint.',
    stakeholders: ['produto', 'engenharia', 'sucesso do cliente'],
    riskLevel: 'medio',
    objective: 'Restabelecer foco de entrega sem sacrificar confiabilidade.',
    choices: [
      {
        id: 'm2-c1',
        label: 'Executar tudo em paralelo',
        consequence: 'Piora throughput e aumenta retrabalho.'
      },
      {
        id: 'm2-c2',
        label: 'Aplicar matriz impacto x urgencia com WIP limite',
        consequence: 'Eleva previsibilidade e reduz custo de troca de contexto.'
      },
      {
        id: 'm2-c3',
        label: 'Adiar decisoes e aguardar mais dados',
        consequence: 'Conserva opcionalidade, mas aumenta tempo de resposta.'
      }
    ],
    competenciesImpacted: ['analise critica', 'planejamento', 'consistencia'],
    completionCriteria: ['explicar criterio de priorizacao', 'comunicar impacto esperado', 'definir revisao da decisao'],
    optionalTwistTriggers: ['competitor_move', 'new_information']
  },
  {
    id: 'mission-003',
    title: 'Negociacao de Escopo com Stakeholder Critico',
    context: 'Um stakeholder exige escopo extra sem ampliar prazo e sem alterar budget.',
    stakeholders: ['stakeholder interno', 'time tecnico', 'financeiro'],
    riskLevel: 'alto',
    objective: 'Preservar resultado da fase mantendo alinhamento politico e tecnico.',
    choices: [
      {
        id: 'm3-c1',
        label: 'Aceitar escopo integral para evitar conflito',
        consequence: 'Aparenta colaboracao, mas compromete qualidade de entrega.'
      },
      {
        id: 'm3-c2',
        label: 'Negociar trocas com criterios objetivos de valor',
        consequence: 'Mantem foco estrategico e aumenta clareza de decisao.'
      },
      {
        id: 'm3-c3',
        label: 'Bloquear demanda sem oferecer alternativa',
        consequence: 'Protege capacidade imediata, mas gera atrito politico.'
      }
    ],
    competenciesImpacted: ['comunicacao', 'negociacao', 'tomada de decisao'],
    completionCriteria: ['documentar escopo final', 'alinhar impacto com time', 'registrar riscos residuais'],
    optionalTwistTriggers: ['internal_conflict', 'unexpected_error']
  },
  {
    id: 'mission-004',
    title: 'Boss Mission: Virada de Fase',
    context: 'A fase atual fecha hoje. Sua decisao vai definir prioridade da proxima trilha de desenvolvimento.',
    stakeholders: ['lideranca', 'mentor IA', 'time'],
    riskLevel: 'alto',
    objective: 'Consolidar aprendizado da fase e priorizar proximo desafio com base em evidencias.',
    choices: [
      {
        id: 'm4-c1',
        label: 'Escolher trilha por preferencia pessoal',
        consequence: 'Pode elevar motivacao, mas ignora lacunas objetivas.'
      },
      {
        id: 'm4-c2',
        label: 'Escolher trilha por menor competencia + meta ativa',
        consequence: 'Aumenta coerencia pedagogica e acelera evolucao relevante.'
      },
      {
        id: 'm4-c3',
        label: 'Manter trilha atual sem ajuste',
        consequence: 'Preserva ritmo, mas reduz ganho marginal de aprendizagem.'
      }
    ],
    competenciesImpacted: ['analise critica', 'planejamento', 'aplicacao'],
    completionCriteria: ['fechar retrospectiva da fase', 'definir foco de proxima trilha', 'assumir compromisso de execucao'],
    optionalTwistTriggers: ['context_shift', 'deadline_reduction']
  }
];

export const PLOT_TWIST_LIBRARY = [
  {
    kind: 'context_shift',
    title: 'Mudanca de Contexto',
    narrative: 'O cenario mudou: um novo fator de mercado alterou a prioridade da missao.',
    impact: {
      mission: 'context_reframed',
      difficultyDelta: 0,
      mentorMode: 'analitico'
    },
    suggestedAction: 'Revisar premissas e recalibrar objetivo em 3 bullets.'
  },
  {
    kind: 'new_stakeholder',
    title: 'Novo Stakeholder na Mesa',
    narrative: 'Um decisor que nao estava no plano inicial entrou na discussao com novas restricoes.',
    impact: {
      mission: 'stakeholder_added',
      difficultyDelta: 1,
      mentorMode: 'socratico'
    },
    suggestedAction: 'Mapear interesse do novo stakeholder e renegociar criterio de sucesso.'
  },
  {
    kind: 'competitor_move',
    title: 'Movimento do Concorrente',
    narrative: 'Seu principal concorrente lancou iniciativa similar, aumentando a pressao por resposta rapida.',
    impact: {
      mission: 'urgency_boost',
      difficultyDelta: 1,
      mentorMode: 'pratico'
    },
    suggestedAction: 'Priorizar uma resposta executavel em 24h com trade-offs explicitos.'
  },
  {
    kind: 'deadline_reduction',
    title: 'Prazo Reduzido',
    narrative: 'O prazo da entrega caiu pela metade e voce precisa decidir o que preservar.',
    impact: {
      mission: 'deadline_cut',
      difficultyDelta: 1,
      mentorMode: 'pratico'
    },
    suggestedAction: 'Aplicar criterio de impacto minimo viavel e comunicar o que ficou fora.'
  },
  {
    kind: 'internal_conflict',
    title: 'Conflito Interno',
    narrative: 'Duas liderancas divergem sobre a estrategia e esperam sua recomendacao agora.',
    impact: {
      mission: 'alignment_required',
      difficultyDelta: 0,
      mentorMode: 'narrativo'
    },
    suggestedAction: 'Conduzir alinhamento orientado por risco e objetivo comum.'
  },
  {
    kind: 'new_information',
    title: 'Nova Informacao Critica',
    narrative: 'Dados atualizados invalidaram parte das hipoteses usadas na ultima decisao.',
    impact: {
      mission: 'hypothesis_invalidated',
      difficultyDelta: 0,
      mentorMode: 'analitico'
    },
    suggestedAction: 'Reprocessar a decisao com base na nova evidencia e registrar justificativa.'
  }
];
