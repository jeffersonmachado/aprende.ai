import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

const getJourneySummaryMock = vi.fn();

vi.mock('../../services/journeyApi', () => ({
  getJourneySummary: (...args) => getJourneySummaryMock(...args)
}));

import JourneyPage from './JourneyPage.jsx';

describe('JourneyPage', () => {
  test('renderiza loading e depois o resumo da jornada', async () => {
    getJourneySummaryMock.mockResolvedValueOnce({
      title: 'Minha Jornada',
      progressPercent: 35,
      steps: [
        { id: 'step-1', title: 'Passo 1', stepType: 'lesson' },
        { id: 'step-2', title: 'Passo 2', stepType: 'assessment' }
      ]
    });

    render(<JourneyPage />);

    expect(screen.getByText('Carregando jornada...')).toBeInTheDocument();
    expect(await screen.findByText('Minha Jornada')).toBeInTheDocument();
    expect(screen.getByText('Progresso: 35%')).toBeInTheDocument();
    expect(screen.getByText('Passo 1')).toBeInTheDocument();
    expect(screen.getByText('Passo 2')).toBeInTheDocument();
  });
});
