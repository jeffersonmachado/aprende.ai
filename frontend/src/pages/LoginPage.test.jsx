import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';

const loginMock = vi.fn();
const navigateMock = vi.fn();
const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true };

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({ login: (...args) => loginMock(...args) })
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => navigateMock
  };
});

import LoginPage from './LoginPage.jsx';

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('faz login com sucesso e navega para home', async () => {
    loginMock.mockResolvedValueOnce({ user: { id: 'u1' } });

    render(
      <MemoryRouter future={routerFuture}>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByLabelText('E-mail'), { target: { value: 'user@aprende.ai' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'Senha123!' } });

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(loginMock).toHaveBeenCalledWith('user@aprende.ai', 'Senha123!');
    await Promise.resolve();
    expect(navigateMock).toHaveBeenCalledWith('/');
  });

  test('mostra erro quando login falha', async () => {
    loginMock.mockRejectedValueOnce(new Error('Credenciais inválidas'));

    render(
      <MemoryRouter future={routerFuture}>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }));

    expect(await screen.findByText('Credenciais inválidas')).toBeInTheDocument();
  });
});
