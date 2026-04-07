import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true };

// --- Mocks ---

const useJourneyRuntimeMock = vi.fn();
const saveOnboardingMock = vi.fn();
const getJourneyEngineRuntimeMock = vi.fn();
const startJourneyEnginePhaseMock = vi.fn();
const submitJourneyEngineDecisionMock = vi.fn();
const resolveJourneyEngineTwistMock = vi.fn();
const finalizeJourneyEnginePhaseMock = vi.fn();

vi.mock('../context/JourneyRuntimeContext.jsx', () => ({
  useJourneyRuntime: () => useJourneyRuntimeMock(),
}));

vi.mock('../services/profileApi.js', () => ({
  saveOnboarding: (...args) => saveOnboardingMock(...args),
}));

vi.mock('../services/journeyEngineApi.js', () => ({
  getJourneyEngineRuntime: (...args) => getJourneyEngineRuntimeMock(...args),
  startJourneyEnginePhase: (...args) => startJourneyEnginePhaseMock(...args),
  submitJourneyEngineDecision: (...args) => submitJourneyEngineDecisionMock(...args),
  resolveJourneyEngineTwist: (...args) => resolveJourneyEngineTwistMock(...args),
  finalizeJourneyEnginePhase: (...args) => finalizeJourneyEnginePhaseMock(...args),
}));

import AprendeAiGamePage from './AprendeAiGamePage.jsx';

// --- Helpers ---

