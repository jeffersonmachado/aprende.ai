import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const logoutMock = vi.fn();
const changePasswordMock = vi.fn();
let mockedUser = { name: 'Admin', email: 'admin@aprende.ai' };

vi.mock('../context/AuthContext.jsx', () => ({
  useAuth: () => ({
    logout: (...args) => logoutMock(...args),
    changePassword: (...args) => changePasswordMock(...args),
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
      <MemoryRouter initialEntries={[initialEntry]}>
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
    expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Trilhas/i })).toBeInTheDocument();
    expect(screen.getByText('Tracks content')).toBeInTheDocument();
  });

  test('bloqueia senha curta', async () => {
    renderLayout();

    const inputs = screen.getAllByLabelText(/senha/i);
    fireEvent.change(inputs[0], { target: { value: 'atual123' } });
    fireEvent.change(inputs[1], { target: { value: '123' } });
    fireEvent.change(inputs[2], { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar senha' }));

    expect(await screen.findByText('A nova senha deve ter ao menos 8 caracteres.')).toBeInTheDocument();
    expect(changePasswordMock).not.toHaveBeenCalled();
  });

  test('bloqueia confirmação divergente', async () => {
    renderLayout();

    const inputs = screen.getAllByLabelText(/senha/i);
    fireEvent.change(inputs[0], { target: { value: 'atual123' } });
    fireEvent.change(inputs[1], { target: { value: 'nova-senha-123' } });
    fireEvent.change(inputs[2], { target: { value: 'outra-senha-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar senha' }));

    expect(await screen.findByText('A confirmação da nova senha não confere.')).toBeInTheDocument();
    expect(changePasswordMock).not.toHaveBeenCalled();
  });

  test('envia alteração de senha com sucesso', async () => {
    changePasswordMock.mockResolvedValueOnce({ message: 'Senha alterada com sucesso.' });
    renderLayout();

    const inputs = screen.getAllByLabelText(/senha/i);
    fireEvent.change(inputs[0], { target: { value: 'atual123' } });
    fireEvent.change(inputs[1], { target: { value: 'nova-senha-123' } });
    fireEvent.change(inputs[2], { target: { value: 'nova-senha-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar senha' }));

    await waitFor(() => {
      expect(changePasswordMock).toHaveBeenCalledWith('atual123', 'nova-senha-123');
    });
    expect(await screen.findByText('Senha alterada com sucesso.')).toBeInTheDocument();
  });

  test('usa mensagem padrão de sucesso e fallback de usuário', async () => {
    mockedUser = null;
    changePasswordMock.mockResolvedValueOnce({});
    renderLayout('/knowledge');

    expect(screen.getByText('Usuário')).toBeInTheDocument();

    const inputs = screen.getAllByLabelText(/senha/i);
    fireEvent.change(inputs[0], { target: { value: 'atual123' } });
    fireEvent.change(inputs[1], { target: { value: 'nova-senha-123' } });
    fireEvent.change(inputs[2], { target: { value: 'nova-senha-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar senha' }));

    expect(await screen.findByText('Senha atualizada com sucesso.')).toBeInTheDocument();
    expect(screen.getByText('Knowledge content')).toBeInTheDocument();
  });

  test('mostra erro quando alteração de senha falha', async () => {
    changePasswordMock.mockRejectedValueOnce(new Error('Senha atual inválida'));
    renderLayout();

    const inputs = screen.getAllByLabelText(/senha/i);
    fireEvent.change(inputs[0], { target: { value: 'atual123' } });
    fireEvent.change(inputs[1], { target: { value: 'nova-senha-123' } });
    fireEvent.change(inputs[2], { target: { value: 'nova-senha-123' } });
    fireEvent.click(screen.getByRole('button', { name: 'Atualizar senha' }));

    expect(await screen.findByText('Senha atual inválida')).toBeInTheDocument();
  });

  test('executa logout ao clicar em sair', () => {
    renderLayout();

    fireEvent.click(screen.getByRole('button', { name: 'Sair' }));

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  test('usa dashboard como módulo ativo quando rota não está mapeada', () => {
    renderLayout('/rota-desconhecida');

    expect(screen.getByText('Fallback content')).toBeInTheDocument();
    expect(screen.getAllByText('Dashboard').length).toBeGreaterThanOrEqual(2);
  });
});
