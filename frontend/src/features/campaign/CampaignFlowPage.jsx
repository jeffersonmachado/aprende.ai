import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ExperienceCard } from '../../components';
import { useCampaignRuntime } from '../../context/CampaignRuntimeContext.jsx';
import { getAdaptiveJourneyRuntime } from '../../services/journeyAdaptiveApi.js';
import { JourneyEngineRuntimeProvider } from '../../context/JourneyEngineRuntimeContext.jsx';
import PhaseBriefingPage from '../journey-engine/PhaseBriefingPage.jsx';
import MissionPlayPage from '../journey-engine/MissionPlayPage.jsx';
import ConsequencePage from '../journey-engine/ConsequencePage.jsx';
import PlotTwistPage from '../journey-engine/PlotTwistPage.jsx';
import ReflectionPage from '../journey-engine/ReflectionPage.jsx';
import PhaseResultPage from '../journey-engine/PhaseResultPage.jsx';
import ProgressionPage from '../journey-engine/ProgressionPage.jsx';

const PHASE_CLIMATE_LABELS = {
  briefing: 'Leitura estratégica',
  'mission-play': 'Decisão crítica',
  consequence: 'Impacto sistêmico',
  'plot-twist': 'Ruptura de contexto',
  reflection: 'Debrief pedagógico',
  'phase-result': 'Fechamento de performance',
  progression: 'Transição estratégica'
};

const ADAPTIVE_ENTRY_CONTENT = {
  progression: {
    title: 'Próximo modo disponível',
    body: 'Continue a evolução por competência com capítulos inferidos pelo backend e trilha adaptativa oficial.',
    cta: 'Continuar na jornada adaptativa'
  },
  default: {
    title: 'Modo complementar',
    body: 'A jornada adaptativa pode aprofundar o gap de competência mais crítico sem depender de contagem fixa de capítulos.',
    cta: 'Abrir jornada adaptativa'
  }
};

function buildAdaptiveEntry(currentPhaseType, adaptiveRuntime) {
  const fallback = currentPhaseType === 'progression' ? ADAPTIVE_ENTRY_CONTENT.progression : ADAPTIVE_ENTRY_CONTENT.default;

  if (!adaptiveRuntime?.progress?.competency) {
    return {
      title: fallback.title,
      headline: 'Jornada Adaptativa',
      body: fallback.body,
      cta: fallback.cta,
      meta: ''
    };
  }

  const progress = adaptiveRuntime.progress;
  const competency = progress.competency;
  const currentChapterTitle = adaptiveRuntime.currentChapter?.title;
  const chapterCounter = `${Number(progress.completedChapters || 0)}/${Number(progress.estimatedChapterCount || 0)} capítulos`;
  const scoreLine = `Score ${Number(competency.score || 0).toFixed(0)} / meta ${Number(competency.targetScore || 0).toFixed(0)}`;

  if (progress.canClose) {
    return {
      title: 'Encerramento adaptativo disponível',
      headline: competency.name,
      body: 'O backend já sinaliza elegibilidade de fechamento. Revise a trilha adaptativa e encerre a jornada oficial por competência.',
      cta: 'Revisar e encerrar jornada adaptativa',
      meta: `${chapterCounter} · ${scoreLine}`
    };
  }

  return {
    title: currentPhaseType === 'progression' ? 'Continuidade por competência' : 'Trilha adaptativa em andamento',
    headline: competency.name,
    body: currentChapterTitle
      ? `Capítulo atual: ${currentChapterTitle}. O backend continua inserindo reforço e aceleração de forma controlada.`
      : 'O backend mantém uma trilha adaptativa ativa com progressão guiada por competência.',
    cta: currentPhaseType === 'progression' ? 'Continuar na jornada adaptativa' : 'Retomar jornada adaptativa',
    meta: `${chapterCounter} · ${scoreLine}`
  };
}

