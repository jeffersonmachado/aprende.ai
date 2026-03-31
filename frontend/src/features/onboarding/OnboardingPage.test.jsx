import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

const saveOnboardingMock = vi.fn();

vi.mock('../../services/profileApi', () => ({
  saveOnboarding: (...args) => saveOnboardingMock(...args)
}));

import OnboardingPage from './OnboardingPage.jsx';

describe('OnboardingPage', () => {
  test('envia formulário e renderiza jornada', async () => {
    saveOnboardingMock.mockResolvedValueOnce({
      journey: { title: 'Jornada personalizada' }
    });

    render(<OnboardingPage />);

    fireEvent.change(screen.getByDisplayValue('Melhorar tomada de decisão'), {
      target: { value: 'Novo objetivo' }
    });
    fireEvent.change(screen.getByDisplayValue('Quero decidir melhor em cenários com pressão.'), {
      target: { value: 'Quero praticar decisões complexas.' }
    });
    fireEvent.change(screen.getByDisplayValue('Prático'), {
      target: { value: 'analytical' }
    });

    fireEvent.click(screen.getByRole('button', { name: 'Salvar onboarding e gerar jornada' }));

    expect(saveOnboardingMock).toHaveBeenCalledTimes(1);
    expect(saveOnboardingMock.mock.calls[0][0].goalTitle).toBe('Novo objetivo');
    expect(saveOnboardingMock.mock.calls[0][0].goalDescription).toBe('Quero praticar decisões complexas.');
    expect(saveOnboardingMock.mock.calls[0][0].dominantStyle).toBe('analytical');

    expect(await screen.findByText(/Jornada personalizada/i)).toBeInTheDocument();
  });
});
