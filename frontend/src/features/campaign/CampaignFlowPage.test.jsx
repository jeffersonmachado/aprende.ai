import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';

const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true };

const useCampaignRuntimeMock = vi.fn();
const getAdaptiveJourneyRuntimeMock = vi.fn();

vi.mock('../../context/CampaignRuntimeContext.jsx', () => ({
  useCampaignRuntime: () => useCampaignRuntimeMock()
}));

vi.mock('../../services/journeyAdaptiveApi.js', () => ({
  getAdaptiveJourneyRuntime: (...args) => getAdaptiveJourneyRuntimeMock(...args)
}));

vi.mock('../../context/JourneyEngineRuntimeContext.jsx', () => ({
  JourneyEngineRuntimeProvider: ({ children }) => <>{children}</>
}));

vi.mock('../journey-engine/PhaseBriefingPage.jsx', () => ({
  default: () => <div>Mock Briefing Phase</div>
}));

vi.mock('../journey-engine/MissionPlayPage.jsx', () => ({
  default: () => <div>Mock Mission Phase</div>
}));

vi.mock('../journey-engine/ConsequencePage.jsx', () => ({
  default: () => <div>Mock Consequence Phase</div>
}));

vi.mock('../journey-engine/PlotTwistPage.jsx', () => ({
  default: () => <div>Mock Twist Phase</div>
}));

vi.mock('../journey-engine/ReflectionPage.jsx', () => ({
  default: () => <div>Mock Reflection Phase</div>
}));

vi.mock('../journey-engine/PhaseResultPage.jsx', () => ({
  default: () => <div>Mock Result Phase</div>
}));

vi.mock('../journey-engine/ProgressionPage.jsx', () => ({
  default: ({ advanceLabel }) => <div>{`Mock Progression Phase :: ${advanceLabel}`}</div>
}));

import CampaignFlowPage from './CampaignFlowPage.jsx';

function buildPhase(id, type, title) {
  return {
    id,
    type,
    title,
    description: `Descrição de ${title}`,
    chapterTitle: 'Capítulo Alpha'
  };
}

function renderPage() {
  return render(
    <MemoryRouter future={routerFuture}>
      <CampaignFlowPage />
    </MemoryRouter>
  );
}

