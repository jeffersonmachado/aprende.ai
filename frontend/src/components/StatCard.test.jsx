import { render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import StatCard from './cards/StatCard.jsx';

describe('StatCard', () => {
  test('renderiza label, valor e helper', () => {
    render(<StatCard label="Eventos" value={12} helper="Últimas 24h" />);

    expect(screen.getByText('Eventos')).toBeInTheDocument();
    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Últimas 24h')).toBeInTheDocument();
  });

  test('omite helper quando não informado', () => {
    render(<StatCard label="Eventos" value={0} />);

    expect(screen.getByText('Eventos')).toBeInTheDocument();
    expect(screen.queryByText('Últimas 24h')).not.toBeInTheDocument();
  });
});
