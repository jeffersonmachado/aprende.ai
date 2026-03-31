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

import TracksPage from './TracksPage.jsx';

describe('TracksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('carrega trilhas e cria nova trilha', async () => {
    apiGetMock
      .mockResolvedValueOnce([{ id: 't1', title: 'Trilha A', status: 'draft', visibility: 'private' }])
      .mockResolvedValueOnce([
        { id: 't1', title: 'Trilha A', status: 'draft', visibility: 'private' },
        { id: 't2', title: 'Trilha B', status: 'published', visibility: 'public' }
      ]);

    apiPostMock.mockResolvedValueOnce({ id: 't2' });

    render(<TracksPage />);

    expect(await screen.findByText('Trilha A')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Trilha B' } });
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Descrição B' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'published' } });
    fireEvent.change(screen.getByLabelText('Visibilidade'), { target: { value: 'public' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar trilha' }));

    expect(apiPostMock).toHaveBeenCalledWith('/api/tracks', {
      title: 'Trilha B',
      description: 'Descrição B',
      status: 'published',
      visibility: 'public'
    });
    expect(await screen.findByText('Trilha B')).toBeInTheDocument();
  });

  test('renderiza fallback de descrição e mostra erro ao salvar', async () => {
    apiGetMock.mockResolvedValueOnce([{ id: 't1', title: 'Trilha sem descrição', status: 'draft', visibility: 'private' }]);
    apiPostMock.mockRejectedValueOnce(new Error('Falha ao salvar trilha'));

    render(<TracksPage />);

    expect(await screen.findByText('Trilha sem descrição')).toBeInTheDocument();
    expect(screen.getByText('Sem descrição.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Salvar trilha' }));

    expect(await screen.findByText('Falha ao salvar trilha')).toBeInTheDocument();
  });
});
