import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import PageHeader from './PageHeader.jsx';

describe('PageHeader', () => {
  test('renderiza todos os campos quando informados', () => {
    render(
      <PageHeader
        eyebrow="Produto"
        title="Painel"
        description="Descrição curta"
        actions={<button>Ação</button>}
      />
    );

    expect(screen.getByText('Produto')).toBeInTheDocument();
    expect(screen.getByText('Painel')).toBeInTheDocument();
    expect(screen.getByText('Descrição curta')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Ação' })).toBeInTheDocument();
  });

  test('omite campos opcionais ausentes', () => {
    render(<PageHeader title="Somente título" />);

    expect(screen.getByText('Somente título')).toBeInTheDocument();
    expect(screen.queryByText('Produto')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
