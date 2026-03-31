import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

const evaluateAssessmentMock = vi.fn();

vi.mock('../../services/assessmentApi', () => ({
  evaluateAssessment: (...args) => evaluateAssessmentMock(...args)
}));

import AssessmentPage from './AssessmentPage.jsx';

describe('AssessmentPage', () => {
  test('envia respostas e renderiza resultado', async () => {
    evaluateAssessmentMock.mockResolvedValueOnce({ score: 88, level: 'advanced' });

    render(<AssessmentPage />);

    const textareas = screen.getAllByRole('textbox');
    fireEvent.change(textareas[0], { target: { value: 'Resposta da pergunta 1' } });
    fireEvent.change(textareas[1], { target: { value: 'Resposta da pergunta 2' } });

    fireEvent.click(screen.getByRole('button', { name: 'Avaliar' }));

    expect(evaluateAssessmentMock).toHaveBeenCalledTimes(1);
    expect(await screen.findByText(/"score": 88/)).toBeInTheDocument();
    expect(screen.getByText(/"level": "advanced"/)).toBeInTheDocument();
  });
});
