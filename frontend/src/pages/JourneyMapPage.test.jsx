import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const useJourneyRuntimeMock = vi.fn();

vi.mock('../context/JourneyRuntimeContext.jsx', () => ({
  useJourneyRuntime: () => useJourneyRuntimeMock()
}));

vi.mock('../components/journey/JourneyEngine.jsx', () => ({
  default: () => <div>Mock Journey Engine</div>
}));

import JourneyMapPage from './JourneyMapPage.jsx';

describe('JourneyMapPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renderiza mapa, capítulos e fases quando o runtime está carregado', async () => {
    useJourneyRuntimeMock.mockReturnValue({
      loading: false,
      error: '',
      runtime: {
        journey: {
          progressPercent: 68,
          state: { steps: [{ id: 'step-1', status: 'active' }], rewards: [], progress: 68, level: 2, xpTotal: 120, streak: 3 },
          activeStepId: 'step-1'
        },
        campaign: {
          chapters: [
            { id: 'cap-1', title: 'Capítulo 1', phases: [{ title: 'Briefing' }, { title: 'Missão' }] },
            { id: 'cap-2', title: 'Capítulo 2', phases: [{ title: 'Resultado' }] }
          ]
        }
      }
    });

    render(<JourneyMapPage />);

    expect(await screen.findByText('Mapa da jornada')).toBeInTheDocument();
    expect(screen.getByText('Mock Journey Engine')).toBeInTheDocument();
    expect(screen.getByText('Capítulo 1')).toBeInTheDocument();
    expect(screen.getByText('Briefing · Missão')).toBeInTheDocument();
    expect(screen.getByText('Capítulo 2')).toBeInTheDocument();
  });

  test('exibe erro do runtime quando presente', async () => {
    useJourneyRuntimeMock.mockReturnValue({
      loading: false,
      error: 'Falha ao carregar mapa',
      runtime: { journey: {}, campaign: { chapters: [] } }
    });

    render(<JourneyMapPage />);

    expect(await screen.findByText('Falha ao carregar mapa')).toBeInTheDocument();
  });
});