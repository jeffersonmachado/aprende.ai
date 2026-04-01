import StageRenderer from '../features/scenario/StageRenderer.jsx';
import StepperProgress from '../features/scenario/StepperProgress.jsx';
import TelemetryTimeline from '../features/scenario/TelemetryTimeline.jsx';
import useScenarioEngine from '../features/scenario/useScenarioEngine.js';
import { Button, Progress } from '../components';

export default function ScenarioPage() {
  const engine = useScenarioEngine();
  const currentStep = engine.steps[engine.currentStepIndex] || engine.steps[0];

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
          <div>
            <p className="scenario-kicker">Simulador de decisoes com IA</p>
            <h1>{currentStep.title}</h1>
          </div>
          <div className="scenario-progress-chip">
            <strong className="scenario-progress-value">{engine.state.completedSteps.length}</strong>
            <span className="scenario-progress-label">de {engine.steps.length} etapas concluidas</span>
            <Progress
              className="mt-2"
              value={engine.state.completedSteps.length}
              max={engine.steps.length}
              tone="primary"
            />
          </div>
        </div>

        {engine.error ? <div className="error-box">{engine.error}</div> : null}

        <StageRenderer step={engine.state.currentStep} engine={engine} />

        <div className="scenario-actions">
          <Button onClick={engine.goNext} disabled={!engine.canAdvance}>
            Avancar etapa
          </Button>
          {engine.saving ? <small>Salvando progresso...</small> : <small>Progresso sincronizado com backend</small>}
        </div>

        <TelemetryTimeline
          events={engine.state.metrics?.telemetryEvents || []}
          lastSyncAt={engine.state.metrics?.lastSyncAt}
        />
      </main>
    </section>
  );
}
