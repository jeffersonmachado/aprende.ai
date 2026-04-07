import { expect } from '@playwright/test';

export const campaignChapters = [
  {
    id: 'capitulo-1',
    title: 'Campanha Ativa',
    phases: [
      {
        id: 'briefing',
        type: 'briefing',
        title: 'Briefing',
        description: 'Contexto, objetivo e indicadores da fase.',
        content: {
          title: 'Briefing: Campanha Ativa',
          headline: 'Lançamento de produto crítico',
          context: 'Um release decisivo exige alinhamento rápido entre produto, operação e stakeholders.',
          objective: 'Definir o movimento inicial com melhor relação risco x impacto.',
          competencyName: 'tomada de decisão',
          stakeholders: ['Produto', 'Operações', 'Diretoria']
        }
      },
      {
        id: 'mission',
        type: 'mission-play',
        title: 'Missão',
        description: 'Faça a escolha principal da fase.',
        content: {
          headline: 'Lançamento de produto crítico',
          mission: {
            id: 'mission-1',
            title: 'Lançamento de produto crítico',
            objective: 'Responder à janela crítica sem perder confiança dos stakeholders.',
            choices: [
              {
                id: 'choice-1',
                label: 'Segmentar rollout e alinhar expectativa',
                impact: 'Reduz risco e preserva confiança dos stakeholders.'
              },
              {
                id: 'choice-2',
                label: 'Forçar lançamento total hoje',
                impact: 'Aumenta velocidade, mas pressiona operação e reputação.'
              }
            ]
          }
        }
      },
      {
        id: 'consequence',
        type: 'consequence',
        title: 'Consequência',
        description: 'Leitura do impacto da decisão.',
        content: {
          title: 'Consequência',
          summary: 'A decisão preservou confiança e reduziu risco operacional.'
        }
      },
      {
        id: 'plot-twist',
        type: 'plot-twist',
        title: 'Plot Twist',
        description: 'Evento inesperado muda a condição da fase.',
        content: {
          title: 'Plot Twist',
          summary: 'Um stakeholder externo exige antecipação do comunicado.'
        }
      },
      {
        id: 'reflection',
        type: 'reflection',
        title: 'Reflexão',
        description: 'Debrief da fase.',
        content: {
          title: 'Reflexão',
          prompt: 'O que esta decisão ensinou sobre seu critério sob pressão?'
        }
      },
      {
        id: 'phase-result',
        type: 'phase-result',
        title: 'Resultado',
        description: 'Fechamento da fase.',
        content: {
          title: 'Resultado'
        }
      },
      {
        id: 'progression',
        type: 'progression',
        title: 'Próximo passo',
        description: 'Transição para o próximo capítulo.',
        content: {
          title: 'Próximo passo',
          nextMissionTitle: 'Refinar comunicação executiva',
          unlocks: ['badge-stakeholder-sync']
        }
      }
    ]
  }
];

