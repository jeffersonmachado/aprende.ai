import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true };

const useJourneyRuntimeMock = vi.fn();
const getJourneySummaryMock = vi.fn();
const getEvolutionMock = vi.fn();
const getAdaptiveJourneyRuntimeMock = vi.fn();
const saveOnboardingMock = vi.fn();
const postJourneyTelemetryEventMock = vi.fn();
const startJourneyEnginePhaseMock = vi.fn();
const submitJourneyEngineDecisionMock = vi.fn();

vi.mock('../context/JourneyRuntimeContext.jsx', () => ({
  useJourneyRuntime: () => useJourneyRuntimeMock()
}));

vi.mock('../services/journeyApi.js', () => ({
  getJourneySummary: (...args) => getJourneySummaryMock(...args)
}));

vi.mock('../services/simulationApi.js', () => ({
  getEvolution: (...args) => getEvolutionMock(...args)
}));

vi.mock('../services/journeyAdaptiveApi.js', () => ({
  getAdaptiveJourneyRuntime: (...args) => getAdaptiveJourneyRuntimeMock(...args)
}));

vi.mock('../services/profileApi.js', () => ({
  saveOnboarding: (...args) => saveOnboardingMock(...args)
}));

vi.mock('../services/journeyTelemetryApi.js', () => ({
  postJourneyTelemetryEvent: (...args) => postJourneyTelemetryEventMock(...args)
}));

vi.mock('../services/journeyEngineApi.js', () => ({
  startJourneyEnginePhase: (...args) => startJourneyEnginePhaseMock(...args),
  submitJourneyEngineDecision: (...args) => submitJourneyEngineDecisionMock(...args)
}));

import AprendeAiGamePage from './AprendeAiGamePage.jsx';

function buildRuntime(overrides = {}) {
  return {
    runtime: {
      mission: {
        title: 'Missão oficial',
        objective: 'Responder a situação crítica.',
        context: 'Mentoria de campo'
      },
      journey: {
        progressPercent: 61,
        level: 3,
        campaignProgress: {
          chapterId: 'cap-1',
          phaseId: 'phase-1',
          unlockedChapterIds: ['cap-1']
        },
        activePlotTwist: null
      },
      campaign: {
        chapters: [
          {
            id: 'cap-1',
            title: 'Capítulo 1',
            phases: [
              {
                id: 'phase-1',
                type: 'mission-play',
                title: 'Fase 1',
                description: 'Descrição da fase',
                content: {
                  mission: {
                    id: 'mission-1',
                    choices: [
                      { id: 'choice-a', label: 'Escolha A' },
                      { id: 'choice-b', label: 'Escolha B' }
                    ]
                  }
                }
              }
            ]
          }
        ]
      }
    },
    loading: false,
    error: '',
    firePlotTwist: vi.fn().mockResolvedValue({ runtime: {} }),
    resolveActivePlotTwist: vi.fn().mockResolvedValue({ runtime: {} }),
    ...overrides
  };
}

function buildRuntimeWithPhase(phase) {
  return buildRuntime({
    runtime: {
      mission: {
        title: 'Missão oficial',
        objective: 'Responder a situação crítica.',
        context: 'Mentoria de campo'
      },
      journey: {
        progressPercent: 61,
        level: 3,
        campaignProgress: {
          chapterId: 'cap-1',
          phaseId: phase.id,
          unlockedChapterIds: ['cap-1']
        },
        activePlotTwist: null
      },
      campaign: {
        chapters: [
          {
            id: 'cap-1',
            title: 'Capítulo 1',
            phases: [phase]
          }
        ]
      }
    }
  });
}

function buildMissionPhaseWithChoices(choices) {
  return {
    id: 'phase-1',
    type: 'mission-play',
    title: 'Fase 1',
    description: 'Descrição da fase',
    content: {
      mission: {
        id: 'mission-1',
        choices,
      },
    },
  };
}

function renderPage() {
  return render(
    <MemoryRouter future={routerFuture}>
      <AprendeAiGamePage />
    </MemoryRouter>
  );
}

