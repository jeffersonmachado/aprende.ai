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

import CompetenciesPage from './CompetenciesPage.jsx';

describe('CompetenciesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('carrega competências e cria nova competência', async () => {
    apiGetMock
      .mockResolvedValueOnce([
        { id: 'c1', name: 'Comunicação', code: 'COM-001', category: 'soft-skills', description: 'Descrição A' }
      ])
      .mockResolvedValueOnce([
        { id: 'c1', name: 'Comunicação', code: 'COM-001', category: 'soft-skills', description: 'Descrição A' },
        { id: 'c2', name: 'Negociação', code: 'NEG-001', category: 'soft-skills', description: 'Descrição B' }
      ]);

    apiPostMock.mockResolvedValueOnce({ id: 'c2' });

    render(<CompetenciesPage />);

    expect(await screen.findByText('Comunicação')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Código'), { target: { value: 'NEG-001' } });
    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Negociação' } });
    fireEvent.change(screen.getByLabelText('Categoria'), { target: { value: 'soft-skills' } });
    fireEvent.change(screen.getByLabelText('Descrição'), { target: { value: 'Descrição B' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar competência' }));

    expect(apiPostMock).toHaveBeenCalledWith('/api/competencies', {
      code: 'NEG-001',
      name: 'Negociação',
      description: 'Descrição B',
      category: 'soft-skills'
    });

    expect(await screen.findByText('Negociação')).toBeInTheDocument();
  });

  test('renderiza fallbacks e mostra erro ao salvar', async () => {
    apiGetMock.mockResolvedValueOnce([
      { id: 'c1', name: 'Competência sem extras', code: '', category: '', description: '' }
    ]);
    apiPostMock.mockRejectedValueOnce(new Error('Falha ao salvar competência'));

    render(<CompetenciesPage />);

    expect(await screen.findByText('Competência sem extras')).toBeInTheDocument();
    expect(screen.getByText('sem categoria')).toBeInTheDocument();
    expect(screen.getByText('sem código')).toBeInTheDocument();
    expect(screen.getByText('Sem descrição.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Salvar competência' }));

    expect(await screen.findByText('Falha ao salvar competência')).toBeInTheDocument();
  });
});
