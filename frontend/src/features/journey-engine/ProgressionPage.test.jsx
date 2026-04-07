import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true };

const useJourneyEngineRuntimeMock = vi.fn();

vi.mock('../../context/JourneyEngineRuntimeContext.jsx', () => ({
  useJourneyEngineRuntime: () => useJourneyEngineRuntimeMock()
}));

import ProgressionPage from './ProgressionPage.jsx';

describe('ProgressionPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useJourneyEngineRuntimeMock.mockReturnValue({
      runtime: {
        progression: {
          nextFocus: 'Consolidar negociação adaptativa',
          recommendation: 'Feche o capítulo linear e aprofunde o gap pela trilha adaptativa.'
        }
      },
      loading: false,
      error: ''
    });
  });

  test('expõe CTA para a jornada adaptativa sem perder a ação principal da progressão', () => {
    const onAdvance = vi.fn();

    render(
      <MemoryRouter future={routerFuture}>
        <ProgressionPage
          campaignPhase={{
            chapterId: 'capitulo-1',
            content: {
              title: 'Próximo passo',
              unlocks: ['badge-1']
            },
            description: 'Encerramento do capítulo atual.'
          }}
          onAdvance={onAdvance}
          advanceLabel="Desbloquear próximo capítulo"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Jornada adaptativa oficial')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ir para jornada adaptativa' })).toHaveAttribute('href', '/adaptive-journey');

    fireEvent.click(screen.getByRole('button', { name: 'Desbloquear próximo capítulo' }));
    expect(onAdvance).toHaveBeenCalledTimes(1);
  });
});