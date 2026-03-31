import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const logoutMock = vi.fn();
let mockedUser = { name: 'Admin', email: 'admin@aprende.ai' };
const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true };

vi.mock('../context/useAuth.js', () => ({
  useAuth: () => ({
    logout: (...args) => logoutMock(...args),
    user: mockedUser
  })
}));

import Layout from './Layout.jsx';

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUser = { name: 'Admin', email: 'admin@aprende.ai' };
  });

  function renderLayout(initialEntry = '/tracks') {
    return render(
      <MemoryRouter initialEntries={[initialEntry]} future={routerFuture}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="tracks" element={<div>Tracks content</div>} />
            <Route path="knowledge" element={<div>Knowledge content</div>} />
            <Route path="*" element={<div>Fallback content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  }

  test('renderiza usuário, navegação e módulo ativo', async () => {
    renderLayout('/tracks');

    expect(screen.getByText('Admin')).toBeInTheDocument();
    expect(screen.getByText('admin@aprende.ai')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /Minha Jornada/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole('link', { name: /Trilhas/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Tracks content')).toBeInTheDocument();
  });

  test('usa fallback de usuário quando não há dados', async () => {
    mockedUser = null;
    renderLayout('/knowledge');

    expect(screen.getByText('Usuário')).toBeInTheDocument();
    expect(screen.getByText('Knowledge content')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /Dashboard tecnico/i })).not.toBeInTheDocument();
  });

  test('executa logout ao clicar em sair', () => {
    renderLayout();

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  test('usa minha jornada como módulo ativo quando rota não está mapeada', () => {
    renderLayout('/rota-desconhecida');

    expect(screen.getByText('Fallback content')).toBeInTheDocument();
    expect(screen.getAllByText('Minha Jornada').length).toBeGreaterThanOrEqual(1);
  });
});
