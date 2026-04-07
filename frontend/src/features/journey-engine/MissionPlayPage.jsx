import { useState } from 'react';
import { Button, ExperienceCard, StageWrapper } from '../../components/index.js';
import { useJourneyEngineRuntime } from '../../context/JourneyEngineRuntimeContext.jsx';
import WorldStatePanel from './WorldStatePanel.jsx';

function getChoiceImpactLabel(choice) {
  return choice?.impact || choice?.consequence || 'Impacto sistêmico processado pelo backend.';
}

export default function MissionPlayPage({ campaignPhase, onAdvance, advanceLabel = 'Ver consequência' }) {
  const { runtime, loading, error, applyDecision } = useJourneyEngineRuntime();
  const [responseText, setResponseText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [choiceId, setChoiceId] = useState('');
  const [localError, setLocalError] = useState('');
  const mission = campaignPhase?.content?.mission || runtime?.mission;
  const latestDecision = runtime?.latestDecision;

  async function handleChoice(targetChoiceId) {
    setSubmitting(true);
    setLocalError('');
    setChoiceId(targetChoiceId);
    try {
      await applyDecision({
        chapterId: campaignPhase?.chapterId,
        choiceId: targetChoiceId,
        responseText
      });
    } catch (err) {
      setLocalError(err.message || 'Falha ao registrar a decisão.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <StageWrapper
      stageKey="mission-play"
      title={campaignPhase?.content?.headline || mission?.title || 'Missão / interação'}
      subtitle={campaignPhase?.description || 'Faça a escolha principal da fase com o backend como autoridade do estado oficial.'}
      completed={latestDecision ? 100 : 0}
      total={100}
      variant="decision"
      loading={loading}
    >
      {error ? <div className="error-box">{error}</div> : null}
      {localError ? <div className="error-box">{localError}</div> : null}
      <div className="campaign-dashboard-grid">
        <ExperienceCard title="Painel central de decisão" variant="active" active>
          <p className="campaign-kicker">Interação principal</p>
          <h3>{mission?.title || 'Missão ativa'}</h3>
          <p>{mission?.objective || mission?.context || 'Objetivo da missão em preparação.'}</p>
          <label>
            Resposta aberta opcional
            <textarea
              value={responseText}
              onChange={(event) => setResponseText(event.target.value)}
              placeholder="Explique seu raciocínio, trade-off e condição de sucesso desta escolha."
            />
          </label>
          <div className="campaign-choice-list mt-3">
            {(mission?.choices || []).map((choice) => (
              <button
                key={choice.id}
                type="button"
                className={`campaign-choice-card ${choiceId === choice.id ? 'active' : ''}`}
                disabled={submitting}
                onClick={() => handleChoice(choice.id)}
              >
                <span className="campaign-choice-kicker">Escolha oficial</span>
                <strong>{choice.label}</strong>
                <p>{getChoiceImpactLabel(choice)}</p>
              </button>
            ))}
          </div>
          {latestDecision ? (
            <div className="campaign-feedback-callout mt-3">
              <span>Decisão registrada</span>
              <strong>{latestDecision.label}</strong>
              <p>Score de qualidade: {Number(latestDecision.qualityScore || 0).toFixed(0)}</p>
              {onAdvance ? <Button type="button" onClick={onAdvance}>{advanceLabel}</Button> : null}
            </div>
          ) : null}
        </ExperienceCard>

        <WorldStatePanel worldState={runtime?.worldState || {}} title="Painel lateral do mundo" />
      </div>
    </StageWrapper>
  );
}