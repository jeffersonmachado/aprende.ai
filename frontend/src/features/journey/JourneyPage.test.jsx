import { render, screen } from '@testing-library/react';
import { vi } from 'vitest';

const getJourneySummaryMock = vi.fn();

vi.mock('../../services/journeyApi.js', () => ({
  getJourneySummary: (...args) => getJourneySummaryMock(...args)
}));

import JourneyPage from './JourneyPage.jsx';

describe('JourneyPage', () => {
  test('renderiza dados da jornada', async () => {
    getJourneySummaryMock.mockResolvedValueOnce({
      title: 'Minha Jornada',
      progressPercent: 35,
      steps: [{ id: '1', title: 'Passo 1', description: 'Desc', stepType: 'lesson', status: 'pending' }]
    });

    render(<JourneyPage />);

    expect(await screen.findByText('Minha Jornada')).toBeInTheDocument();
    expect(screen.getByText('Progresso: 35%')).toBeInTheDocument();
    expect(screen.getByText('Passo 1')).toBeInTheDocument();
  });
});
