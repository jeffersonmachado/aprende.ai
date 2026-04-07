import { Button, ExperienceCard, StageWrapper } from '../../components/index.js';
import { useJourneyEngineRuntime } from '../../context/JourneyEngineRuntimeContext.jsx';
import WorldStatePanel from './WorldStatePanel.jsx';

const DELTA_LABELS = {
  tension_level: 'Tensão',
  stakeholder_trust: 'Confiança',
  budget: 'Budget',
  morale: 'Moral',
  time_pressure: 'Pressão de tempo',
  learning_confidence: 'Confiança de aprendizagem',
  team_alignment: 'Alinhamento',
  market_perception: 'Percepção',
  execution_risk: 'Risco'
};

export default function ConsequencePage({ campaignPhase, onAdvance, advanceLabel = 'Seguir' }) {
  const { runtime, loading, error } = useJourneyEngineRuntime();
  const consequence = runtime?.latestConsequence;

  return (
    <StageWrapper
      stageKey="consequence"
      title={campaignPhase?.content?.title || 'Consequência'}
      subtitle={campaignPhase?.description || 'Leitura visual e sistêmica do impacto da decisão no mundo oficial.'}
      completed={consequence ? 100 : 0}
      total={100}
      variant="result"
      loading={loading}
    >
      {error ? <div className="error-box">{error}</div> : null}
      <div className="grid-two gap-6">
        <ExperienceCard title="Impacto da decisão" variant="result" active>
          <p className="campaign-kicker">Consequência oficial</p>
          <h3>{runtime?.latestDecision?.label || 'Aguardando decisão'}</h3>
          <p>{consequence?.narrative || campaignPhase?.content?.summary || 'A consequência oficial aparecerá aqui assim que a missão registrar uma escolha.'}</p>
          <div className="list compact-list mt-3">
            {Object.entries(consequence?.delta || {}).map(([key, value]) => (
              <div key={key} className="list-item">
                <div className="row-between gap-sm wrap">
                  <strong>{DELTA_LABELS[key] || key}</strong>
                  <span>{Number(value) >= 0 ? `+${Number(value).toFixed(0)}` : Number(value).toFixed(0)}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="campaign-actions">
            {onAdvance ? <Button type="button" onClick={onAdvance}>{advanceLabel}</Button> : null}
          </div>
        </ExperienceCard>

        <WorldStatePanel worldState={consequence?.worldAfter || runtime?.worldState || {}} title="Estado oficial após a decisão" />
      </div>
    </StageWrapper>
  );
}