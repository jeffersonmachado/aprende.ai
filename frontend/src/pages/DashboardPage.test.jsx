import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true };

const getJourneySummaryMock = vi.fn();
const getEvolutionMock = vi.fn();
const getAdaptiveJourneyRuntimeMock = vi.fn();

vi.mock('../services/journeyApi.js', () => ({
  getJourneySummary: (...args) => getJourneySummaryMock(...args)
}));

vi.mock('../services/journeyAdaptiveApi.js', () => ({
  getAdaptiveJourneyRuntime: (...args) => getAdaptiveJourneyRuntimeMock(...args)
}));

vi.mock('../services/simulationApi.js', () => ({
  getEvolution: (...args) => getEvolutionMock(...args)
}));

import DashboardPage from './DashboardPage.jsx';

function renderPage() {
  return render(
    <MemoryRouter future={routerFuture}>
      <DashboardPage />
    </MemoryRouter>
  );
}

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('carrega visão pedagógica com progresso e competências', async () => {
    getJourneySummaryMock.mockResolvedValueOnce({
      adaptive: {
        persona: 'lider iniciante',
        goal: 'desenvolver habilidade',
        scenarios: [{ title: 'Cenario 1' }]
      }
    });

    getEvolutionMock.mockResolvedValueOnce({
      competencies: [{ id: 'ucs-1', competencyId: 'assertividade', score: 70, level: 'intermediario' }],
      decisionHistory: [{ id: 'd1' }, { id: 'd2' }],
      progression: {
        progressPercent: 64,
        adaptiveDifficulty: 'medium',
        nextRecommendation: {
          focus: 'tomada de decisao',
          difficulty: 'medium',
          rationale: 'continue evoluindo'
        }
      }
    });

    getAdaptiveJourneyRuntimeMock.mockResolvedValueOnce({
      journeyId: 'adaptive-1',
      status: 'active',
      mentorPreset: { id: 'analitico' },
      currentChapter: { title: 'Capítulo de negociação consultiva' },
      progress: {
        completedChapters: 2,
        estimatedChapterCount: 5,
        canClose: false,
        competency: {
          name: 'Negociação adaptativa',
          score: 68,
          targetScore: 80
        }
      }
    });

    renderPage();

    expect(await screen.findByText('Seu dashboard de aprendizagem')).toBeInTheDocument();
    expect(await screen.findByText('64%')).toBeInTheDocument();
    expect(await screen.findByText('Concluída')).toBeInTheDocument();
    expect(await screen.findByText('Analista de Cenarios')).toBeInTheDocument();
    expect(await screen.findByText('Resumo da jornada adaptativa')).toBeInTheDocument();
    expect(await screen.findByText('Negociação adaptativa')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Abrir jornada adaptativa' })).toHaveAttribute('href', '/adaptive-journey');
  });

  test('degrada sem erro quando não existe jornada adaptativa ativa', async () => {
    getJourneySummaryMock.mockResolvedValueOnce({ adaptive: { persona: 'perfil em construção', goal: 'desenvolver habilidade', scenarios: [] } });
    getEvolutionMock.mockResolvedValueOnce({
      competencies: [],
      decisionHistory: [],
      progression: {
        progressPercent: 12,
        adaptiveDifficulty: 'medium',
        nextRecommendation: {
          focus: 'primeira decisão',
          difficulty: 'medium',
          rationale: 'inicie a jornada principal'
        }
      }
    });
    getAdaptiveJourneyRuntimeMock.mockRejectedValueOnce(new Error('Sessão adaptativa ainda não iniciada'));

    renderPage();

    expect(await screen.findByText('Sem jornada adaptativa ativa')).toBeInTheDocument();
    expect(screen.queryByText('Sessão adaptativa ainda não iniciada')).not.toBeInTheDocument();
  });

  test('mostra erro quando carregamento falha', async () => {
    getJourneySummaryMock.mockRejectedValueOnce(new Error('Falha no dashboard'));
    getEvolutionMock.mockResolvedValueOnce({});
    getAdaptiveJourneyRuntimeMock.mockResolvedValueOnce(null);

    renderPage();

    expect(await screen.findByText('Falha no dashboard')).toBeInTheDocument();
  });
});
