import { Button, ExperienceCard, StageWrapper } from '../../components/index.js';
import { useJourneyEngineRuntime } from '../../context/JourneyEngineRuntimeContext.jsx';

export default function PhaseResultPage({ campaignPhase, onAdvance, advanceLabel = 'Ver próximo passo' }) {
  const { runtime, loading, error, finalizePhase } = useJourneyEngineRuntime();
  const result = runtime?.result;
  const strengths = runtime?.competencyDashboard?.strengths || [];
  const focus = runtime?.competencyDashboard?.focus || [];

  async function handleAdvance() {
    try {
      await finalizePhase({ chapterId: campaignPhase?.chapterId });
      if (onAdvance) onAdvance();
    } catch {
      return;
    }
  }

  return (
    <StageWrapper
      stageKey="phase-result"
      title={campaignPhase?.content?.title || 'Resultado da fase'}
      subtitle={campaignPhase?.description || 'Score, radar de competências, XP, badges e resumo da performance.'}
      completed={100}
      total={100}
      variant="result"
      loading={loading}
    >
      {error ? <div className="error-box">{error}</div> : null}
      <div className="grid-two gap-6">
        <ExperienceCard title="Fechamento da fase" variant="result" active className="campaign-result-card">
          <p className="campaign-kicker">Resultado oficial</p>
          <h3>Score da fase: {Number(result?.phaseScore || 0).toFixed(0)}</h3>
          <p>Mastery consolidada: {Number(result?.mastery || 0).toFixed(0)} · XP ganho: {Number(result?.xpAwarded || 0).toFixed(0)}</p>
          <p>{result?.badgeSummary || 'Sem novas badges nesta fase.'}</p>
          <div className="campaign-actions">
            <Button type="button" onClick={handleAdvance}>{advanceLabel}</Button>
          </div>
        </ExperienceCard>

        <ExperienceCard title="Radar pedagógico" variant="default">
          <div className="list compact-list">
            <div className="list-item">
              <strong>Forças</strong>
              <p>{strengths.length ? strengths.map((item) => `${item.name} (${Number(item.metrics?.mastery || item.score || 0).toFixed(0)})`).join(' · ') : 'Sem força dominante registrada.'}</p>
            </div>
            <div className="list-item">
              <strong>Focos</strong>
              <p>{focus.length ? focus.map((item) => `${item.name} (${Number(item.metrics?.mastery || item.score || 0).toFixed(0)})`).join(' · ') : 'Sem foco crítico registrado.'}</p>
            </div>
          </div>
        </ExperienceCard>
      </div>
    </StageWrapper>
  );
}