export const campaignChaptersWithUnlock = [
  ...campaignChapters,
  {
    id: 'capitulo-2',
    title: 'Escalada Executiva',
    phases: [
      {
        id: 'briefing',
        type: 'briefing',
        title: 'Briefing',
        description: 'Abertura do segundo capítulo.',
        content: {
          title: 'Briefing: Escalada Executiva',
          headline: 'Comitê executivo em alerta',
          context: 'O segundo capítulo exige coordenação política e comunicação de alto impacto.',
          objective: 'Reabrir a campanha com confiança alta e risco controlado.',
          competencyName: 'comunicação executiva',
          stakeholders: ['CEO', 'Conselho', 'Operações']
        }
      },
      {
        id: 'mission',
        type: 'mission-play',
        title: 'Missão',
        description: 'Defina a resposta executiva da nova etapa.',
        content: {
          headline: 'Comitê executivo em alerta',
          mission: {
            id: 'mission-2',
            title: 'Resposta executiva coordenada',
            objective: 'Conduzir o alinhamento sem ampliar ruído político.',
            choices: [
              { id: 'choice-21', label: 'Centralizar narrativa com comitê reduzido', impact: 'Eleva coordenação e reduz dispersão.' },
              { id: 'choice-22', label: 'Distribuir porta-vozes sem narrativa única', impact: 'Acelera comunicação, mas aumenta chance de ruído político.' }
            ]
          }
        }
      },
      {
        id: 'consequence',
        type: 'consequence',
        title: 'Consequência',
        description: 'Leitura do impacto político e operacional da decisão executiva.',
        content: {
          title: 'Consequência',
          summary: 'A resposta executiva concentrou a narrativa e reduziu a dispersão política.'
        }
      },
      {
        id: 'plot-twist',
        type: 'plot-twist',
        title: 'Plot Twist',
        description: 'Um novo checkpoint altera a exigência de comunicação da fase.',
        content: {
          title: 'Plot Twist',
          summary: 'O conselho antecipou o checkpoint e elevou a urgência da mensagem.'
        }
      },
      {
        id: 'reflection',
        type: 'reflection',
        title: 'Reflexão',
        description: 'Debrief da resposta executiva sob alta pressão.',
        content: {
          title: 'Reflexão',
          prompt: 'O que esta decisão ensinou sobre coerência narrativa em ambientes executivos?' 
        }
      },
      {
        id: 'phase-result',
        type: 'phase-result',
        title: 'Resultado',
        description: 'Fechamento do segundo capítulo com score, badges e recomendação.',
        content: {
          title: 'Resultado'
        }
      },
      {
        id: 'progression',
        type: 'progression',
        title: 'Próximo passo',
        description: 'Fechamento da campanha com reforço do próximo eixo de evolução.',
        content: {
          title: 'Próximo passo',
          nextMissionTitle: 'Consolidar comunicação executiva em conselhos de alta pressão',
          unlocks: ['badge-executive-alignment']
        }
      }
    ]
  },
  {
    id: 'capitulo-3',
    title: 'Coordenação de Crise Expandida',
    phases: [
      {
        id: 'briefing',
        type: 'briefing',
        title: 'Briefing',
        description: 'Abertura do terceiro capítulo.',
        content: {
          title: 'Briefing: Coordenação de Crise Expandida',
          headline: 'Ecossistema externo pressiona resposta coordenada',
          context: 'O terceiro capítulo exige resposta coordenada entre áreas internas, parceiros externos e liderança executiva.',
          objective: 'Estabilizar percepção externa sem romper alinhamento interno.',
          competencyName: 'coordenação de crise',
          stakeholders: ['Conselho', 'Parceiros', 'Clientes estratégicos']
        }
      },
      {
        id: 'mission',
        type: 'mission-play',
        title: 'Missão',
        description: 'Defina a resposta coordenada da crise ampliada.',
        content: {
          headline: 'Ecossistema externo pressiona resposta coordenada',
          mission: {
            id: 'mission-3',
            title: 'Coordenação de crise com parceiros estratégicos',
            objective: 'Responder à pressão externa preservando coerência, confiança e governança.',
            choices: [
              {
                id: 'choice-31',
                label: 'Criar war room com mensagem única e checkpoints curtos',
                impact: 'Eleva coordenação transversal e reduz ruído externo.'
              },
              {
                id: 'choice-32',
                label: 'Responder por frentes separadas com autonomia local',
                impact: 'Ganha velocidade inicial, mas amplia risco de inconsistência entre áreas.'
              }
            ]
          }
        }
      },
      {
        id: 'consequence',
        type: 'consequence',
        title: 'Consequência',
        description: 'Leitura do impacto sistêmico da decisão de coordenação.',
        content: {
          title: 'Consequência',
          summary: 'A resposta coordenada reduziu ruído entre parceiros e sustentou confiança externa.'
        }
      },
      {
        id: 'plot-twist',
        type: 'plot-twist',
        title: 'Plot Twist',
        description: 'Um novo fator externo altera a prioridade da resposta.',
        content: {
          title: 'Plot Twist',
          summary: 'Um parceiro estratégico exigiu posicionamento público conjunto em janela crítica.'
        }
      },
      {
        id: 'reflection',
        type: 'reflection',
        title: 'Reflexão',
        description: 'Debrief do fechamento multilateral da campanha.',
        content: {
          title: 'Reflexão',
          prompt: 'O que esta fase ensinou sobre coordenação sob pressão distribuída?'
        }
      },
      {
        id: 'phase-result',
        type: 'phase-result',
        title: 'Resultado',
        description: 'Fechamento do terceiro capítulo.',
        content: {
          title: 'Resultado'
        }
      },
      {
        id: 'progression',
        type: 'progression',
        title: 'Próximo passo',
        description: 'Encerramento da campanha multi-capítulo.',
        content: {
          title: 'Próximo passo',
          nextMissionTitle: 'Consolidar governança contínua entre liderança e parceiros',
          unlocks: ['badge-crisis-orchestrator']
        }
      }
    ]
  }
];

export const campaignChaptersWithExpansion = [
  ...campaignChaptersWithUnlock,
  {
    id: 'capitulo-4',
    title: 'Recuperacao de Mercado e Governanca Continua',
    phases: [
      {
        id: 'briefing',
        type: 'briefing',
        title: 'Briefing',
        description: 'Abertura do quarto capítulo.',
        content: {
          title: 'Briefing: Recuperacao de Mercado e Governanca Continua',
          headline: 'Mercado exige prova de consistência após a crise',
          context: 'O quarto capítulo desloca o foco para recuperação de percepção externa, prova de consistência e institucionalização da governança pós-crise.',
          objective: 'Converter a coordenação emergencial em confiança sustentada de mercado.',
          competencyName: 'governança adaptativa',
          stakeholders: ['Mercado', 'Conselho', 'Clientes estratégicos']
        }
      },
      {
        id: 'mission',
        type: 'mission-play',
        title: 'Missão',
        description: 'Defina a resposta final de recuperação e governança.',
        content: {
          headline: 'Mercado exige prova de consistência após a crise',
          mission: {
            id: 'mission-4',
            title: 'Institucionalizar governança com sinais públicos de consistência',
            objective: 'Recuperar percepção externa sem perder disciplina operacional e alinhamento executivo.',
            choices: [
              {
                id: 'choice-41',
                label: 'Publicar marcos de governança com cadência executiva e indicadores compartilhados',
                impact: 'Transforma resposta de crise em rotina confiável e reforça previsibilidade para o mercado.'
              },
              {
                id: 'choice-42',
                label: 'Comunicar retomada ampla sem ritual operacional estável',
                impact: 'Acelera narrativa de recuperação, mas fragiliza a prova concreta de consistência.'
              }
            ]
          }
        }
      },
      {
        id: 'consequence',
        type: 'consequence',
        title: 'Consequência',
        description: 'Leitura do impacto da estratégia de recuperação.',
        content: {
          title: 'Consequência',
          summary: 'A estratégia de governança sustentou previsibilidade e elevou a confiança de mercado.'
        }
      },
      {
        id: 'plot-twist',
        type: 'plot-twist',
        title: 'Plot Twist',
        description: 'Um novo gatilho de escrutínio altera o ritmo da recuperação.',
        content: {
          title: 'Plot Twist',
          summary: 'Analistas externos anteciparam cobrança por evidências públicas de execução.'
        }
      },
      {
        id: 'reflection',
        type: 'reflection',
        title: 'Reflexão',
        description: 'Debrief da institucionalização pós-crise.',
        content: {
          title: 'Reflexão',
          prompt: 'O que esta fase ensinou sobre transformar resposta emergencial em governança confiável?' 
        }
      },
      {
        id: 'phase-result',
        type: 'phase-result',
        title: 'Resultado',
        description: 'Fechamento do quarto capítulo.',
        content: {
          title: 'Resultado'
        }
      },
      {
        id: 'progression',
        type: 'progression',
        title: 'Próximo passo',
        description: 'Encerramento final da campanha expandida.',
        content: {
          title: 'Próximo passo',
          nextMissionTitle: 'Escalar governança com evidência contínua de execução',
          unlocks: ['badge-market-recovery']
        }
      }
    ]
  }
];

