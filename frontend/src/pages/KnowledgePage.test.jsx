import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const apiGetMock = vi.fn();
const apiPostMock = vi.fn();

vi.mock('../services/api.js', () => ({
  api: {
    get: (...args) => apiGetMock(...args),
    post: (...args) => apiPostMock(...args)
  }
}));

import KnowledgePage from './KnowledgePage.jsx';

describe('KnowledgePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('carrega fontes/documentos e cria novo documento', async () => {
    const sources = [{ id: 's1', name: 'Fonte 1' }];
    apiGetMock
      .mockResolvedValueOnce(sources)
      .mockResolvedValueOnce([{ id: 'd1', title: 'Doc A', documentText: 'Texto A', status: 'indexed' }])
      .mockResolvedValueOnce(sources)
      .mockResolvedValueOnce([
        { id: 'd1', title: 'Doc A', documentText: 'Texto A', status: 'indexed' },
        { id: 'd2', title: 'Doc B', documentText: 'Texto B', status: 'indexed' }
      ]);

    apiPostMock.mockResolvedValueOnce({ id: 'd2' });

    render(<KnowledgePage />);

    expect(await screen.findByText('Doc A')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Fonte'), { target: { value: 's1' } });
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Doc B' } });
    fireEvent.change(screen.getByLabelText('Texto'), { target: { value: 'Texto B' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar documento' }));

    expect(apiPostMock).toHaveBeenCalledWith('/api/knowledge/documents', {
      knowledgeSourceId: 's1',
      title: 'Doc B',
      documentText: 'Texto B',
      status: 'indexed'
    });

    expect(await screen.findByText('Doc B')).toBeInTheDocument();
    expect(screen.getByLabelText('Título')).toHaveValue('');
    expect(screen.getByLabelText('Texto')).toHaveValue('');
  });

  test('cria nova fonte e recarrega a lista', async () => {
    const sourcesAfterCreate = [{ id: 's1', name: 'Fonte Nova' }];
    apiGetMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(sourcesAfterCreate)
      .mockResolvedValueOnce([]);

    apiPostMock.mockResolvedValueOnce({ id: 's1' });

    render(<KnowledgePage />);

    await screen.findByText('Nenhum documento indexado');
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Fonte Nova' } });
    fireEvent.change(screen.getByLabelText('Tipo'), { target: { value: 'faq' } });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'Salvar fonte' }));
    });

    expect(apiPostMock).toHaveBeenCalledWith('/api/knowledge/sources', {
      name: 'Fonte Nova',
      sourceType: 'faq'
    });
    await waitFor(() => expect(apiGetMock).toHaveBeenCalledTimes(4));
  });

  test('mostra erro quando criação de documento falha', async () => {
    const sources = [{ id: 's1', name: 'Fonte 1' }];
    apiGetMock.mockResolvedValueOnce(sources).mockResolvedValueOnce([]);
    apiPostMock.mockRejectedValueOnce(new Error('Falha ao salvar documento'));

    render(<KnowledgePage />);

    await screen.findByText('Nenhum documento indexado');
    fireEvent.change(screen.getByLabelText('Título'), { target: { value: 'Doc erro' } });
    fireEvent.change(screen.getByLabelText('Texto'), { target: { value: 'Texto erro' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar documento' }));

    expect(await screen.findByText('Falha ao salvar documento')).toBeInTheDocument();
  });

  test('mostra erro quando criação de fonte falha', async () => {
    apiGetMock.mockResolvedValueOnce([]).mockResolvedValueOnce([]);
    apiPostMock.mockRejectedValueOnce(new Error('Falha ao salvar fonte'));

    render(<KnowledgePage />);

    await screen.findByText('Nenhum documento indexado');
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Fonte com erro' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar fonte' }));

    expect(await screen.findByText('Falha ao salvar fonte')).toBeInTheDocument();
  });
});
