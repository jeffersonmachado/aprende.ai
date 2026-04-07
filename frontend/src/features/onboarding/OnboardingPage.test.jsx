import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';

const saveOnboardingMock = vi.fn();
const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true };

vi.mock('../../services/profileApi.js', () => ({
  saveOnboarding: (...args) => saveOnboardingMock(...args)
}));

import OnboardingPage from './OnboardingPage.jsx';

describe('OnboardingPage', () => {
  test('envia onboarding e exibe jornada gerada', async () => {
    saveOnboardingMock.mockResolvedValueOnce({
      journey: {
        title: 'Jornada personalizada',
        steps: [{ id: 's1' }, { id: 's2' }]
      }
    });

    render(
      <MemoryRouter future={routerFuture}>
        <OnboardingPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Avancar etapa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Avancar etapa' }));
    fireEvent.click(screen.getByRole('button', { name: 'Gerar jornada personalizada' }));

    expect(saveOnboardingMock).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Jornada personalizada')).toBeInTheDocument();
    expect(screen.getByText('Passos gerados: 2')).toBeInTheDocument();
  });
});
