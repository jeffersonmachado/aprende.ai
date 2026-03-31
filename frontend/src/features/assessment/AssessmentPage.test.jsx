import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

const evaluateAssessmentMock = vi.fn();

vi.mock('../../services/assessmentApi.js', () => ({
  evaluateAssessment: (...args) => evaluateAssessmentMock(...args)
}));

import AssessmentPage from './AssessmentPage.jsx';

describe('AssessmentPage', () => {
  test('envia assessment e exibe feedback', async () => {
    evaluateAssessmentMock.mockResolvedValueOnce({
      score: 8,
      feedback: 'Boa estrutura.',
      recommendation: 'Aprofunde exemplos.',
      nextStepSuggestion: 'Faça uma simulação adicional.'
    });

    render(<AssessmentPage />);

    fireEvent.change(screen.getByPlaceholderText(/Descreva sua estratégia/i), { target: { value: 'Minha resposta' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar avaliação' }));

    expect(evaluateAssessmentMock).toHaveBeenCalledTimes(1);
    expect(await screen.findByText('Score: 8')).toBeInTheDocument();
    expect(screen.getByText('Boa estrutura.')).toBeInTheDocument();
  });
});