function CampaignPhaseBody({ phase, onAdvance, isLastPhase }) {
  if (phase?.type === 'briefing') {
    return <PhaseBriefingPage campaignPhase={phase} onAdvance={onAdvance} />;
  }

  if (phase?.type === 'mission-play') {
    return <MissionPlayPage campaignPhase={phase} onAdvance={onAdvance} />;
  }

  if (phase?.type === 'consequence') {
    return <ConsequencePage campaignPhase={phase} onAdvance={onAdvance} />;
  }

  if (phase?.type === 'plot-twist') {
    return <PlotTwistPage campaignPhase={phase} onAdvance={onAdvance} />;
  }

  if (phase?.type === 'reflection') {
    return <ReflectionPage campaignPhase={phase} onAdvance={onAdvance} />;
  }

  if (phase?.type === 'phase-result') {
    return <PhaseResultPage campaignPhase={phase} onAdvance={onAdvance} />;
  }

  if (phase?.type === 'progression') {
    return <ProgressionPage campaignPhase={phase} onAdvance={onAdvance} advanceLabel={isLastPhase ? 'Concluir campanha' : 'Desbloquear próximo capítulo'} />;
  }

  return null;
}

export default function CampaignFlowPage() {
  const { currentPhase, currentIndex, totalPhases, progressPercent, goToNextPhase, phases, isLastPhase, availableChapterCount, totalChapterCount, runtimeError } = useCampaignRuntime();
  const [adaptiveRuntime, setAdaptiveRuntime] = useState(null);

  useEffect(() => {
    if (!currentPhase) return;

    let isCancelled = false;

    getAdaptiveJourneyRuntime()
      .then((payload) => {
        if (!isCancelled) {
          setAdaptiveRuntime(payload);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setAdaptiveRuntime(null);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [currentPhase]);

  const adaptiveEntry = useMemo(() => buildAdaptiveEntry(currentPhase?.type, adaptiveRuntime), [currentPhase?.type, adaptiveRuntime]);

  if (!currentPhase) {
    return (
      <div className="campaign-flow-shell">
        <ExperienceCard title="Capitulo ativo" variant="mentor" className="campaign-flow-rail campaign-flow-hero-rail">
          {runtimeError ? <div className="error-box">{runtimeError}</div> : <div className="error-box">Nenhuma fase de campanha disponível no momento.</div>}
        </ExperienceCard>
      </div>
    );
  }

  return (
    <div className="campaign-flow-shell">
      <ExperienceCard title="Capitulo ativo" variant="mentor" className="campaign-flow-rail campaign-flow-hero-rail">
        <div className="campaign-flow-header">
          <div className="campaign-flow-title-block">
            <p className="campaign-kicker">Modo campanha</p>
            <h2>{currentPhase.chapterTitle}</h2>
            <p className="campaign-flow-lead">{currentPhase.description}</p>
            <div className="campaign-flow-storyline">
              <div>
                <span>Quadro atual</span>
                <strong>{currentPhase.title}</strong>
              </div>
              <div>
                <span>Clima da fase</span>
                <strong>{PHASE_CLIMATE_LABELS[currentPhase.type] || 'Fase ativa'}</strong>
              </div>
            </div>
          </div>
          <div className="campaign-flow-counter campaign-flow-counter-hero">
            <strong>Fase {currentIndex + 1} de {totalPhases}</strong>
            <span>{progressPercent}% do percurso liberado · capítulos {availableChapterCount}/{totalChapterCount}</span>
            <div className="campaign-flow-progress-bar" aria-hidden="true">
              <div style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
        </div>
        <div className="campaign-flow-phase-track" aria-label="Progresso do capitulo">
          {phases.map((phase, index) => {
            const isActive = phase.id === currentPhase.id;
            const isDone = index < currentIndex;
            return (
              <div key={phase.id} className={`campaign-flow-phase-pill ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`}>
                <span>{index + 1}</span>
                <div>
                  <strong>{phase.title}</strong>
                  <small>{phase.type}</small>
                </div>
              </div>
            );
          })}
        </div>
        <div className="campaign-feedback-callout mt-3">
          <span>{adaptiveEntry.title}</span>
          <strong>{adaptiveEntry.headline}</strong>
          <p>{adaptiveEntry.body}</p>
          {adaptiveEntry.meta ? <p>{adaptiveEntry.meta}</p> : null}
          <div className="campaign-actions">
            <Link to="/adaptive-journey" className="secondary-button">{adaptiveEntry.cta}</Link>
          </div>
        </div>
      </ExperienceCard>

      <JourneyEngineRuntimeProvider>
        <CampaignPhaseBody phase={currentPhase} onAdvance={goToNextPhase} isLastPhase={isLastPhase} />
      </JourneyEngineRuntimeProvider>
    </div>
  );
}