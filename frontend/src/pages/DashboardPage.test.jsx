import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const getJourneySummaryMock = vi.fn();
const getEvolutionMock = vi.fn();

vi.mock('../services/journeyApi.js', () => ({
  getJourneySummary: (...args) => getJourneySummaryMock(...args)
}));

vi.mock('../services/simulationApi.js', () => ({
  getEvolution: (...args) => getEvolutionMock(...args)
}));

import DashboardPage from './DashboardPage.jsx';

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

    render(<DashboardPage />);

    expect(await screen.findByText('Seu dashboard de aprendizagem')).toBeInTheDocument();
    expect(screen.getByText('64%')).toBeInTheDocument();
    expect(screen.getByText('Concluida')).toBeInTheDocument();
    expect(screen.getByText('Analista de Cenarios')).toBeInTheDocument();
  });

  test('mostra erro quando carregamento falha', async () => {
    getJourneySummaryMock.mockRejectedValueOnce(new Error('Falha no dashboard'));
    getEvolutionMock.mockResolvedValueOnce({});

    render(<DashboardPage />);

    expect(await screen.findByText('Falha no dashboard')).toBeInTheDocument();
  });
});