export const campaignChaptersWithScale = [
  ...campaignChaptersWithExpansion,
  {
    id: 'capitulo-5',
    title: 'Escala Institucional e Resiliencia de Ecossistema',
    phases: [
      {
        id: 'briefing',
        type: 'briefing',
        title: 'Briefing',
        description: 'Abertura do quinto capítulo.',
        content: {
          title: 'Briefing: Escala Institucional e Resiliencia de Ecossistema',
          headline: 'Ecossistema cobra consistência em escala institucional',
          context: 'O quinto capítulo exige transformar a governança recuperada em capacidade institucional durável, com consistência visível entre áreas, parceiros e mercado.',
          objective: 'Escalar a confiança sem reintroduzir fragilidade operacional ou ruído político.',
          competencyName: 'liderança sistêmica',
          stakeholders: ['Mercado', 'Parceiros', 'Liderança institucional']
        }
      },
      {
        id: 'mission',
        type: 'mission-play',
        title: 'Missão',
        description: 'Defina a estratégia de escala institucional.',
        content: {
          headline: 'Ecossistema cobra consistência em escala institucional',
          mission: {
            id: 'mission-5',
            title: 'Escalar rituais de governança para toda a rede crítica',
            objective: 'Converter a recuperação em disciplina replicável entre frentes, parceiros e ciclos executivos.',
            choices: [
              {
                id: 'choice-51',
                label: 'Orquestrar rituais integrados com métricas comuns e revisão executiva cruzada',
                impact: 'Escala coordenação com prova contínua de consistência e reduz assimetria entre frentes.'
              },
              {
                id: 'choice-52',
                label: 'Expandir autonomia de escala sem revisão institucional compartilhada',
                impact: 'Acelera expansão, mas reabre assimetria de execução e risco de desalinhamento sistêmico.'
              }
            ]
          }
        }
      },
      {
        id: 'consequence',
        type: 'consequence',
        title: 'Consequência',
        description: 'Leitura do impacto da escala institucional.',
        content: {
          title: 'Consequência',
          summary: 'A coordenação integrada sustentou a escala com consistência institucional visível.'
        }
      },
      {
        id: 'plot-twist',
        type: 'plot-twist',
        title: 'Plot Twist',
        description: 'Uma nova exigência do ecossistema testa a resiliência da escala.',
        content: {
          title: 'Plot Twist',
          summary: 'Um parceiro-chave antecipou auditoria conjunta sobre os rituais em expansão.'
        }
      },
      {
        id: 'reflection',
        type: 'reflection',
        title: 'Reflexão',
        description: 'Debrief da escala institucional.',
        content: {
          title: 'Reflexão',
          prompt: 'O que esta fase ensinou sobre sustentar confiança quando a governança deixa de ser local e passa a ser institucional?' 
        }
      },
      {
        id: 'phase-result',
        type: 'phase-result',
        title: 'Resultado',
        description: 'Fechamento do quinto capítulo.',
        content: {
          title: 'Resultado'
        }
      },
      {
        id: 'progression',
        type: 'progression',
        title: 'Próximo passo',
        description: 'Encerramento final da campanha em escala institucional.',
        content: {
          title: 'Próximo passo',
          nextMissionTitle: 'Preservar resiliência institucional com auditoria contínua da governança',
          unlocks: ['badge-systemic-leadership']
        }
      }
    ]
  }
];

export function buildJourneyRuntime(options = {}) {
  const {
    chapters = campaignChapters,
    campaignProgress = null,
    progressPercent = 14
  } = options;

  const resolvedCampaignProgress = campaignProgress || {
    chapterId: chapters[0]?.id || 'capitulo-1',
    phaseId: chapters[0]?.phases?.[0]?.id || 'briefing',
    unlockedChapterIds: [chapters[0]?.id || 'capitulo-1'].filter(Boolean),
    completedPhaseKeys: [],
    visitedPhaseKeys: [`${chapters[0]?.id || 'capitulo-1'}:${chapters[0]?.phases?.[0]?.id || 'briefing'}`],
    totalPhases: chapters[0]?.phases?.length || 0,
    totalChapters: chapters.length
  };

  return {
    runtimeVersion: 'journey-experience-runtime.v2',
    learner: {
      id: 'user-e2e',
      profile: { area: 'Produto' }
    },
    journey: {
      progressPercent,
      level: 3,
      xpTotal: 240,
      streak: 4,
      activeStepId: 'step-1',
      state: {
        steps: [{ id: 'step-1', title: 'Capítulo 1', status: 'active', xp: 120 }],
        rewards: [],
        progress: 14,
        level: 3,
        xpTotal: 240,
        streak: 4
      },
      campaignProgress: resolvedCampaignProgress
    },
    campaign: {
      chapters
    },
    mission: chapters[0]?.phases?.[1]?.content?.mission || null,
    competencies: {
      strengths: [{ id: 'c1', name: 'Tomada de decisão', metrics: { mastery: 72 } }],
      focus: [{ id: 'c2', name: 'Consistência', metrics: { mastery: 49 } }],
      summary: { averageMastery: 61 }
    }
  };
}

