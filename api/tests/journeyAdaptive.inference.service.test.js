import {
  inferAdaptiveJourneyPlan,
  validateJourneyPlanSuggestion
} from '../modules/journey-adaptive/journey-adaptive.inference.service.js';
import { ADAPTIVE_FRAMEWORK } from '../modules/journey-adaptive/journey-adaptive.constants.js';

function buildContext(overrides = {}) {
  return {
    targetCompetencyCode: 'negociacao_adaptativa',
    frameworkCompetency: ADAPTIVE_FRAMEWORK.competencies.negociacao_adaptativa,
    learnerProfile: {
      contextType: 'b2b',
      experienceLevel: 'intermediate',
      currentLevel: 'intermediario',
      area: 'vendas complexas'
    },
    learningGoal: {
      goalType: 'improve_performance',
      title: 'Melhorar margem em negociação'
    },
    learningProfile: 'analitico',
    diagnosis: {
      baselineScore: 52,
      confidence: 48,
      consistency: 44,
      errorPatterns: ['cede_valor_central']
    },
    historicalSignals: {
      stagnationCount: 0
    },
    ...overrides
  };
}

describe('journey-adaptive inference service', () => {
  test('inferência inicial pode fechar plano curto de 4 capítulos para aluno com domínio alto', async () => {
    const plan = await inferAdaptiveJourneyPlan(buildContext({
      learnerProfile: {
        contextType: 'lideranca',
        experienceLevel: 'advanced',
        currentLevel: 'avancado'
      },
      diagnosis: {
        baselineScore: 88,
        confidence: 82,
        consistency: 79,
        successPatterns: ['criterio_estavel']
      }
    }));

    expect(plan.estimatedChapterCount).toBe(4);
    expect(plan.journeyPlan).toHaveLength(4);
    expect(plan.journeyPlan[0].type).toBe('diagnostico');
    expect(plan.journeyPlan.at(-1).type).toBe('consolidacao');
  });

  test('inferência inicial expande para 10 capítulos quando há baixa base e estagnação', async () => {
    const plan = await inferAdaptiveJourneyPlan(buildContext({
      learnerProfile: {
        contextType: 'b2b',
        experienceLevel: 'beginner',
        currentLevel: 'iniciante'
      },
      learningProfile: 'narrativo',
      diagnosis: {
        baselineScore: 35,
        confidence: 32,
        consistency: 30,
        errorPatterns: ['cede_valor_central', 'ignora_stakeholder']
      },
      historicalSignals: {
        stagnationCount: 2
      }
    }));

    expect(plan.estimatedChapterCount).toBe(10);
    expect(plan.journeyPlan).toHaveLength(10);
    expect(plan.journeyPlan.some((item) => item.type === 'reforco')).toBe(true);
  });

  test('adapta a composição para perfil narrativo com crise e contexto', async () => {
    const plan = await inferAdaptiveJourneyPlan(buildContext({
      learningProfile: 'narrativo',
      learningGoal: {
        goalType: 'prepare_challenge',
        title: 'Preparar negociação difícil'
      },
      diagnosis: {
        baselineScore: 57,
        confidence: 50,
        consistency: 48
      }
    }));

    expect(plan.learningStrategy).toBe('narrativo_prepare_challenge');
    expect(plan.journeyPlan.some((item) => item.type === 'contexto')).toBe(true);
    expect(plan.journeyPlan.some((item) => item.type === 'crise')).toBe(true);
  });

  test('adapta a composição para perfil analítico com diagnóstico e simulação', async () => {
    const plan = await inferAdaptiveJourneyPlan(buildContext({
      learningProfile: 'analitico',
      diagnosis: {
        baselineScore: 63,
        confidence: 58,
        consistency: 54
      }
    }));

    expect(plan.learningStrategy).toBe('analitico_improve_performance');
    expect(plan.journeyPlan[0].type).toBe('diagnostico');
    expect(plan.journeyPlan.some((item) => item.type === 'simulacao')).toBe(true);
  });

  test('adapta por meta e perfil de usuário compatibilizando capítulos b2b', () => {
    const validated = validateJourneyPlanSuggestion(buildContext({
      learningGoal: {
        goalType: 'prepare_challenge'
      },
      learnerProfile: {
        contextType: 'b2b',
        experienceLevel: 'intermediate'
      }
    }), {
      estimatedChapterCount: 5,
      learningStrategy: 'analitico_prepare_challenge',
      journeyPlan: [
        { chapterBaseId: 'contexto-negociacao-02', reason: 'stakeholders b2b', priority: 1 },
        { chapterBaseId: 'sim-negociacao-04', reason: 'teste sob pressao', priority: 2 }
      ],
      reinforcementPolicy: { insertIfStagnation: true, stagnationThreshold: 2 },
      accelerationPolicy: { allowEarlyClosure: true, minimumConsistentSuccesses: 2 },
      meta: { source: 'test' }
    });

    expect(validated.journeyPlan.some((item) => item.chapterBaseId === 'contexto-negociacao-02')).toBe(true);
    expect(validated.journeyPlan[0].type).toBe('diagnostico');
    expect(validated.journeyPlan.at(-1).type).toBe('consolidacao');
  });
});