describe('AprendeAiGamePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useJourneyRuntimeMock.mockReturnValue(buildRuntime());
    getJourneySummaryMock.mockResolvedValue({
      adaptive: {
        persona: 'profissional experiente',
        goal: 'Preparar campanha real',
        scenarios: [{ id: 's1' }]
      }
    });
    getEvolutionMock.mockResolvedValue({
      competencies: [{ competencyId: 'tomada_de_decisao', score: 77 }],
      decisionHistory: [{ id: 'd1' }],
      progression: { progressPercent: 61 }
    });
    getAdaptiveJourneyRuntimeMock.mockResolvedValue({
      journeyId: 'adaptive-1',
      currentChapter: { title: 'Capítulo adaptativo' },
      progress: {
        completedChapters: 1,
        estimatedChapterCount: 4,
        canClose: false,
        competency: { name: 'Negociação adaptativa' }
      }
    });
    saveOnboardingMock.mockResolvedValue({ ok: true });
    postJourneyTelemetryEventMock.mockResolvedValue({ ok: true });
    startJourneyEnginePhaseMock.mockResolvedValue({ ok: true });
    submitJourneyEngineDecisionMock.mockResolvedValue({ ok: true });
  });

  test('salva onboarding e envia telemetria ao abrir o CTA da primeira cena', async () => {
    useJourneyRuntimeMock.mockReturnValue(buildRuntimeWithPhase({
      id: 'phase-intro',
      type: 'intro',
      title: 'Introdução',
      description: 'Cena inicial',
      content: {}
    }));

    renderPage();

    expect(await screen.findByText('1. Escolha seu Perfil')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Avançar' }));

    await waitFor(() => {
      expect(saveOnboardingMock).toHaveBeenCalledWith(expect.objectContaining({
        displayName: 'profissional experiente',
        profileKey: 'profissional',
        goalTitle: 'Tomar decisoes sob pressao com clareza'
      }));
    });

    expect(postJourneyTelemetryEventMock).toHaveBeenCalledWith(expect.objectContaining({
      eventType: 'gamified_onboarding_selected',
      stepId: 'gamified-onboarding'
    }));
  });

  test('envia a choice oficial correspondente à opção clicada na missão', async () => {
    renderPage();

    const missionChoice = await screen.findByText('Escolha B');
    fireEvent.click(missionChoice);

    await waitFor(() => {
      expect(startJourneyEnginePhaseMock).toHaveBeenCalledWith('phase-1', {
        chapterId: 'cap-1',
        missionId: 'mission-1'
      });
    });

    expect(submitJourneyEngineDecisionMock).toHaveBeenCalledWith({
      chapterId: 'cap-1',
      choiceId: 'choice-b',
      responseText: 'Escolha B'
    });
  });

  test('expõe todas as choices oficiais quando a missão tem mais de duas opções', async () => {
    useJourneyRuntimeMock.mockReturnValue(buildRuntimeWithPhase(buildMissionPhaseWithChoices([
      { id: 'choice-a', label: 'Escolha A' },
      { id: 'choice-b', label: 'Escolha B' },
      { id: 'choice-c', label: 'Escolha C' }
    ])));

    renderPage();

    const thirdMissionChoice = await screen.findByText('Escolha C');
    fireEvent.click(thirdMissionChoice);

    await waitFor(() => {
      expect(submitJourneyEngineDecisionMock).toHaveBeenCalledWith({
        chapterId: 'cap-1',
        choiceId: 'choice-c',
        responseText: 'Escolha C'
      });
    });
  });

  test('abre a cena final quando a fase ativa já está em fechamento', async () => {
    useJourneyRuntimeMock.mockReturnValue(buildRuntimeWithPhase({
      id: 'phase-result',
      type: 'phase-result',
      title: 'Resultado oficial',
      description: 'Fechamento da fase',
      content: {}
    }));

    renderPage();

    expect(await screen.findByText('Parabéns!')).toBeInTheDocument();
    expect(screen.getByText('Seu Desempenho')).toBeInTheDocument();
  });

  test('resolve twist ativo em vez de disparar novo twist', async () => {
    const resolveActivePlotTwist = vi.fn().mockResolvedValue({ runtime: {} });
    const firePlotTwist = vi.fn().mockResolvedValue({ runtime: {} });

    useJourneyRuntimeMock.mockReturnValue(buildRuntime({
      runtime: {
        mission: {
          title: 'Missão oficial',
          objective: 'Responder a situação crítica.',
          context: 'Mentoria de campo'
        },
        journey: {
          progressPercent: 61,
          level: 3,
          campaignProgress: {
            chapterId: 'cap-1',
            phaseId: 'phase-plot',
            unlockedChapterIds: ['cap-1']
          },
          activePlotTwist: {
            id: 'twist-1',
            title: 'Ruptura crítica'
          }
        },
        campaign: {
          chapters: [
            {
              id: 'cap-1',
              title: 'Capítulo 1',
              phases: [
                {
                  id: 'phase-plot',
                  type: 'plot-twist',
                  title: 'Ruptura',
                  description: 'Evento crítico',
                  content: {}
                }
              ]
            }
          ]
        }
      },
      firePlotTwist,
      resolveActivePlotTwist
    }));

    renderPage();

    expect(await screen.findByText('RUPTURA ATIVA!')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Ir para a campanha e responder a fase crítica atual.'));

    await waitFor(() => {
      expect(resolveActivePlotTwist).toHaveBeenCalledWith({
        twistLogId: 'twist-1',
        resolutionNotes: 'Resolvido pela experiencia gamificada: Ir para a campanha e responder a fase crítica atual.'
      });
    });

    expect(firePlotTwist).not.toHaveBeenCalled();
  });
});