export function buildEngineRuntime(overrides = {}) {
  return {
    activePhaseId: 'briefing',
    nextPhaseId: 'mission',
    worldState: {
      tension_level: 52,
      stakeholder_trust: 68,
      budget: 61,
      morale: 64,
      time_pressure: 74,
      learning_confidence: 59,
      team_alignment: 66,
      market_perception: 58,
      execution_risk: 48
    },
    mission: campaignChapters[0].phases[1].content.mission,
    competencyDashboard: {
      strengths: [{ id: 'c1', name: 'Tomada de decisão', metrics: { mastery: 78 } }],
      focus: [{ id: 'c2', name: 'Consistência', metrics: { mastery: 51 } }],
      summary: { averageMastery: 65 }
    },
    result: {
      phaseScore: 84,
      mastery: 78,
      xpAwarded: 42,
      badgeSummary: 'Badge desbloqueada: stakeholder-sync'
    },
    progression: {
      nextFocus: 'Refinar comunicação executiva',
      recommendation: 'Avance mantendo alinhamento e controle de risco.'
    },
    ...overrides
  };
}

function buildDecisionOutcome({
  choiceId,
  label,
  qualityScore,
  narrative,
  delta,
  worldAfter,
  twist,
  result,
  progression
}) {
  return {
    decision: {
      id: `decision-${choiceId}`,
      label,
      qualityScore
    },
    consequence: {
      narrative,
      delta,
      worldAfter
    },
    runtime: {
      activePhaseId: 'consequence',
      latestDecision: {
        id: `decision-${choiceId}`,
        label,
        qualityScore
      },
      latestConsequence: {
        narrative,
        delta,
        worldAfter
      },
      latestTwist: twist,
      result,
      progression
    }
  };
}

