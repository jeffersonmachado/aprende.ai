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

vi.mock('./pages/DashboardPage.jsx', () => ({
  default: () => <div>Mock Dashboard</div>
}));

vi.mock('./pages/TechnicalDashboardPage.jsx', () => ({
  default: () => <div>Mock Technical Dashboard</div>
}));

vi.mock('./pages/TracksPage.jsx', () => ({
  default: () => <div>Mock Tracks</div>
}));

vi.mock('./pages/CompetenciesPage.jsx', () => ({
  default: () => <div>Mock Competencies</div>
}));

vi.mock('./pages/KnowledgePage.jsx', () => ({
  default: () => <div>Mock Knowledge</div>
}));

vi.mock('./pages/IntegrationPage.jsx', () => ({
  default: () => <div>Mock Integration</div>
}));

vi.mock('./features/journey-flow/JourneyFlowPage.jsx', () => ({
  default: () => <div>Mock Journey Flow</div>
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

  test('renderiza rota protegida com layout e jornada por padrao', async () => {
    authToken = 'token-valido';
    render(
      <MemoryRouter initialEntries={['/']} future={routerFuture}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('Mock Layout')).toBeInTheDocument();
    expect(screen.getByText('Mock Journey Flow')).toBeInTheDocument();
  });

  test('renderiza rota de trilhas quando autenticado', async () => {
    authToken = 'token-valido';
    render(
      <MemoryRouter initialEntries={['/tracks']} future={routerFuture}>
        <App />
      </MemoryRouter>
    );

    expect(await screen.findByText('Mock Layout')).toBeInTheDocument();
    expect(screen.getByText('Mock Tracks')).toBeInTheDocument();
  });
});
