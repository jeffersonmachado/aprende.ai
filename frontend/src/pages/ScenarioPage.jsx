import { useEffect, useRef } from 'react';
import StageRenderer from '../features/scenario/StageRenderer.jsx';
import StepperProgress from '../features/scenario/StepperProgress.jsx';
import TelemetryTimeline from '../features/scenario/TelemetryTimeline.jsx';
import useScenarioEngine from '../features/scenario/useScenarioEngine.js';
import { Button, Progress } from '../components';

function getStageTension(stepId) {
  if (stepId === 'decisao') return 'Momento de escolha com impacto direto no desfecho.';
  if (stepId === 'simulacao') return 'A fase entrou em teste controlado antes da execução.';
  if (stepId === 'resultado') return 'Agora o sistema expõe consequência, não intenção.';
  if (stepId === 'evolucao') return 'Fechamento pedagógico com leitura de competência.';
  return 'Contexto em montagem para a próxima decisão estratégica.';
}

function getMentorCue(stepId) {
  if (stepId === 'contexto') return 'Mapeie o que é fato, ruído e pressão externa antes de agir.';
  if (stepId === 'analise') return 'Nomeie risco, ganho esperado e hipótese principal desta etapa.';
  if (stepId === 'exploracao') return 'Compare caminhos possíveis e descarte o que parece elegante, mas frágil.';
  if (stepId === 'decisao') return 'Escolha um caminho sustentando trade-off explícito.';
  if (stepId === 'simulacao') return 'Observe onde a estratégia quebra quando confrontada com o sistema.';
  if (stepId === 'resultado') return 'Leia o efeito da decisão sem racionalizar o erro.';
  return 'Converta o aprendizado em critério reutilizável para a próxima missão.';
}

export default function ScenarioPage({ campaignMode = false, onAdvance = null, campaignPhase = null }) {
  const engine = useScenarioEngine({
    runtimeOverrides: campaignPhase?.content ? { scenario: campaignPhase.content.scenario } : undefined,
    campaignContext: campaignPhase
      ? {
          chapterId: campaignPhase.chapterId,
          phaseId: campaignPhase.id,
          chapterTitle: campaignPhase.chapterTitle,
          phaseTitle: campaignPhase.title,
          scenarioTitle: campaignPhase?.content?.scenario?.title || campaignPhase?.content?.headline || null,
          source: 'campaign'
        }
      : undefined
  });
  const hasAdvancedRef = useRef(false);
  const currentStep = engine.steps[engine.currentStepIndex] || engine.steps[0];
  const scenario = engine.state.runtime?.scenario;
  const episode = engine.state.runtime?.episode;
  const completedCount = engine.state.completedSteps.length;
  const progressPercent = engine.steps.length ? Math.round((completedCount / engine.steps.length) * 100) : 0;
  const isLastStep = currentStep?.id === engine.steps[engine.steps.length - 1]?.id;

  useEffect(() => {
    if (!campaignMode || !onAdvance || !isLastStep || !engine.canAdvance || hasAdvancedRef.current) return;

    hasAdvancedRef.current = true;
    const timer = setTimeout(() => {
      onAdvance();
    }, 900);

    return () => clearTimeout(timer);
  }, [campaignMode, engine.canAdvance, isLastStep, onAdvance]);

  useEffect(() => {
    if (!isLastStep || !engine.canAdvance) {
      hasAdvancedRef.current = false;
    }
  }, [engine.canAdvance, isLastStep]);

  if (engine.loading) {
    return (
      <div className="page-stack">
        <h2>Carregando simulador de decisoes...</h2>
      </div>
    );
  }

  return (
    <section className="scenario-layout">
      <StepperProgress
        steps={engine.steps}
        currentStep={engine.state.currentStep}
        completedSteps={engine.state.completedSteps}
        syncByStep={engine.state.metrics?.stepSyncStatus || {}}
        onSelectStep={engine.setCurrentStep}
      />

      <main className="scenario-main-content">
        <div className="scenario-topbar">
          <div className="scenario-topbar-copy">
            <p className="scenario-kicker">Operacao em etapas com IA</p>
            <h1>{campaignPhase?.content?.headline || currentStep.title}</h1>
            <p className="scenario-topbar-description">
              {campaignPhase?.content?.description || scenario?.context || scenario?.problem || 'O cenário organiza contexto, análise, decisão, simulação e evolução em uma mesma linha narrativa.'}
            </p>
          </div>
          <div className="scenario-progress-chip">
            <strong className="scenario-progress-value">{completedCount}</strong>
            <span className="scenario-progress-label">de {engine.steps.length} etapas concluidas</span>
            <Progress
              className="mt-2"
              value={completedCount}
              max={engine.steps.length}
              tone="primary"
            />
          </div>
        </div>

        <div className="scenario-hero-grid">
          <div className="scenario-hero-panel">
            <span>{campaignPhase?.content?.kicker || 'Missao em curso'}</span>
            <strong>{campaignPhase?.content?.headline || scenario?.title || 'Cenario em calibracao'}</strong>
            <p>{campaignPhase?.content?.description || scenario?.problem || getStageTension(currentStep.id)}</p>
          </div>
          <div className="scenario-hero-panel">
            <span>Tensao da etapa</span>
            <strong>{currentStep.title}</strong>
            <p>{getStageTension(currentStep.id)}</p>
          </div>
          <div className="scenario-hero-panel">
            <span>Leitura do mentor</span>
            <strong>Diretriz ativa</strong>
            <p>{getMentorCue(currentStep.id)}</p>
          </div>
          <div className="scenario-hero-panel">
            <span>Telemetria viva</span>
            <strong>{progressPercent}% da simulação</strong>
            <p>{engine.state.metrics?.interactionCount || 0} interações · {episode?.options?.length || 0} opções mapeadas nesta rodada.</p>
          </div>
        </div>

        {engine.error ? <div className="error-box">{engine.error}</div> : null}

        <StageRenderer step={engine.state.currentStep} engine={engine} />

        <div className="scenario-actions">
          <Button onClick={engine.goNext} disabled={!engine.canAdvance}>
            Avancar etapa
          </Button>
          {campaignMode && isLastStep && engine.canAdvance
            ? <small>A proxima tela da campanha sera aberta automaticamente.</small>
            : engine.saving ? <small>Salvando progresso...</small> : <small>Progresso sincronizado com backend</small>}
        </div>

        <TelemetryTimeline
          events={engine.state.metrics?.telemetryEvents || []}
          lastSyncAt={engine.state.metrics?.lastSyncAt}
        />
      </main>
    </section>
  );
}