export function buildDecisionOutcomes() {
  return {
    'choice-1': buildDecisionOutcome({
      choiceId: 'choice-1',
      label: 'Segmentar rollout e alinhar expectativa',
      qualityScore: 84,
      narrative: 'A decisão reduziu risco imediato e preservou confiança executiva.',
      delta: { stakeholder_trust: 8, execution_risk: -6 },
      worldAfter: {
        tension_level: 52,
        stakeholder_trust: 76,
        budget: 61,
        morale: 64,
        time_pressure: 74,
        learning_confidence: 59,
        team_alignment: 66,
        market_perception: 58,
        execution_risk: 42
      },
      twist: {
        id: 'twist-1',
        title: 'Stakeholder exige antecipação do comunicado',
        narrative: 'Um stakeholder estratégico mudou a pressão política da fase.',
        suggestedAction: 'Alinhar a mensagem executiva antes de ampliar escopo.',
        status: 'triggered'
      },
      result: {
        phaseScore: 84,
        mastery: 78,
        xpAwarded: 42,
        badgeSummary: 'Badge desbloqueada: stakeholder-sync'
      },
      progression: {
        nextFocus: 'Refinar comunicação executiva',
        recommendation: 'Avance mantendo alinhamento e controle de risco.'
      }
    }),
    'choice-2': buildDecisionOutcome({
      choiceId: 'choice-2',
      label: 'Forçar lançamento total hoje',
      qualityScore: 58,
      narrative: 'A decisão acelerou a entrega, mas elevou a pressão operacional e desgastou a reputação do rollout.',
      delta: { stakeholder_trust: -7, execution_risk: 13, time_pressure: 9 },
      worldAfter: {
        tension_level: 61,
        stakeholder_trust: 61,
        budget: 61,
        morale: 58,
        time_pressure: 83,
        learning_confidence: 55,
        team_alignment: 57,
        market_perception: 51,
        execution_risk: 61
      },
      twist: {
        id: 'twist-2',
        title: 'Operação entra em contenção',
        narrative: 'A operação entrou em contenção após o lançamento integral e exigiu resposta imediata.',
        suggestedAction: 'Redefinir escopo de estabilização e explicitar o plano de mitigação.',
        status: 'triggered'
      },
      result: {
        phaseScore: 58,
        mastery: 56,
        xpAwarded: 18,
        badgeSummary: 'Sem nova badge nesta rodada.'
      },
      progression: {
        nextFocus: 'Reforçar leitura de risco operacional',
        recommendation: 'Reduza pressão e recupere confiança antes de buscar novo ganho de velocidade.'
      }
    }),
    'choice-21': buildDecisionOutcome({
      choiceId: 'choice-21',
      label: 'Centralizar narrativa com comitê reduzido',
      qualityScore: 87,
      narrative: 'A decisão concentrou a comunicação executiva, elevou alinhamento e reduziu dispersão política.',
      delta: { stakeholder_trust: 9, team_alignment: 8, execution_risk: -5 },
      worldAfter: {
        tension_level: 48,
        stakeholder_trust: 77,
        budget: 61,
        morale: 67,
        time_pressure: 68,
        learning_confidence: 64,
        team_alignment: 78,
        market_perception: 63,
        execution_risk: 43
      },
      twist: {
        id: 'twist-21',
        title: 'Conselho pede narrativa única em 30 minutos',
        narrative: 'O conselho antecipou o checkpoint e exigiu uma narrativa única com trade-offs explícitos.',
        suggestedAction: 'Sintetizar a mensagem central e assumir os limites da decisão diante do conselho.',
        status: 'triggered'
      },
      result: {
        phaseScore: 87,
        mastery: 81,
        xpAwarded: 47,
        badgeSummary: 'Badge desbloqueada: executive-alignment'
      },
      progression: {
        nextFocus: 'Consolidar comunicação executiva em ambientes de alta pressão',
        recommendation: 'Mantenha a narrativa unificada e amplie repertório para checkpoints ainda mais curtos.'
      }
    }),
    'choice-22': buildDecisionOutcome({
      choiceId: 'choice-22',
      label: 'Distribuir porta-vozes sem narrativa única',
      qualityScore: 54,
      narrative: 'A decisão acelerou a exposição externa, mas fragmentou a mensagem e aumentou ruído político.',
      delta: { stakeholder_trust: -8, team_alignment: -6, execution_risk: 11 },
      worldAfter: {
        tension_level: 62,
        stakeholder_trust: 60,
        budget: 61,
        morale: 57,
        time_pressure: 79,
        learning_confidence: 53,
        team_alignment: 58,
        market_perception: 50,
        execution_risk: 59
      },
      twist: {
        id: 'twist-22',
        title: 'Dissonância pública entre áreas',
        narrative: 'Porta-vozes divergentes expuseram versões conflitantes e elevaram a tensão política.',
        suggestedAction: 'Reunificar a mensagem e redistribuir papéis antes do próximo contato externo.',
        status: 'triggered'
      },
      result: {
        phaseScore: 54,
        mastery: 52,
        xpAwarded: 16,
        badgeSummary: 'Sem nova badge nesta rodada.'
      },
      progression: {
        nextFocus: 'Recuperar coerência narrativa entre áreas',
        recommendation: 'Reduza a fragmentação e volte a explicitar uma linha única de comunicação.'
      }
    }),
    'choice-31': buildDecisionOutcome({
      choiceId: 'choice-31',
      label: 'Criar war room com mensagem única e checkpoints curtos',
      qualityScore: 91,
      narrative: 'A decisão alinhou liderança, parceiros e operação em uma cadência única, reduzindo ruído e fortalecendo governança.',
      delta: { stakeholder_trust: 10, team_alignment: 9, execution_risk: -7, market_perception: 8 },
      worldAfter: {
        tension_level: 44,
        stakeholder_trust: 82,
        budget: 61,
        morale: 71,
        time_pressure: 66,
        learning_confidence: 68,
        team_alignment: 83,
        market_perception: 72,
        execution_risk: 39
      },
      twist: {
        id: 'twist-31',
        title: 'Parceiro exige pronunciamento conjunto imediato',
        narrative: 'Um parceiro crítico condicionou apoio público a uma mensagem conjunta nas próximas horas.',
        suggestedAction: 'Consolidar os limites da resposta e alinhar portavozes em um único roteiro executivo.',
        status: 'triggered'
      },
      result: {
        phaseScore: 91,
        mastery: 86,
        xpAwarded: 52,
        badgeSummary: 'Badge desbloqueada: crisis-orchestrator'
      },
      progression: {
        nextFocus: 'Consolidar governança contínua entre liderança e parceiros',
        recommendation: 'Transforme a cadência de crise em ritual de governança para preservar alinhamento no pós-incidente.'
      }
    }),
    'choice-32': buildDecisionOutcome({
      choiceId: 'choice-32',
      label: 'Responder por frentes separadas com autonomia local',
      qualityScore: 57,
      narrative: 'A resposta distribuiu autonomia rapidamente, mas gerou inconsistências externas e ampliou a fricção entre parceiros.',
      delta: { stakeholder_trust: -6, team_alignment: -7, execution_risk: 12, market_perception: -5 },
      worldAfter: {
        tension_level: 63,
        stakeholder_trust: 59,
        budget: 61,
        morale: 56,
        time_pressure: 81,
        learning_confidence: 54,
        team_alignment: 57,
        market_perception: 52,
        execution_risk: 62
      },
      twist: {
        id: 'twist-32',
        title: 'Parceiros divergem em público sobre a estratégia',
        narrative: 'Mensagens desalinhadas entre parceiros amplificaram a percepção de crise e reduziram confiança no comando.',
        suggestedAction: 'Recentralizar a coordenação, explicitar papéis e suspender falas paralelas até nova convergência.',
        status: 'triggered'
      },
      result: {
        phaseScore: 57,
        mastery: 55,
        xpAwarded: 17,
        badgeSummary: 'Sem nova badge nesta rodada.'
      },
      progression: {
        nextFocus: 'Restabelecer comando único com parceiros externos',
        recommendation: 'Recupere alinhamento antes de ampliar autonomia para evitar escalada de inconsistência pública.'
      }
    }),
    'choice-41': buildDecisionOutcome({
      choiceId: 'choice-41',
      label: 'Publicar marcos de governança com cadência executiva e indicadores compartilhados',
      qualityScore: 89,
      narrative: 'A decisão transformou a recuperação em rotina observável, elevando previsibilidade e confiança de mercado sem reabrir tensão interna.',
      delta: { stakeholder_trust: 9, market_perception: 10, execution_risk: -6, team_alignment: 6 },
      worldAfter: {
        tension_level: 41,
        stakeholder_trust: 84,
        budget: 61,
        morale: 73,
        time_pressure: 63,
        learning_confidence: 70,
        team_alignment: 85,
        market_perception: 78,
        execution_risk: 36
      },
      twist: {
        id: 'twist-41',
        title: 'Analistas antecipam escrutínio público sobre a consistência da recuperação',
        narrative: 'A nova cadência chamou atenção do mercado e elevou a exigência por evidências públicas de execução.',
        suggestedAction: 'Amarrar indicadores, narrativa executiva e rituais de acompanhamento em um mesmo quadro público.',
        status: 'triggered'
      },
      result: {
        phaseScore: 89,
        mastery: 84,
        xpAwarded: 49,
        badgeSummary: 'Badge desbloqueada: market-recovery'
      },
      progression: {
        nextFocus: 'Escalar governança com evidência contínua de execução',
        recommendation: 'Converta os rituais de recuperação em governança permanente com indicadores públicos e checkpoints executivos curtos.'
      }
    }),
    'choice-42': buildDecisionOutcome({
      choiceId: 'choice-42',
      label: 'Comunicar retomada ampla sem ritual operacional estável',
      qualityScore: 55,
      narrative: 'A narrativa de retomada ganhou velocidade, mas ficou sem lastro operacional suficiente e reacendeu dúvidas sobre consistência.',
      delta: { stakeholder_trust: -5, market_perception: 3, execution_risk: 10, team_alignment: -4 },
      worldAfter: {
        tension_level: 58,
        stakeholder_trust: 61,
        budget: 61,
        morale: 59,
        time_pressure: 76,
        learning_confidence: 57,
        team_alignment: 60,
        market_perception: 64,
        execution_risk: 58
      },
      twist: {
        id: 'twist-42',
        title: 'Mercado questiona a sustentação da retomada',
        narrative: 'A comunicação avançou mais rápido do que a disciplina operacional, o que abriu espaço para novo escrutínio externo.',
        suggestedAction: 'Reduzir a promessa pública e reconstruir a base operacional antes de ampliar a exposição.',
        status: 'triggered'
      },
      result: {
        phaseScore: 55,
        mastery: 53,
        xpAwarded: 16,
        badgeSummary: 'Sem nova badge nesta rodada.'
      },
      progression: {
        nextFocus: 'Reconstruir prova operacional antes de ampliar narrativa externa',
        recommendation: 'Reforce a cadência interna e recupere evidências de consistência antes de prometer escala ao mercado.'
      }
    }),
    'choice-51': buildDecisionOutcome({
      choiceId: 'choice-51',
      label: 'Orquestrar rituais integrados com métricas comuns e revisão executiva cruzada',
      qualityScore: 93,
      narrative: 'A decisão escalou a governança com disciplina comum entre frentes, consolidando confiança institucional e reduzindo assimetrias de execução.',
      delta: { stakeholder_trust: 11, market_perception: 9, execution_risk: -8, team_alignment: 8 },
      worldAfter: {
        tension_level: 38,
        stakeholder_trust: 87,
        budget: 61,
        morale: 76,
        time_pressure: 60,
        learning_confidence: 73,
        team_alignment: 88,
        market_perception: 81,
        execution_risk: 33
      },
      twist: {
        id: 'twist-51',
        title: 'Parceiro-chave antecipa auditoria conjunta da nova cadência institucional',
        narrative: 'A expansão chamou atenção do ecossistema e exigiu prova imediata de coerência entre revisão executiva e execução distribuída.',
        suggestedAction: 'Conectar métricas, responsabilização e trilhas de decisão em um ritual comum auditável por toda a rede crítica.',
        status: 'triggered'
      },
      result: {
        phaseScore: 93,
        mastery: 88,
        xpAwarded: 55,
        badgeSummary: 'Badge desbloqueada: systemic-leadership'
      },
      progression: {
        nextFocus: 'Preservar resiliência institucional com auditoria contínua da governança',
        recommendation: 'Congele o aprendizado em rituais auditáveis e mantenha revisão cruzada para evitar regressão de consistência na escala.'
      }
    }),
    'choice-52': buildDecisionOutcome({
      choiceId: 'choice-52',
      label: 'Expandir autonomia de escala sem revisão institucional compartilhada',
      qualityScore: 56,
      narrative: 'A escala avançou rápido, mas sem revisão institucional comum surgiram assimetrias de execução e sinais de fragilidade sistêmica.',
      delta: { stakeholder_trust: -6, market_perception: 2, execution_risk: 11, team_alignment: -5 },
      worldAfter: {
        tension_level: 57,
        stakeholder_trust: 63,
        budget: 61,
        morale: 60,
        time_pressure: 74,
        learning_confidence: 59,
        team_alignment: 62,
        market_perception: 66,
        execution_risk: 57
      },
      twist: {
        id: 'twist-52',
        title: 'A rede expõe critérios divergentes de governança em plena expansão',
        narrative: 'A ausência de revisão compartilhada gerou critérios conflitantes entre frentes e reabriu risco institucional.',
        suggestedAction: 'Suspender a expansão assimétrica e recentralizar a cadência crítica antes de retomar escala.',
        status: 'triggered'
      },
      result: {
        phaseScore: 56,
        mastery: 54,
        xpAwarded: 17,
        badgeSummary: 'Sem nova badge nesta rodada.'
      },
      progression: {
        nextFocus: 'Reunificar revisão institucional antes de ampliar escala',
        recommendation: 'Retome a revisão cruzada e reduza assimetria decisória antes de expandir a governança para toda a rede.'
      }
    })
  };
}

