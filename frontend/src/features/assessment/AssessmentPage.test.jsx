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

    render(<AssessmentPage linkedSimulationRunId="run-12345678" campaignPhase={{ chapterId: 'capitulo-2', id: 'assessment', content: { competencyLabel: 'Comunicação', criterionLabel: 'clareza', levelLabel: 'avancado', evidenceLabel: 'evidencia aplicada', promptPlaceholder: 'Descreva sua estratégia', apiContext: { phaseLabel: 'consolidacao', missionTitle: 'Missão teste' }, rubric: ['critério claro'] } }} />);

    fireEvent.change(screen.getByPlaceholderText(/Descreva sua estratégia/i), { target: { value: 'Minha resposta' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar avaliação' }));

    expect(evaluateAssessmentMock).toHaveBeenCalledWith({
      assessmentId: 'capitulo-2-assessment',
      competencyId: 'Comunicação',
      simulationRunId: 'run-12345678',
      answers: [{ questionId: 'open', answerText: 'Minha resposta', campaignContext: { phaseLabel: 'consolidacao', missionTitle: 'Missão teste' } }],
      textAnswer: 'Minha resposta'
    });
    expect(await screen.findByText('Score: 8')).toBeInTheDocument();
    expect(screen.getByText('Boa estrutura.')).toBeInTheDocument();
  });
});
