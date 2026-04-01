import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { RewardPill, ScenarioOptionCard } from '../../components/DomainComponents.jsx';
import { ExperienceCard, SkeletonBlock, StageWrapper } from '../../components/index.js';
import { getSimulationCatalog, getSimulationState, startSimulation, submitDecision } from '../../services/simulationApi.js';

export default function SimulationPage() {
  const { simulationRunId } = useParams();
  const [catalog, setCatalog] = useState([]);
  const [state, setState] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [lastImpact, setLastImpact] = useState(null);
  const [error, setError] = useState('');
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingState, setLoadingState] = useState(false);

  useEffect(() => {
    getSimulationCatalog()
      .then(setCatalog)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingCatalog(false));
  }, []);

  useEffect(() => {
    if (!simulationRunId) return;
    setLoadingState(true);
    getSimulationState(simulationRunId)
      .then(setState)
      .catch((err) => setError(err.message))
      .finally(() => setLoadingState(false));
  }, [simulationRunId]);

  const firstScenario = useMemo(() => catalog[0], [catalog]);

  async function handleStart() {
    setError('');
    try {
      const run = await startSimulation({ scenarioId: firstScenario.id });
      setLoadingState(true);
      const data = await getSimulationState(run.id);
      setState(data);
      setFeedback('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingState(false);
    }
  }

  async function handleDecision(optionId) {
    if (!state?.run?.id) return;
    setError('');
    try {
      const data = await submitDecision(state.run.id, { selectedOptionId: optionId });
      setFeedback(data.feedback || 'Decisão registrada.');
      setLastImpact(data.scoreDelta);
      const refreshed = await getSimulationState(state.run.id);
      setState(refreshed);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <StageWrapper
      stageKey="simulation"
      title="Simulacoes"
      subtitle="Cenarios de decisao com impacto registrado no estado oficial"
      completed={state ? 1 : 0}
      total={1}
      variant="decision"
      loading={loadingCatalog}
    >
      {error ? <div className="error-box">{error}</div> : null}

      {(loadingCatalog || loadingState) ? (
        <div className="grid-two">
          <SkeletonBlock className="skeleton-card" />
          <SkeletonBlock className="skeleton-card" />
        </div>
      ) : null}

      {!state ? (
        <ExperienceCard variant="default" title="Missao disponível">
          <div className="journey-summary-card">
          <h4>{firstScenario?.title || 'Sem cenario disponivel'}</h4>
          <p>{firstScenario?.context || firstScenario?.description || 'Crie cenarios para comecar.'}</p>
          <p>{firstScenario?.problem || ''}</p>
          {firstScenario ? <button onClick={handleStart}>Iniciar missao</button> : null}
          </div>
        </ExperienceCard>
      ) : null}

      {state ? (
        <div className="scenario-frame">
          <div className="row-between wrap gap-sm">
            <strong>{state.scenario?.title}</strong>
            <div className="inline-pills">
              <RewardPill label="Missao" value={state.episode?.title || 'ativa'} />
            </div>
          </div>
          <div className="grid-two">
            <div className="journey-summary-card">
              <h4>Contexto</h4>
              <p>{state.scenario?.context}</p>
            </div>
            <div className="journey-summary-card">
              <h4>Risco e pressao</h4>
              <p>{state.scenario?.problem}</p>
            </div>
          </div>
          <div className="journey-summary-card">
            <h4>Stakeholders</h4>
            <div className="inline-pills">
              <span className="reward-pill">Cliente</span>
              <span className="reward-pill">Lider tecnico</span>
              <span className="reward-pill">Produto</span>
              <span className="reward-pill">Operacao</span>
            </div>
          </div>
          <p>{state.episode?.narrativeText}</p>
          <div className="grid-two">
            {state.episode?.options?.map((option) => (
              <ScenarioOptionCard
                key={option.id}
                title={option.label}
                rationale="Escolha estrategica para conduzir a missao." 
                risk="medio"
                consequence="impacto registrado no estado oficial da jornada"
                onClick={() => handleDecision(option.id)}
              />
            ))}
          </div>
          {feedback ? <p>{feedback}</p> : null}
          {lastImpact !== null ? <p><strong>Impacto:</strong> {Number(lastImpact).toFixed(1)}</p> : null}
        </div>
      ) : null}
    </StageWrapper>
  );
}