function resolveMissionForChapter(runtime, chapterId) {
  return runtime?.campaign?.chapters
    ?.find((chapter) => chapter.id === chapterId)
    ?.phases?.find((phase) => phase.id === 'mission')
    ?.content?.mission || runtime?.mission || null;
}

export function buildCompetencyDashboard() {
  return {
    strengths: [{
      id: 'c1',
      name: 'Tomada de decisão',
      metrics: { mastery: 78, confidence: 74, consistency: 71, growth: 9 },
      trend: { direction: 'up' }
    }],
    focus: [{
      id: 'c2',
      name: 'Consistência',
      metrics: { mastery: 51, confidence: 56, consistency: 49, growth: 6 },
      recommendation: 'Repetir ciclos curtos com checagem explícita de trade-offs.'
    }],
    items: [
      {
        id: 'c1',
        name: 'Tomada de decisão',
        level: 'Avançado',
        metrics: { mastery: 78, confidence: 74, consistency: 71, growth: 9 },
        evidence: { direct: 4, inferred: 6 },
        recommendation: 'Manter o critério sob pressão e ampliar repertório em cenários ambíguos.'
      },
      {
        id: 'c2',
        name: 'Consistência',
        level: 'Intermediário',
        metrics: { mastery: 51, confidence: 56, consistency: 49, growth: 6 },
        evidence: { direct: 2, inferred: 5 },
        recommendation: 'Reforçar rotina de validação antes de escalar a decisão.'
      }
    ],
    summary: {
      averageMastery: 65,
      averageConfidence: 63,
      averageConsistency: 60
    }
  };
}

