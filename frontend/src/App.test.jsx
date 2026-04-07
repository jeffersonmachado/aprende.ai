import { render, screen } from '@testing-library/react';
import { MemoryRouter, Outlet } from 'react-router-dom';
import { vi } from 'vitest';

let authToken = null;
const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true };

vi.mock('./context/useAuth.js', () => ({
  useAuth: () => ({
    token: authToken
  })
}));

vi.mock('./components/Layout.jsx', () => ({
  default: () => (
    <div>
      <div>Mock Layout</div>
      <Outlet />
    </div>
  )
}));

vi.mock('./pages/LoginPage.jsx', () => ({
  default: () => <div>Mock Login</div>
}));

vi.mock('./pages/AprendeAiReferencePage.jsx', () => ({
  default: () => <div>Mock Reference</div>
}));

vi.mock('./pages/AprendeAiGamePage.jsx', () => ({
  default: () => <div>Mock Game Page</div>
}));

vi.mock('./context/JourneyRuntimeContext.jsx', () => ({
  JourneyRuntimeProvider: ({ children }) => <>{children}</>
}));

vi.mock('./context/CampaignRuntimeContext.jsx', () => ({
  CampaignRuntimeProvider: ({ children }) => <>{children}</>
}));

import App from './App.jsx';

describe('App', () => {
  test('renderiza login quando não há token', async () => {
    authToken = null;
    render(
      <MemoryRouter initialEntries={['/']} future={routerFuture}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('Mock Login')).toBeInTheDocument();
  });

  test('renderiza rota protegida da campanha', async () => {
    authToken = 'token-valido';
    render(
      <MemoryRouter initialEntries={['/aprende-ai-game']} future={routerFuture}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('Mock Layout')).toBeInTheDocument();
    expect(await screen.findByText('Mock Game Page')).toBeInTheDocument();
  });

  test('redireciona qualquer rota autenticada legada para a experiência gamificada', async () => {
    authToken = 'token-valido';
    render(
      <MemoryRouter initialEntries={['/tracks']} future={routerFuture}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('Mock Layout')).toBeInTheDocument();
    expect(screen.getByText('Mock Game Page')).toBeInTheDocument();
  });

  test('renderiza a página de referência fora da área autenticada', async () => {
    authToken = null;
    render(
      <MemoryRouter initialEntries={['/aprende-ai-reference']} future={routerFuture}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('Mock Reference')).toBeInTheDocument();
  });

  test('redireciona o índice autenticado para a experiência gamificada', async () => {
    authToken = 'token-valido';
    render(
      <MemoryRouter initialEntries={['/']} future={routerFuture}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('Mock Layout')).toBeInTheDocument();
    expect(screen.getByText('Mock Game Page')).toBeInTheDocument();
  });
});
