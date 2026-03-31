import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

const saveOnboardingMock = vi.fn();

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

    render(<OnboardingPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Salvar onboarding e gerar jornada' }));

    expect(saveOnboardingMock).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Jornada personalizada')).toBeInTheDocument();
    expect(screen.getByText('Passos gerados: 2')).toBeInTheDocument();
  });
});