export function buildJourneySummary() {
  return {
    adaptive: {
      persona: 'lider iniciante',
      goal: 'desenvolver habilidade',
      scenarios: [{ title: 'Cenario 1' }]
    }
  };
}

export function buildEvolution() {
  return {
    competencies: [
      { id: 'ucs-1', competencyId: 'assertividade', score: 70, level: 'intermediario' },
      { id: 'ucs-2', competencyId: 'consistencia', score: 52, level: 'intermediario' }
    ],
    decisionHistory: [
      { id: 'd1', title: 'Segmentar rollout', feedbackText: 'A decisão reduziu risco com boa leitura de stakeholder.' },
      { id: 'd2', title: 'Reforçar comunicação executiva', feedbackText: 'A leitura executiva ganhou consistência.' }
    ],
    progression: {
      progressPercent: 64,
      adaptiveDifficulty: 'medium',
      nextRecommendation: {
        focus: 'tomada de decisao',
        difficulty: 'medium',
        rationale: 'continue evoluindo'
      }
    }
  };
}

export function buildAdaptiveJourneyRuntime() {
  return {
    journeyId: 'adaptive-1',
    status: 'active',
    mentorPreset: { id: 'analitico', promptStyle: 'Leitura objetiva com foco em trade-offs e evidências.' },
    currentChapter: {
      id: 'adaptive-chapter-1',
      type: 'contexto',
      title: 'Capítulo de negociação consultiva',
      description: 'Explorar critérios de negociação em contexto de pressão moderada.',
      pedagogicalObjective: 'Fortalecer negociação adaptativa com evidências.',
      reasoning: 'Capítulo escolhido pelo backend com base no gap dominante e no histórico recente.',
      cycle: {
        context: 'Um cliente estratégico pressiona por concessão imediata.',
        challenge: 'Responder sem perder margem de negociação.',
        decisionOptions: ['Explorar interesses antes de conceder', 'Conceder desconto imediato'],
        reflectionPrompt: 'Qual trade-off foi assumido para preservar valor e relação?'
      }
    },
    progress: {
      completedChapters: 2,
      estimatedChapterCount: 5,
      canClose: false,
      competency: {
        name: 'Negociação adaptativa',
        score: 68,
        targetScore: 80,
        consistency: 61,
        minimumConsistency: 70,
        evidenceCount: 4,
        minimumEvidenceCount: 6,
        proficiencyLevel: 'intermediario'
      },
      closureRequirements: ['Aumentar consistência', 'Gerar mais evidências diretas']
    }
  };
}

