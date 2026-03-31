import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const apiGetMock = vi.fn();

vi.mock('../services/api.js', () => ({
  api: {
    get: (...args) => apiGetMock(...args),
    post: vi.fn()
  }
}));

import DashboardPage from './DashboardPage.jsx';

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('carrega métricas e últimos eventos', async () => {
    apiGetMock
      .mockResolvedValueOnce([{ id: 't1' }, { id: 't2' }])
      .mockResolvedValueOnce([{ id: 'c1' }])
      .mockResolvedValueOnce([{ id: 'd1' }, { id: 'd2' }, { id: 'd3' }])
      .mockResolvedValueOnce([
        {
          id: 'e1',
          eventType: 'integration.sync.finished',
          status: 'success',
          sourceSystem: 'aprende-ai',
          direction: 'outbound'
        }
      ]);

    render(<DashboardPage />);

    expect(await screen.findByText('Dashboard do aprende.AI')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('integration.sync.finished')).toBeInTheDocument();
  });

  test('renderiza estado vazio de eventos', async () => {
    apiGetMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    render(<DashboardPage />);

    expect(await screen.findByText('Sem eventos ainda')).toBeInTheDocument();
  });

  test('mostra erro quando carregamento falha', async () => {
    apiGetMock.mockResolvedValueOnce([]).mockRejectedValueOnce(new Error('Falha no dashboard'));

    render(<DashboardPage />);

    expect(await screen.findByText('Falha no dashboard')).toBeInTheDocument();
  });
});
