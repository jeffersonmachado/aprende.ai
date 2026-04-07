export const ADAPTIVE_RUNTIME_VERSION = 'journey-adaptive.v1';
export const ADAPTIVE_FRAMEWORK_VERSION = 'adaptive-framework.v1';

export const ADAPTIVE_CHAPTER_TYPES = [
  'diagnostico',
  'contexto',
  'desafio',
  'simulacao',
  'crise',
  'reflexao',
  'reforco',
  'consolidacao'
];

export const PROFICIENCY_LEVELS = [
  { id: 'iniciante', minScore: 0, maxScore: 44 },
  { id: 'intermediario', minScore: 45, maxScore: 69 },
  { id: 'avancado', minScore: 70, maxScore: 84 },
  { id: 'consolidado', minScore: 85, maxScore: 100 }
];

export const LEARNING_PROFILES = ['explorador', 'pratico', 'narrativo', 'analitico'];

export const MENTOR_PRESETS = {
  explorador: {
    id: 'explorador',
    tone: 'provocativo',
    direction: 'baixo',
    auditLabel: 'mentor.explorador',
    promptStyle: 'Faça perguntas abertas, desafie hipóteses e evite entregar a resposta final.'
  },
  pratico: {
    id: 'pratico',
    tone: 'objetivo',
    direction: 'alto',
    auditLabel: 'mentor.pratico',
    promptStyle: 'Priorize utilidade imediata, passos concretos e critérios observáveis de execução.'
  },
  narrativo: {
    id: 'narrativo',
    tone: 'contextual',
    direction: 'medio',
    auditLabel: 'mentor.narrativo',
    promptStyle: 'Conecte contexto, dilema, significado e implicações humanas antes de concluir.'
  },
  analitico: {
    id: 'analitico',
    tone: 'estruturado',
    direction: 'medio',
    auditLabel: 'mentor.analitico',
    promptStyle: 'Explique causalidade, métricas, trade-offs e critérios de validação.'
  }
};

export const ADAPTIVE_FRAMEWORK = {
  version: ADAPTIVE_FRAMEWORK_VERSION,
  lifecycle: ['contexto', 'desafio', 'decisao', 'consequencia', 'reflexao', 'avaliacao', 'ajuste'],
  allowedChapterTypes: ADAPTIVE_CHAPTER_TYPES,
  defaultPolicies: {
    reinforcement: {
      insertIfStagnation: true,
      stagnationThreshold: 2
    },
    acceleration: {
      allowEarlyClosure: true,
      minimumConsistentSuccesses: 2
    }
  },
  competencies: {
    negociacao_adaptativa: {
      code: 'negociacao_adaptativa',
      name: 'Negociação Adaptativa',
      proficiencyLevels: PROFICIENCY_LEVELS,
      scoreTarget: 78,
      minimalConsistency: 68,
      minimumEvidenceCount: 3,
      minimumDiverseEvidenceTypes: 3,
      minimumChapters: 4,
      maximumChapters: 10,
      requiredCriticalChapterTypes: ['desafio', 'simulacao'],
      reinforcementCriteria: {
        repeatedErrorThreshold: 2,
        lowPerformanceThreshold: 58,
        stagnationThreshold: 2
      },
      consolidationCriteria: {
        minimumRecentAverage: 72,
        requiredConsistentSuccesses: 2
      },
      closureCriteria: {
        scoreTarget: 78,
        consistencyTarget: 68,
        minimumEvidenceCount: 3
      },
      weightByChapterType: {
        diagnostico: 0.7,
        contexto: 0.75,
        desafio: 1.05,
        simulacao: 1.2,
        crise: 1.15,
        reflexao: 0.8,
        reforco: 0.9,
        consolidacao: 1.1
      },
      progressionCriteria: {
        prioritizeJudgement: true,
        allowAcceleration: true
      }
    },
    priorizacao_estrategica: {
      code: 'priorizacao_estrategica',
      name: 'Priorização Estratégica',
      proficiencyLevels: PROFICIENCY_LEVELS,
      scoreTarget: 76,
      minimalConsistency: 66,
      minimumEvidenceCount: 3,
      minimumDiverseEvidenceTypes: 3,
      minimumChapters: 4,
      maximumChapters: 10,
      requiredCriticalChapterTypes: ['diagnostico', 'desafio'],
      reinforcementCriteria: {
        repeatedErrorThreshold: 2,
        lowPerformanceThreshold: 56,
        stagnationThreshold: 2
      },
      consolidationCriteria: {
        minimumRecentAverage: 70,
        requiredConsistentSuccesses: 2
      },
      closureCriteria: {
        scoreTarget: 76,
        consistencyTarget: 66,
        minimumEvidenceCount: 3
      },
      weightByChapterType: {
        diagnostico: 0.75,
        contexto: 0.8,
        desafio: 1.1,
        simulacao: 1,
        crise: 1.15,
        reflexao: 0.75,
        reforco: 0.9,
        consolidacao: 1.05
      },
      progressionCriteria: {
        prioritizeJudgement: true,
        allowAcceleration: true
      }
    },
    comunicacao_influencia: {
      code: 'comunicacao_influencia',
      name: 'Comunicação de Influência',
      proficiencyLevels: PROFICIENCY_LEVELS,
      scoreTarget: 74,
      minimalConsistency: 64,
      minimumEvidenceCount: 3,
      minimumDiverseEvidenceTypes: 3,
      minimumChapters: 4,
      maximumChapters: 10,
      requiredCriticalChapterTypes: ['contexto', 'simulacao'],
      reinforcementCriteria: {
        repeatedErrorThreshold: 2,
        lowPerformanceThreshold: 55,
        stagnationThreshold: 2
      },
      consolidationCriteria: {
        minimumRecentAverage: 70,
        requiredConsistentSuccesses: 2
      },
      closureCriteria: {
        scoreTarget: 74,
        consistencyTarget: 64,
        minimumEvidenceCount: 3
      },
      weightByChapterType: {
        diagnostico: 0.7,
        contexto: 0.95,
        desafio: 1,
        simulacao: 1.1,
        crise: 1,
        reflexao: 0.85,
        reforco: 0.9,
        consolidacao: 1.05
      },
      progressionCriteria: {
        prioritizeJudgement: false,
        allowAcceleration: true
      }
    }
  }
};
