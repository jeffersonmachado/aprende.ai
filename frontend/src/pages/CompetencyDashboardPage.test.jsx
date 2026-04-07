import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const getJourneyEngineCompetenciesMock = vi.fn();

vi.mock('../services/journeyEngineApi.js', () => ({
  getJourneyEngineCompetencies: (...args) => getJourneyEngineCompetenciesMock(...args)
}));

import CompetencyDashboardPage from './CompetencyDashboardPage.jsx';

describe('CompetencyDashboardPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  test('carrega o dashboard de competências e permite atualizar a leitura', async () => {
    getJourneyEngineCompetenciesMock
      .mockResolvedValueOnce({
        summary: { averageMastery: 72, averageConfidence: 66, averageConsistency: 64 },
        strengths: [{ id: 'c1', name: 'Tomada de decisão', metrics: { mastery: 81, confidence: 74, consistency: 69 }, trend: { direction: 'up' } }],
        focus: [{ id: 'c2', name: 'Consistência', metrics: { mastery: 49 }, recommendation: 'Repetir ciclos curtos com feedback.' }],
        items: [{ id: 'c1', name: 'Tomada de decisão', level: 'intermediário', metrics: { mastery: 81, confidence: 74, consistency: 69, growth: 8 }, evidence: { direct: 3, inferred: 1 }, recommendation: 'Aprofundar cenários críticos.' }]
      })
      .mockResolvedValueOnce({
        summary: { averageMastery: 75, averageConfidence: 68, averageConsistency: 67 },
        strengths: [{ id: 'c1', name: 'Tomada de decisão', metrics: { mastery: 84, confidence: 75, consistency: 71 }, trend: { direction: 'up' } }],
        focus: [{ id: 'c2', name: 'Consistência', metrics: { mastery: 53 }, recommendation: 'Continuar repetição deliberada.' }],
        items: [{ id: 'c1', name: 'Tomada de decisão', level: 'intermediário', metrics: { mastery: 84, confidence: 75, consistency: 71, growth: 9 }, evidence: { direct: 4, inferred: 1 }, recommendation: 'Consolidar repertório.' }]
      });

    render(<CompetencyDashboardPage />);

    expect(await screen.findByText('Dashboard de competências')).toBeInTheDocument();
    expect(await screen.findAllByText('Tomada de decisão')).not.toHaveLength(0);
    expect(screen.getByText(/Confiança 74/i)).toBeInTheDocument();
    expect(screen.getByText('Repetir ciclos curtos com feedback.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Atualizar leitura' }));

    expect(getJourneyEngineCompetenciesMock).toHaveBeenCalledTimes(2);
    expect(await screen.findByText(/Consolidar repertório./i)).toBeInTheDocument();
  });

  test('mostra erro quando a API falha', async () => {
    getJourneyEngineCompetenciesMock.mockRejectedValueOnce(new Error('Falha no dashboard de competências'));

    render(<CompetencyDashboardPage />);

    expect(await screen.findByText('Falha no dashboard de competências')).toBeInTheDocument();
  });
});