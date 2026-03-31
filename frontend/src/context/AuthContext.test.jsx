import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const apiGetMock = vi.fn();
const apiPostMock = vi.fn();
const setAuthTokenMock = vi.fn();
const setUnauthorizedHandlerMock = vi.fn();

vi.mock('../services/api.js', () => ({
  api: {
    get: (...args) => apiGetMock(...args),
    post: (...args) => apiPostMock(...args)
  },
  setAuthToken: (...args) => setAuthTokenMock(...args),
  setUnauthorizedHandler: (...args) => setUnauthorizedHandlerMock(...args)
}));

import { AuthProvider, useAuth } from './AuthContext.jsx';

function Consumer() {
  const { token, user, login, logout, changePassword } = useAuth();

  return (
    <div>
      <div data-testid="token">{token || ''}</div>
      <div data-testid="user">{user?.email || ''}</div>
      <button onClick={() => login('admin@aprende.ai', 'Admin123!')}>login</button>
      <button onClick={() => logout()}>logout</button>
      <button onClick={() => changePassword('old-pass', 'new-pass-123')}>change-password</button>
    </div>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  test('bootstrapa usuário quando existe token salvo', async () => {
    localStorage.setItem('aprende_ai_token', 'token-salvo');
    apiGetMock.mockResolvedValueOnce({ user: { email: 'admin@aprende.ai' } });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(apiGetMock).toHaveBeenCalledWith('/api/auth/me'));
    expect(screen.getByTestId('token').textContent).toBe('token-salvo');
    expect(screen.getByTestId('user').textContent).toBe('admin@aprende.ai');
    expect(setAuthTokenMock).toHaveBeenCalledWith('token-salvo');
    expect(setUnauthorizedHandlerMock).toHaveBeenCalledTimes(1);
  });

  test('limpa sessão quando bootstrap falha', async () => {
    localStorage.setItem('aprende_ai_token', 'token-invalido');
    apiGetMock.mockRejectedValueOnce(new Error('401'));

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('token').textContent).toBe(''));
    expect(localStorage.getItem('aprende_ai_token')).toBeNull();
  });

  test('faz login, persiste token e atualiza usuário', async () => {
    apiGetMock.mockResolvedValueOnce({ user: { email: 'novo@aprende.ai' } });
    apiPostMock.mockResolvedValueOnce({
      token: 'novo-token',
      user: { email: 'novo@aprende.ai' }
    });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('login'));

    await waitFor(() => expect(screen.getByTestId('token').textContent).toBe('novo-token'));
    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('novo@aprende.ai'));
    expect(localStorage.getItem('aprende_ai_token')).toBe('novo-token');
    expect(apiPostMock).toHaveBeenCalledWith('/api/auth/login', {
      email: 'admin@aprende.ai',
      password: 'Admin123!'
    });
  });

  test('logout limpa estado local e storage', async () => {
    localStorage.setItem('aprende_ai_token', 'token-salvo');
    apiGetMock.mockResolvedValueOnce({ user: { email: 'admin@aprende.ai' } });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('admin@aprende.ai'));
    fireEvent.click(screen.getByText('logout'));

    await waitFor(() => expect(screen.getByTestId('token').textContent).toBe(''));
    expect(localStorage.getItem('aprende_ai_token')).toBeNull();
    expect(setAuthTokenMock).toHaveBeenLastCalledWith(null);
  });

  test('changePassword delega para endpoint correto', async () => {
    apiPostMock.mockResolvedValueOnce({ message: 'ok' });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('change-password'));

    await waitFor(() => {
      expect(apiPostMock).toHaveBeenCalledWith('/api/auth/change-password', {
        currentPassword: 'old-pass',
        newPassword: 'new-pass-123'
      });
    });
  });

  test('callback de não autorizado limpa sessão', async () => {
    localStorage.setItem('aprende_ai_token', 'token-salvo');
    apiGetMock.mockResolvedValueOnce({ user: { email: 'admin@aprende.ai' } });

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>
    );

    await waitFor(() => expect(screen.getByTestId('user').textContent).toBe('admin@aprende.ai'));

    const unauthorizedCallback = setUnauthorizedHandlerMock.mock.calls[0][0];
    await act(async () => {
      unauthorizedCallback();
    });

    await waitFor(() => expect(screen.getByTestId('token').textContent).toBe(''));
    expect(screen.getByTestId('user').textContent).toBe('');
    expect(localStorage.getItem('aprende_ai_token')).toBeNull();
  });

  test('useAuth fora do provider lança erro', () => {
    function BrokenConsumer() {
      useAuth();
      return null;
    }

    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => render(<BrokenConsumer />)).toThrow('useAuth precisa ser utilizado dentro de AuthProvider');

    consoleErrorSpy.mockRestore();
  });
});
