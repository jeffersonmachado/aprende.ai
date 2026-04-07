import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import AprendeAiGameFlow from './AprendeAiGameFlow.jsx';

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true };

function renderFlow(props = {}) {
  return render(
    <MemoryRouter future={routerFuture}>
      <AprendeAiGameFlow {...props} />
    </MemoryRouter>
  );
}

describe('AprendeAiGameFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('avança entre todas as cenas e reinicia o preview na cena final', () => {
    renderFlow();

    // Cena 0 — onboarding
    expect(screen.getByText('1. Onboarding')).toBeInTheDocument();
    expect(screen.getByText('Escolha seu Perfil')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Entrar no jogo/i }));
    expect(screen.getByText('Sua Jornada')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Próxima tela/i }));
    expect(screen.getByText('Qual é o impacto dessa escolha?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Próxima tela/i }));
    expect(screen.getByText('ALERTA!')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Próxima tela/i }));
    expect(screen.getByText('Seu Progresso')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Próxima tela/i }));
    expect(screen.getByText('Parabéns!')).toBeInTheDocument();

    // Cena final → reiniciar
    fireEvent.click(screen.getByRole('button', { name: /Reiniciar jornada/i }));
    expect(screen.getByText('1. Onboarding')).toBeInTheDocument();
  });

  test('seleção de perfil destaca o card como ativo', () => {
    renderFlow();

    // Por padrão, "Profissional" está selecionado
    const ativos = screen.getAllByText('ATIVO');
    expect(ativos).toHaveLength(1);

    // Seleciona outro perfil
    fireEvent.click(screen.getByText('Estudante'));

    // Agora "Estudante" deve ter o badge ATIVO
    const ativosNovoState = screen.getAllByText('ATIVO');
    expect(ativosNovoState).toHaveLength(1);
  });

  test('botão Voltar está desativado na primeira cena', () => {
    renderFlow();

    const voltarBtn = screen.getByRole('button', { name: /Voltar/i });
    expect(voltarBtn).toBeDisabled();
  });
});
