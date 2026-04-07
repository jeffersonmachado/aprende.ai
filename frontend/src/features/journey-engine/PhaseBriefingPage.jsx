import { Button, ExperienceCard, StageWrapper } from '../../components/index.js';
import { useJourneyEngineRuntime } from '../../context/JourneyEngineRuntimeContext.jsx';
import WorldStatePanel from './WorldStatePanel.jsx';

export default function PhaseBriefingPage({ campaignPhase, onAdvance, advanceLabel = 'Iniciar missão' }) {
  const { runtime, loading, error } = useJourneyEngineRuntime();
  const content = campaignPhase?.content || {};

  return (
    <StageWrapper
      stageKey="phase-briefing"
      title={content.title || 'Briefing de fase'}
      subtitle={content.description || 'Abertura formal da fase com contexto, indicadores e regras operacionais.'}
      completed={runtime?.activePhaseId === 'briefing' ? 100 : 0}
      total={100}
      variant="mentor"
      loading={loading}
    >
      {error ? <div className="error-box">{error}</div> : null}
      <div className="grid-two gap-6">
        <ExperienceCard title={content.headline || campaignPhase?.title || 'Briefing'} variant="mentor" active>
          <p className="campaign-kicker">Abertura cinematográfica</p>
          <h3>{content.headline || campaignPhase?.title}</h3>
          <p>{content.context || 'Contexto da fase em sincronização com o backend.'}</p>
          <div className="campaign-context-grid">
            <div className="campaign-context-panel">
              <span>Objetivo</span>
              <strong>{content.objective || 'Definir objetivo operacional da fase'}</strong>
            </div>
            <div className="campaign-context-panel">
              <span>Competência foco</span>
              <strong>{content.competencyName || 'tomada de decisão'}</strong>
            </div>
            <div className="campaign-context-panel">
              <span>Stakeholders</span>
              <strong>{(content.stakeholders || []).length ? content.stakeholders.join(' · ') : 'Sem stakeholders mapeados'}</strong>
            </div>
          </div>
          <div className="campaign-actions">
            {onAdvance ? <Button type="button" onClick={onAdvance}>{advanceLabel}</Button> : null}
          </div>
        </ExperienceCard>

        <WorldStatePanel worldState={runtime?.worldState || {}} title="Indicadores iniciais" />
      </div>
    </StageWrapper>
  );
}