function buildRuntimeNeedsOnboarding(overrides = {}) {
  return {
    runtime: {
      campaign: { chapters: [] },
      journey: { progressPercent: 0, level: 1 },
    },
    loading: false,
    error: null,
    refreshRuntime: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function buildRuntimeWithChapters(chapters) {
  const defaultChapters = [
    {
      id: 'cap-1',
      title: 'Capítulo 1',
      phases: [
        {
          id: 'phase-1',
          type: 'mission-play',
          title: 'Fase 1',
          content: {
            mission: {
              id: 'mission-1',
              choices: [
                { id: 'choice-a', label: 'Escolha A' },
                { id: 'choice-b', label: 'Escolha B' },
              ],
            },
          },
        },
      ],
    },
  ];

  return {
    runtime: {
      mission: { title: 'Missão teste' },
      journey: {
        progressPercent: 61,
        level: 3,
        xp: 120,
        streak: 2,
        campaignProgress: {
          chapterId: 'cap-1',
          unlockedChapterIds: ['cap-1'],
          completedChapterIds: [],
        },
      },
      campaign: { chapters: chapters ?? defaultChapters },
    },
    loading: false,
    error: null,
    refreshRuntime: vi.fn().mockResolvedValue(undefined),
  };
}

function renderPage() {
  return render(
    <MemoryRouter future={routerFuture}>
      <AprendeAiGamePage />
    </MemoryRouter>
  );
}

// --- Tests ---

describe('AprendeAiGamePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getJourneyEngineRuntimeMock.mockResolvedValue({
      mission: { id: 'm1', title: 'Missão engine', choices: [] },
      worldState: {},
    });
    startJourneyEnginePhaseMock.mockResolvedValue({ ok: true });
    submitJourneyEngineDecisionMock.mockResolvedValue({ ok: true });
    resolveJourneyEngineTwistMock.mockResolvedValue({ ok: true });
    finalizeJourneyEnginePhaseMock.mockResolvedValue({ ok: true });
    saveOnboardingMock.mockResolvedValue({ ok: true });
  });

  test('mostra tela de carregamento enquanto journeyRuntime está sendo carregado', () => {
    useJourneyRuntimeMock.mockReturnValue({
      runtime: null,
      loading: true,
      error: null,
      refreshRuntime: vi.fn(),
    });

    renderPage();

    expect(screen.getByText('Sincronizando com o backend')).toBeInTheDocument();
  });

  test('mostra onboarding (seleção de perfil) quando não há capítulos nem progresso', async () => {
    useJourneyRuntimeMock.mockReturnValue(buildRuntimeNeedsOnboarding());

    renderPage();

    expect(await screen.findByText('Qual é o seu perfil?')).toBeInTheDocument();
    expect(screen.getByText('Explorador')).toBeInTheDocument();
    expect(screen.getByText('Prático')).toBeInTheDocument();
    expect(screen.getByText('Narrativo')).toBeInTheDocument();
    expect(screen.getByText('Analítico')).toBeInTheDocument();
  });

  test('mostra mapa da jornada quando runtime tem capítulos', async () => {
    useJourneyRuntimeMock.mockReturnValue(buildRuntimeWithChapters());

    renderPage();

    expect(await screen.findByText('Mapa da jornada')).toBeInTheDocument();
  });

  test('mapa exibe estado vazio quando capítulos retornam array vazio após onboarding', async () => {
    useJourneyRuntimeMock.mockReturnValue(buildRuntimeWithChapters([]));

    renderPage();

    expect(await screen.findByText('Mapa da jornada')).toBeInTheDocument();
    expect(await screen.findByText('Jornada sendo montada')).toBeInTheDocument();
  });

  test('CTA de onboarding não avança sem seleção de perfil', async () => {
    useJourneyRuntimeMock.mockReturnValue(buildRuntimeNeedsOnboarding());

    renderPage();

    expect(await screen.findByText('Qual é o seu perfil?')).toBeInTheDocument();

    // Clica no CTA sem selecionar perfil
    fireEvent.click(screen.getByText('Continuar →'));

    // Deve permanecer no passo 0
    expect(screen.getByText('Qual é o seu perfil?')).toBeInTheDocument();
    expect(saveOnboardingMock).not.toHaveBeenCalled();
  });

  test('onboarding completo percorre os 3 passos e chama saveOnboarding com dados corretos', async () => {
    const refreshRuntime = vi.fn().mockResolvedValue(undefined);
    useJourneyRuntimeMock.mockReturnValue(buildRuntimeNeedsOnboarding({ refreshRuntime }));

    renderPage();

    // Passo 0 — perfil "Analítico"
    expect(await screen.findByText('Qual é o seu perfil?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Analítico'));
    fireEvent.click(screen.getByText('Continuar →'));

    // Passo 1 — objetivo "Desenvolver uma competência"
    expect(await screen.findByText('Qual é seu objetivo?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Desenvolver uma competência'));
    fireEvent.click(screen.getByText('Continuar →'));

    // Passo 2 — nível "Avançado"
    expect(await screen.findByText('Seu nível de experiência?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Avançado'));
    fireEvent.click(screen.getByText('Entrar na jornada'));

    await waitFor(() => {
      expect(saveOnboardingMock).toHaveBeenCalledWith(
        expect.objectContaining({
          displayName: 'Aprendiz',
          profileKey: 'analitico',
          dominantStyle: 'analitico',
          contextType: 'B2C',
          area: 'Dados',
          experienceLevel: 'avancado',
          goalTitle: 'Desenvolver uma competência',
          goalType: 'desenvolver habilidade',
        })
      );
    });

    expect(refreshRuntime).toHaveBeenCalled();
  });

  test('onboarding não avança do passo 1 sem seleção de objetivo', async () => {
    useJourneyRuntimeMock.mockReturnValue(buildRuntimeNeedsOnboarding());

    renderPage();

    // Passo 0 — selecionar perfil e avançar
    expect(await screen.findByText('Qual é o seu perfil?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Explorador'));
    fireEvent.click(screen.getByText('Continuar →'));

    // Passo 1 — tentar avançar sem selecionar objetivo
    expect(await screen.findByText('Qual é seu objetivo?')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Continuar →'));

    // Deve permanecer no passo 1
    expect(screen.getByText('Qual é seu objetivo?')).toBeInTheDocument();
  });
});
