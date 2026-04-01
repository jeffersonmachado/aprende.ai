import AnalysisStage from './stages/AnalysisStage.jsx';
import ContextStage from './stages/ContextStage.jsx';
import DecisionStage from './stages/DecisionStage.jsx';
import EvolutionStage from './stages/EvolutionStage.jsx';
import ExplorationStage from './stages/ExplorationStage.jsx';
import ResultStage from './stages/ResultStage.jsx';
import SimulationStage from './stages/SimulationStage.jsx';
import { StageWrapper } from '../../components';

const STAGE_META = {
  contexto: { title: 'Contexto', subtitle: 'Entenda o cenário antes de agir' },
  analise: { title: 'Análise', subtitle: 'Avalie sinais e riscos da missão' },
  exploracao: { title: 'Exploração', subtitle: 'Compare alternativas possíveis' },
  decisao: { title: 'Decisão', subtitle: 'Escolha sua estratégia principal' },
  simulacao: { title: 'Simulação', subtitle: 'Teste impacto antes da execução' },
  resultado: { title: 'Resultado', subtitle: 'Visualize os desdobramentos' },
  evolucao: { title: 'Evolução', subtitle: 'Consolide aprendizados da jornada' },
};

function renderStage(step, engine) {
  switch (step) {
    case 'contexto':
      return (
        <ContextStage
          scenario={engine.state.runtime?.scenario}
          onStart={() => engine.markStageCompleted('contexto')}
        />
      );
    case 'analise':
      return (
        <AnalysisStage
          scenario={engine.state.runtime?.scenario}
          onComplete={() => engine.markStageCompleted('analise')}
        />
      );
    case 'exploracao':
      return (
        <ExplorationStage
          scenario={engine.state.runtime?.scenario}
          options={engine.state.runtime?.episode?.options || []}
          onComplete={() => engine.markStageCompleted('exploracao')}
        />
      );
    case 'decisao':
      return (
        <DecisionStage
          decisions={engine.state.decisions}
          options={engine.state.runtime?.episode?.options || []}
          onUpdate={engine.updateDecision}
          onConfirm={engine.confirmDecision}
          saving={engine.saving}
        />
      );
    case 'simulacao':
      return (
        <SimulationStage
          simulationStatus={engine.state.metrics.simulationStatus}
          onRun={engine.runSimulation}
          onComplete={() => engine.markStageCompleted('simulacao')}
        />
      );
    case 'resultado':
      return (
        <ResultStage
          decisionResult={engine.state.runtime?.decisionResult}
          selectedOption={engine.selectedOption}
          onComplete={() => engine.markStageCompleted('resultado')}
        />
      );
    case 'evolucao':
      return (
        <EvolutionStage
          evolution={engine.state.runtime?.evolution}
          onNextMission={() => engine.markStageCompleted('evolucao')}
        />
      );
    default:
      return (
        <ContextStage
          scenario={engine.state.runtime?.scenario}
          onStart={() => engine.markStageCompleted('contexto')}
        />
      );
  }
}

export default function StageRenderer({ step, engine }) {
  const meta = STAGE_META[step] || STAGE_META.contexto;

  return (
    <StageWrapper
      stageKey={step}
      title={meta.title}
      subtitle={meta.subtitle}
      completed={engine.state.completedSteps?.length || 0}
      total={engine.steps?.length || 0}
    >
      {renderStage(step, engine)}
    </StageWrapper>
  );
}