describe('CampaignFlowPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getAdaptiveJourneyRuntimeMock.mockRejectedValue(new Error('Sessão adaptativa ainda não iniciada'));
  });

  test('renderiza a fase briefing e o clima correto do contrato novo', async () => {
    const phases = [
      buildPhase('briefing', 'briefing', 'Briefing'),
      buildPhase('mission', 'mission-play', 'Missão')
    ];

    useCampaignRuntimeMock.mockReturnValue({
      currentPhase: phases[0],
      currentIndex: 0,
      totalPhases: phases.length,
      progressPercent: 50,
      goToNextPhase: vi.fn(),
      phases,
      isLastPhase: false,
      availableChapterCount: 1,
      totalChapterCount: 2
    });

    renderPage();

    expect(screen.getByText('Capítulo Alpha')).toBeInTheDocument();
    expect(screen.getByText('Leitura estratégica')).toBeInTheDocument();
    expect(screen.getByText('Mock Briefing Phase')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Abrir jornada adaptativa' })).toBeInTheDocument();
  });

  test('renderiza a fase progression com clima de transição estratégica', async () => {
    const phases = [
      buildPhase('phase-result', 'phase-result', 'Resultado'),
      buildPhase('progression', 'progression', 'Próximo passo')
    ];

    useCampaignRuntimeMock.mockReturnValue({
      currentPhase: phases[1],
      currentIndex: 1,
      totalPhases: phases.length,
      progressPercent: 100,
      goToNextPhase: vi.fn(),
      phases,
      isLastPhase: true,
      availableChapterCount: 2,
      totalChapterCount: 2
    });

    renderPage();

    expect(screen.getByText('Transição estratégica')).toBeInTheDocument();
    expect(screen.getByText('Mock Progression Phase :: Concluir campanha')).toBeInTheDocument();
    expect(screen.getByText('Fase 2 de 2')).toBeInTheDocument();
    expect(await screen.findByRole('link', { name: 'Continuar na jornada adaptativa' })).toBeInTheDocument();
  });

  test('personaliza o resumo adaptativo quando existe trilha ativa', async () => {
    const phases = [
      buildPhase('briefing', 'briefing', 'Briefing'),
      buildPhase('mission', 'mission-play', 'Missão')
    ];

    getAdaptiveJourneyRuntimeMock.mockResolvedValueOnce({
      status: 'active',
      currentChapter: { title: 'Capítulo de negociação consultiva' },
      progress: {
        completedChapters: 2,
        estimatedChapterCount: 5,
        canClose: false,
        competency: {
          name: 'Negociação adaptativa',
          score: 68,
          targetScore: 80
        }
      }
    });

    useCampaignRuntimeMock.mockReturnValue({
      currentPhase: phases[0],
      currentIndex: 0,
      totalPhases: phases.length,
      progressPercent: 50,
      goToNextPhase: vi.fn(),
      phases,
      isLastPhase: false,
      availableChapterCount: 1,
      totalChapterCount: 2
    });

    renderPage();

    expect(await screen.findByText('Trilha adaptativa em andamento')).toBeInTheDocument();
    expect(screen.getByText('Negociação adaptativa')).toBeInTheDocument();
    expect(screen.getByText(/Capítulo atual: Capítulo de negociação consultiva/i)).toBeInTheDocument();
    expect(screen.getByText('2/5 capítulos · Score 68 / meta 80')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Retomar jornada adaptativa' })).toBeInTheDocument();
  });

  test('personaliza o CTA da progressão quando a jornada adaptativa já pode ser encerrada', async () => {
    const phases = [
      buildPhase('phase-result', 'phase-result', 'Resultado'),
      buildPhase('progression', 'progression', 'Próximo passo')
    ];

    getAdaptiveJourneyRuntimeMock.mockResolvedValueOnce({
      status: 'active',
      progress: {
        completedChapters: 5,
        estimatedChapterCount: 5,
        canClose: true,
        competency: {
          name: 'Negociação adaptativa',
          score: 82,
          targetScore: 80
        }
      }
    });

    useCampaignRuntimeMock.mockReturnValue({
      currentPhase: phases[1],
      currentIndex: 1,
      totalPhases: phases.length,
      progressPercent: 100,
      goToNextPhase: vi.fn(),
      phases,
      isLastPhase: true,
      availableChapterCount: 2,
      totalChapterCount: 2
    });

    renderPage();

    expect(await screen.findByText('Encerramento adaptativo disponível')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Revisar e encerrar jornada adaptativa' })).toBeInTheDocument();
  });

  test('usa label de desbloqueio quando ainda existe próximo capítulo bloqueado', () => {
    const phases = [
      buildPhase('phase-result', 'phase-result', 'Resultado'),
      buildPhase('progression', 'progression', 'Próximo passo')
    ];

    useCampaignRuntimeMock.mockReturnValue({
      currentPhase: phases[1],
      currentIndex: 1,
      totalPhases: phases.length,
      progressPercent: 100,
      goToNextPhase: vi.fn(),
      phases,
      isLastPhase: false,
      availableChapterCount: 1,
      totalChapterCount: 2
    });

    renderPage();

    expect(screen.getByText('Mock Progression Phase :: Desbloquear próximo capítulo')).toBeInTheDocument();
    expect(screen.getByText((value) => value.includes('capítulos 1/2'))).toBeInTheDocument();
  });

  test('exibe erro visível quando o runtime não entrega fase ativa', () => {
    useCampaignRuntimeMock.mockReturnValue({
      currentPhase: null,
      currentIndex: 0,
      totalPhases: 0,
      progressPercent: 0,
      goToNextPhase: vi.fn(),
      phases: [],
      isLastPhase: true,
      availableChapterCount: 0,
      totalChapterCount: 0,
      runtimeError: 'Falha ao carregar runtime da jornada.'
    });

    renderPage();

    expect(screen.getByText('Falha ao carregar runtime da jornada.')).toBeInTheDocument();
  });
});