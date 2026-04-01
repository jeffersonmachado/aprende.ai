import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

const sendMentorMessageMock = vi.fn();

vi.mock('../../services/mentorApi.js', () => ({
  sendMentorMessage: (...args) => sendMentorMessageMock(...args)
}));

import MentorPage from './MentorPage.jsx';

describe('MentorPage', () => {
  test('envia mensagem e exibe resposta do coach', async () => {
    sendMentorMessageMock.mockResolvedValueOnce({
      reply: 'Pratique escuta ativa.',
      coach: {
        situationalRead: 'Você está numa fase de transição de liderança.',
        performanceFeedback: 'Pratique escuta ativa.',
        positiveReinforcement: 'Ótima evolução na semana.',
        reflectionPrompt: 'O que você faria diferente?',
        nextAction: 'Realizar 1:1 estruturado com o time.',
        relatedCompetency: 'Comunicação',
        mentorMode: 'Coach encorajador',
      },
      gamification: { xpAwarded: 12, level: 1, streak: 1, leveledUp: false, unlockedAchievements: [] },
    });

    render(<MentorPage />);

    fireEvent.change(screen.getByLabelText('Modo do coach'), { target: { value: 'analitico' } });
    fireEvent.change(screen.getByPlaceholderText(/Quero ajuda/i), { target: { value: 'Me ajude' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar ao mentor' }));

    expect(sendMentorMessageMock).toHaveBeenCalledWith('Me ajude', 'analitico');
    expect(await screen.findByText('Você está numa fase de transição de liderança.')).toBeInTheDocument();
  });
});
