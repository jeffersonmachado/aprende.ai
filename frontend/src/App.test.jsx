import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

const startSimulationMock = vi.fn();

vi.mock('./services/simulationApi', () => ({
  getSimulationCatalog: vi.fn().mockResolvedValue([
    {
      id: 'scenario-1',
      title: 'Cenario de teste',
      description: 'Descricao de teste'
    }
  ]),
  startSimulation: (...args) => startSimulationMock(...args)
}));

vi.mock('./features/onboarding/OnboardingPage.jsx', () => ({
  default: () => <div>Mock Onboarding</div>
}));

vi.mock('./features/journey/JourneyPage.jsx', () => ({
  default: () => <div>Mock Journey</div>
}));

vi.mock('./features/simulation/SimulationPage.jsx', () => ({
  default: () => <div>Mock Simulation</div>
}));

vi.mock('./features/mentor/MentorPage.jsx', () => ({
  default: () => <div>Mock Mentor</div>
}));

vi.mock('./features/assessment/AssessmentPage.jsx', () => ({
  default: () => <div>Mock Assessment</div>
}));

import App from './App.jsx';

describe('App', () => {
  test('inicia cenário e navega para a simulação', async () => {
    startSimulationMock.mockResolvedValueOnce({ id: 'run-1' });

    const { fireEvent } = await import('@testing-library/react');

    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    await screen.findByText('Cenario de teste');
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }));

    expect(startSimulationMock).toHaveBeenCalledWith({ scenarioId: 'scenario-1' });
    expect(await screen.findByText('Mock Simulation')).toBeInTheDocument();
  });

  test('renderiza navegação principal', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    await screen.findByText('Cenario de teste');

    expect(screen.getByRole('link', { name: 'Início' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Onboarding' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Jornada' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Mentor' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Assessment' })).toBeInTheDocument();
  });

  test('renderiza cenários vindos do catálogo', async () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('Cenario de teste')).toBeInTheDocument();
    expect(screen.getByText('Descricao de teste')).toBeInTheDocument();
  });
});
