import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true };

import Layout from './Layout.jsx';

describe('Layout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderLayout(initialEntry = '/tracks') {
    return render(
      <MemoryRouter initialEntries={[initialEntry]} future={routerFuture}>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route path="aprende-ai-game" element={<div>Game content</div>} />
            <Route path="*" element={<div>Fallback content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    );
  }

  test('renderiza apenas o conteúdo do fluxo gamificado ativo', async () => {
    renderLayout('/aprende-ai-game');

    expect(screen.getByText('Game content')).toBeInTheDocument();
  });

  test('não renderiza navegação lateral nem cabeçalho legado', () => {
    renderLayout('/aprende-ai-game');

    expect(screen.queryByRole('button', { name: 'Menu' })).not.toBeInTheDocument();
    expect(screen.queryByText('Experiência Gamificada')).not.toBeInTheDocument();
  });

  test('mantém o outlet funcional sem depender de contexto extra', async () => {
    renderLayout('/aprende-ai-game');

    expect(screen.getByText('Game content')).toBeInTheDocument();
  });

  test('mantém o outlet funcional em rotas não mapeadas', () => {
    renderLayout('/rota-desconhecida');

    expect(screen.getByText('Fallback content')).toBeInTheDocument();
  });

  test('não injeta HUD adicional sobre o clone', () => {
    renderLayout('/aprende-ai-game');

    expect(screen.queryByText(/Nível/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/XP/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Streak/i)).not.toBeInTheDocument();
  });
});
