import { fireEvent, render, screen } from '@testing-library/react';
import { vi } from 'vitest';

const sendMentorMessageMock = vi.fn();

vi.mock('../../services/mentorApi.js', () => ({
  sendMentorMessage: (...args) => sendMentorMessageMock(...args)
}));

import MentorPage from './MentorPage.jsx';

describe('MentorPage', () => {
  test('envia mensagem e exibe resposta', async () => {
    sendMentorMessageMock.mockResolvedValueOnce({ reply: 'Pratique escuta ativa.' });

    render(<MentorPage />);

    fireEvent.change(screen.getByPlaceholderText(/Quero ajuda/i), { target: { value: 'Me ajude' } });
    fireEvent.click(screen.getByRole('button', { name: 'Enviar ao mentor' }));

    expect(sendMentorMessageMock).toHaveBeenCalledWith('Me ajude');
    expect(await screen.findByText('Pratique escuta ativa.')).toBeInTheDocument();
  });
});
