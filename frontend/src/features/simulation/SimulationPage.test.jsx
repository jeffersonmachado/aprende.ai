import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const getSimulationCatalogMock = vi.fn();
const startSimulationMock = vi.fn();
const getSimulationStateMock = vi.fn();
const submitDecisionMock = vi.fn();

vi.mock('../../services/simulationApi.js', () => ({
  getSimulationCatalog: (...args) => getSimulationCatalogMock(...args),
  startSimulation: (...args) => startSimulationMock(...args),
  getSimulationState: (...args) => getSimulationStateMock(...args),
  submitDecision: (...args) => submitDecisionMock(...args)
}));

import SimulationPage from './SimulationPage.jsx';

describe('SimulationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('inicia simulação e registra decisão', async () => {
    getSimulationCatalogMock.mockResolvedValueOnce([{ id: 'sc-1', title: 'Cenário', description: 'Desc' }]);
    startSimulationMock.mockResolvedValueOnce({ id: 'run-1' });
    getSimulationStateMock
      .mockResolvedValueOnce({
        run: { id: 'run-1' },
        scenario: { title: 'Cenário' },
        episode: { title: 'Ep1', narrativeText: 'Narrativa', options: [{ id: 'opt-1', label: 'Opção A' }] }
      })
      .mockResolvedValueOnce({
        run: { id: 'run-1' },
        scenario: { title: 'Cenário' },
        episode: { title: 'Ep1', narrativeText: 'Narrativa', options: [{ id: 'opt-1', label: 'Opção A' }] }
      });
    submitDecisionMock.mockResolvedValueOnce({ feedback: 'Boa decisão' });

    render(<SimulationPage />);

    fireEvent.click(await screen.findByRole('button', { name: 'Iniciar missao' }));
    fireEvent.click(await screen.findByRole('button', { name: /Opção A/i }));

    expect(startSimulationMock).toHaveBeenCalledWith({ scenarioId: 'sc-1' });
    expect(submitDecisionMock).toHaveBeenCalledWith('run-1', { selectedOptionId: 'opt-1' });
    expect(await screen.findByText('Boa decisão')).toBeInTheDocument();
  });
});
