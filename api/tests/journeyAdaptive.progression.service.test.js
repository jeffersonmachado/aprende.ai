import {
  createCompetencyProgressState,
  decideAdaptiveJourneyAction,
  evaluateAdaptiveChapter,
  validateClosureEligibility
} from '../modules/journey-adaptive/journey-adaptive.progression.service.js';
import { ADAPTIVE_FRAMEWORK } from '../modules/journey-adaptive/journey-adaptive.constants.js';
import { ADAPTIVE_CHAPTER_LIBRARY } from '../modules/journey-adaptive/journey-adaptive.fixtures.js';

const competency = ADAPTIVE_FRAMEWORK.competencies.negociacao_adaptativa;

function buildActiveJourney(overrides = {}) {
  return {
    id: 'journey-1',
    competencyCode: competency.code,
    completedExecutions: [],
    accelerationPolicy: { allowEarlyClosure: true, minimumConsistentSuccesses: 2 },
    ...overrides
  };
}

describe('journey-adaptive progression service', () => {
  test('gera scoreDelta, evidência e mentoria por capítulo', () => {
    const chapter = ADAPTIVE_CHAPTER_LIBRARY.find((item) => item.id === 'desafio-negociacao-03');
    const progress = createCompetencyProgressState(competency, { baselineScore: 50, confidence: 45, consistency: 44 });

    const result = evaluateAdaptiveChapter({
      chapter,
      competency,
      learningProfile: 'pratico',
      currentProgress: progress,
      payload: {
        selectedOption: 'reduzir escopo e manter preço',
        responseText: 'Preservo margem central e troco escopo por valor percebido.',
        outcome: {
          scoreHint: 78,
          confidenceHint: 74,
          successTags: ['tradeoff_explicito'],
          errorTags: []
        }
      }
    });

    expect(result.scoreDelta).toBeGreaterThan(0);
    expect(result.evidenceGenerated.chapterType).toBe('desafio');
    expect(result.mentorFeedback).toContain('Próximo ajuste objetivo');
    expect(result.updatedProgress.evidenceCount).toBe(1);
  });

  test('insere reforço automaticamente quando há estagnação ou erro recorrente', () => {
    const chapter = ADAPTIVE_CHAPTER_LIBRARY.find((item) => item.id === 'desafio-negociacao-03');
    const progress = {
      ...createCompetencyProgressState(competency, { baselineScore: 45, confidence: 40, consistency: 38, errorPatterns: ['cede_valor_central'] }),
      history: [
        { scoreHint: 50, errorTags: ['cede_valor_central'] },
        { scoreHint: 48, errorTags: ['cede_valor_central'] }
      ],
      recurringErrors: ['cede_valor_central', 'cede_valor_central']
    };
    const evaluation = evaluateAdaptiveChapter({
      chapter,
      competency,
      learningProfile: 'analitico',
      currentProgress: progress,
      payload: {
        selectedOption: 'ceder desconto imediato',
        outcome: {
          scoreHint: 44,
          errorTags: ['cede_valor_central']
        }
      }
    });

    const action = decideAdaptiveJourneyAction({
      activeJourney: buildActiveJourney(),
      competency,
      currentChapter: chapter,
      evaluation
    });

    expect(action.kind).toBe('insert_reinforcement');
    expect(action.reason).toContain('Erro recorrente');
  });

  test('encerra mais cedo quando há domínio consistente em capítulos críticos', () => {
    const chapter = ADAPTIVE_CHAPTER_LIBRARY.find((item) => item.id === 'cons-negociacao-08');
    const progress = {
      ...createCompetencyProgressState(competency, { baselineScore: 72, confidence: 70, consistency: 69 }),
      score: 80,
      consistency: 72,
      confidence: 74,
      evidenceCount: 3,
      diverseEvidenceTypes: ['diagnostico', 'desafio', 'simulacao'],
      criticalChapterPerformance: { desafio: 78, simulacao: 82 },
      history: [
        { scoreHint: 76, errorTags: [] },
        { scoreHint: 81, errorTags: [] }
      ]
    };
    const evaluation = evaluateAdaptiveChapter({
      chapter,
      competency,
      learningProfile: 'analitico',
      currentProgress: progress,
      payload: {
        selectedOption: 'aplicar o mesmo critério com adaptação explícita',
        outcome: {
          scoreHint: 88,
          successTags: ['criterio_transferivel']
        }
      }
    });

    const action = decideAdaptiveJourneyAction({
      activeJourney: buildActiveJourney({ completedExecutions: [{ id: '1' }, { id: '2' }, { id: '3' }] }),
      competency,
      currentChapter: chapter,
      evaluation
    });

    expect(action.kind).toBe('accelerate');
  });

  test('bloqueia encerramento sem evidência suficiente', () => {
    const progress = {
      ...createCompetencyProgressState(competency, { baselineScore: 70, confidence: 68, consistency: 67 }),
      score: 84,
      consistency: 74,
      evidenceCount: 2,
      diverseEvidenceTypes: ['diagnostico', 'desafio'],
      criticalChapterPerformance: { desafio: 79, simulacao: 81 }
    };

    const closure = validateClosureEligibility(progress, competency);

    expect(closure.eligible).toBe(false);
    expect(closure.reasons).toContain('evidências 2/3');
  });
});
