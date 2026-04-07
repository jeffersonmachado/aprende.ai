import { fireEvent, render, screen, waitFor } from '@testing-library/react';
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

function createDeferred() {
  let resolve;
  let reject;

  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, resolve, reject };
}

describe('AprendeAiGameFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('avança entre cenas e reinicia o preview na cena final', () => {
    renderFlow();

    expect(screen.getByText('1. Escolha seu Perfil')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver próxima cena' }));
    expect(screen.getByText('Sua Jornada')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver próxima cena' }));
    expect(screen.getByText('Qual decisão move a campanha agora?')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver próxima cena' }));
    expect(screen.getByText('ALERTA!')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver próxima cena' }));
    expect(screen.getByText('Seu Progresso')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Ver próxima cena' }));
    expect(screen.getByText('Parabéns!')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Reiniciar preview' }));
    expect(screen.getByText('1. Escolha seu Perfil')).toBeInTheDocument();
  });

  test('mostra indicador de processamento durante ação assíncrona e envia o perfil selecionado', async () => {
    const deferred = createDeferred();
    const onboardingHandler = vi.fn(() => deferred.promise);

    renderFlow({
      experienceMode: 'runtime',
      moduleLinks: {
        onboarding: { label: 'Abrir onboarding real' },
      },
      actionHandlers: {
        onboarding: onboardingHandler,
      },
    });

    fireEvent.click(screen.getByText('Estudante'));
    fireEvent.click(screen.getByRole('button', { name: 'Abrir onboarding real' }));

    expect(onboardingHandler).toHaveBeenCalledWith({ selectedProfile: 'Estudante' });
    expect(screen.getByRole('button', { name: 'Processando...' })).toBeInTheDocument();

    deferred.resolve();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Abrir onboarding real' })).toBeInTheDocument();
    });
  });

  test('exibe banner de erro do runtime e da ação quando a operação falha', async () => {
    const onboardingHandler = vi.fn().mockRejectedValue(new Error('Falha customizada da ação'));

    renderFlow({
      experienceMode: 'runtime',
      moduleLinks: {
        onboarding: { label: 'Abrir onboarding real' },
      },
      status: {
        loading: true,
        error: 'Falha de sincronização do runtime',
      },
      actionHandlers: {
        onboarding: onboardingHandler,
      },
    });

    expect(screen.getByText('Sincronizando runtime')).toBeInTheDocument();
    expect(screen.getByText('Falha de sincronização do runtime')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Abrir onboarding real' }));

    expect(await screen.findByText('Falha customizada da ação')).toBeInTheDocument();
  });
});
