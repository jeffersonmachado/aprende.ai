import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const apiGetMock = vi.fn();
const apiPostMock = vi.fn();

vi.mock('../services/api.js', () => ({
  api: {
    get: (...args) => apiGetMock(...args),
    post: (...args) => apiPostMock(...args)
  }
}));

import IntegrationPage from './IntegrationPage.jsx';

describe('IntegrationPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('carrega fila e publica evento', async () => {
    apiGetMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([
        {
          id: 'e1',
          eventType: 'learning.track.recommended',
          status: 'published',
          sourceSystem: 'aprende-ai',
          direction: 'outbound',
          payload: { example: true }
        }
      ]);

    apiPostMock.mockResolvedValueOnce({ id: 'e1' });

    render(<IntegrationPage />);

    expect(await screen.findByText('Nenhum evento publicado')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Sistema de origem'), { target: { value: 'ria-core' } });
    fireEvent.change(screen.getByLabelText('Tipo do evento'), { target: { value: 'integration.custom.event' } });
    fireEvent.change(screen.getByLabelText('Direção'), { target: { value: 'inbound' } });
    fireEvent.change(screen.getByLabelText('Payload JSON'), { target: { value: '{\n  "custom": true\n}' } });

    fireEvent.click(screen.getByRole('button', { name: 'Publicar evento' }));

    expect(apiPostMock).toHaveBeenCalledWith('/api/integration/events', {
      sourceSystem: 'ria-core',
      eventType: 'integration.custom.event',
      direction: 'inbound',
      payload: { custom: true }
    });

    expect(await screen.findByText('learning.track.recommended')).toBeInTheDocument();
  });

  test('mostra erro quando payload JSON é inválido', async () => {
    apiGetMock.mockResolvedValueOnce([]);

    render(<IntegrationPage />);

    await screen.findByText('Nenhum evento publicado');
    fireEvent.change(screen.getByLabelText('Payload JSON'), { target: { value: '{ invalido' } });
    fireEvent.click(screen.getByRole('button', { name: 'Publicar evento' }));

    expect(
      await screen.findByText((content, element) => {
        return element?.classList.contains('error-box') && /Unexpected token|Expected property name|JSON/i.test(content);
      })
    ).toBeInTheDocument();
    expect(apiPostMock).not.toHaveBeenCalled();
  });

  test('mostra erro quando publicação falha', async () => {
    apiGetMock.mockResolvedValueOnce([]);
    apiPostMock.mockRejectedValueOnce(new Error('Falha ao publicar evento'));

    render(<IntegrationPage />);

    await screen.findByText('Nenhum evento publicado');
    fireEvent.click(screen.getByRole('button', { name: 'Publicar evento' }));

    expect(await screen.findByText('Falha ao publicar evento')).toBeInTheDocument();
  });
});
