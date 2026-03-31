import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, test, vi, beforeEach } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const getSimulationStateMock = vi.fn();
const submitDecisionMock = vi.fn();

vi.mock('../../services/simulationApi', () => ({
  getSimulationState: (...args) => getSimulationStateMock(...args),
  submitDecision: (...args) => submitDecisionMock(...args)
}));

import SimulationPage from './SimulationPage.jsx';

describe('SimulationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('carrega estado, envia decisão e atualiza feedback', async () => {
    getSimulationStateMock
      .mockResolvedValueOnce({
        run: { scenario: { title: 'Negociação difícil' } },
        episode: {
          title: 'Episódio 1',
          narrativeText: 'Você está diante de um conflito.',
          options: [{ id: 'opt-1', label: 'Tomar decisão A' }]
        }
      })
      .mockResolvedValueOnce({
        run: { scenario: { title: 'Negociação difícil' } },
        episode: {
          title: 'Episódio 2',
          narrativeText: 'Novo contexto após decisão.',
          options: [{ id: 'opt-2', label: 'Tomar decisão B' }]
        }
      });

    submitDecisionMock.mockResolvedValueOnce({ feedback: 'Boa decisão' });

    render(
      <MemoryRouter initialEntries={['/simulation/run-123']}>
        <Routes>
          <Route path="/simulation/:simulationRunId" element={<SimulationPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Carregando simulação...')).toBeInTheDocument();
    expect(await screen.findByText('Negociação difícil')).toBeInTheDocument();
    expect(screen.getByText('Episódio 1')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Tomar decisão A' }));

    expect(submitDecisionMock).toHaveBeenCalledWith('run-123', { selectedOptionId: 'opt-1' });
    expect(await screen.findByText('Boa decisão')).toBeInTheDocument();
    expect(await screen.findByText('Episódio 2')).toBeInTheDocument();
    expect(getSimulationStateMock).toHaveBeenCalledTimes(2);
  });
});
