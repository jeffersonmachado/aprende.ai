import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

const sendMentorMessageMock = vi.fn();

vi.mock('../../services/mentorApi', () => ({
  sendMentorMessage: (...args) => sendMentorMessageMock(...args)
}));

import MentorPage from './MentorPage.jsx';

describe('MentorPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('envia mensagem e mostra resposta do mentor', async () => {
    sendMentorMessageMock.mockResolvedValueOnce({ reply: 'Resposta do mentor' });

    render(<MentorPage />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Preciso de ajuda' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(sendMentorMessageMock).toHaveBeenCalledWith('Preciso de ajuda');
    expect(await screen.findByText(/Mentor:/)).toBeInTheDocument();
    expect(screen.getByText('Resposta do mentor')).toBeInTheDocument();
  });

  test('não envia quando mensagem está vazia', () => {
    render(<MentorPage />);

    fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));

    expect(sendMentorMessageMock).not.toHaveBeenCalled();
  });
});