export async function installCommonRoutes(page, options = {}) {
  let currentJourneyRuntime = options.journeyRuntime || buildJourneyRuntime();
  let currentEngineRuntime = buildEngineRuntime();
  let currentAdaptiveRuntime = options.adaptiveRuntime || buildAdaptiveJourneyRuntime();
  const competencyDashboard = buildCompetencyDashboard();
  const journeySummary = options.journeySummary || buildJourneySummary();
  const evolution = options.evolution || buildEvolution();
  const decisionOutcomes = options.decisionOutcomes || buildDecisionOutcomes();
  const {
    unauthorizedOnAuthMe = false,
    adaptiveRuntimeFails = false,
    competencyRequestFails = false,
    journeyRuntimeFails = false,
    engineRuntimeFails = false,
    startPhaseFails = false,
    finalizeFails = false
  } = options;

  await page.route('**/api/auth/login', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        token: 'token-e2e',
        user: { id: 'user-e2e', email: 'admin@aprende.ai', roleCode: 'admin' }
      })
    });
  });

  await page.route('**/api/auth/me', async (route) => {
    if (unauthorizedOnAuthMe) {
      await route.fulfill({
        status: 401,
        contentType: 'text/plain',
        body: 'Sessao expirada'
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        user: { id: 'user-e2e', email: 'admin@aprende.ai', roleCode: 'admin' }
      })
    });
  });

  await page.route('**/api/journey/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(journeySummary)
    });
  });

  await page.route('**/api/evolution/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(evolution)
    });
  });

  await page.route('**/api/journey-runtime', async (route) => {
    if (journeyRuntimeFails) {
      await route.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: 'Falha ao carregar runtime da jornada.'
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(currentJourneyRuntime)
    });
  });

  await page.route('**/api/journey-adaptive/runtime', async (route) => {
    if (adaptiveRuntimeFails) {
      await route.fulfill({
        status: 404,
        contentType: 'text/plain',
        body: 'Sessão adaptativa ainda não iniciada'
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(currentAdaptiveRuntime)
    });
  });

  await page.route('**/api/journey-adaptive/history', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        executions: [
          {
            id: 'execution-1',
            chapterType: 'contexto',
            selectedOption: 'Explorar interesses antes de conceder',
            result: { scoreDelta: 6 },
            actionTaken: { kind: 'continue' }
          }
        ]
      })
    });
  });

  await page.route('**/api/journey-adaptive/explanations', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        reinforcement: [{ reason: 'Consistência ainda abaixo do mínimo para encerramento.' }],
        acceleration: [],
        closure: []
      })
    });
  });

  await page.route('**/api/journey-adaptive/current-chapter', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(currentAdaptiveRuntime.currentChapter)
    });
  });

  await page.route('**/api/journey-runtime/campaign-progress', async (route) => {
    const body = route.request().postDataJSON();
    currentJourneyRuntime = {
      ...currentJourneyRuntime,
      mission: currentJourneyRuntime.campaign?.chapters
        ?.find((chapter) => chapter.id === body.chapterId)
        ?.phases?.find((phase) => phase.id === 'mission')
        ?.content?.mission || currentJourneyRuntime.mission,
      journey: {
        ...currentJourneyRuntime.journey,
        campaignProgress: body
      }
    };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        campaignProgress: body,
        runtime: currentJourneyRuntime
      })
    });
  });

  await page.route('**/api/journey-engine/runtime', async (route) => {
    if (engineRuntimeFails) {
      await route.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: 'Falha ao carregar o runtime do journey engine.'
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(currentEngineRuntime)
    });
  });

  await page.route('**/api/journey-engine/phases/*/start', async (route) => {
    if (startPhaseFails) {
      await route.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: 'Falha ao iniciar a fase atual.'
      });
      return;
    }

    const phaseId = route.request().url().split('/phases/')[1].split('/start')[0];
    const body = route.request().postDataJSON();
    currentEngineRuntime = {
      ...currentEngineRuntime,
      activePhaseId: phaseId,
      mission: resolveMissionForChapter(currentJourneyRuntime, body.chapterId)
    };
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        startedPhase: { id: phaseId },
        runtime: currentEngineRuntime
      })
    });
  });

  await page.route('**/api/journey-engine/decision', async (route) => {
    const body = route.request().postDataJSON();
    const selectedOutcome = decisionOutcomes[body.choiceId] || decisionOutcomes['choice-1'];
    currentEngineRuntime = {
      ...currentEngineRuntime,
      ...selectedOutcome.runtime,
      worldState: selectedOutcome.consequence.worldAfter,
      mission: resolveMissionForChapter(currentJourneyRuntime, body.chapterId)
    };
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        decision: selectedOutcome.decision,
        consequence: selectedOutcome.consequence,
        runtime: currentEngineRuntime
      })
    });
  });

  await page.route('**/api/journey-engine/twist/resolve', async (route) => {
    const activeTwist = currentEngineRuntime.latestTwist || {
      id: 'twist-1',
      title: 'Stakeholder exige antecipação do comunicado',
      narrative: 'Um stakeholder estratégico mudou a pressão política da fase.',
      status: 'triggered'
    };
    currentEngineRuntime = {
      ...currentEngineRuntime,
      activePhaseId: 'reflection',
      latestTwist: {
        ...activeTwist,
        status: 'resolved'
      }
    };
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        resolvedTwist: { id: activeTwist.id, status: 'resolved' },
        runtime: currentEngineRuntime
      })
    });
  });

  await page.route('**/api/journey-engine/reflection', async (route) => {
    const requestBody = route.request().postDataJSON();
    currentEngineRuntime = {
      ...currentEngineRuntime,
      activePhaseId: 'phase-result',
      reflection: {
        text: requestBody.reflectionText,
        prompt: 'O que esta decisão ensinou sobre seu critério sob pressão?'
      }
    };
    await route.fulfill({
      status: 201,
      contentType: 'application/json',
      body: JSON.stringify({
        reflection: {
          text: requestBody.reflectionText,
          prompt: 'O que esta decisão ensinou sobre seu critério sob pressão?'
        },
        runtime: currentEngineRuntime
      })
    });
  });

  await page.route('**/api/journey-engine/finalize', async (route) => {
    if (finalizeFails) {
      await route.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: 'Falha ao finalizar a fase.'
      });
      return;
    }

    currentEngineRuntime = {
      ...currentEngineRuntime,
      activePhaseId: 'progression'
    };

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        result: currentEngineRuntime.result,
        progression: currentEngineRuntime.progression,
        runtime: currentEngineRuntime
      })
    });
  });

  await page.route('**/api/journey-engine/competencies', async (route) => {
    if (competencyRequestFails) {
      await route.fulfill({
        status: 500,
        contentType: 'text/plain',
        body: 'Falha no dashboard de competências'
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(competencyDashboard)
    });
  });
}

export async function loginAsAdmin(page, expectedUrl = /\/campaign\/capitulo-1\/briefing/) {
  await page.goto('/login');
  await page.getByLabel('E-mail').fill('admin@aprende.ai');
  await page.getByLabel('Senha').fill('admin123');
  await page.getByRole('button', { name: 'Entrar' }).click();
  await expect(page).toHaveURL(expectedUrl);
}