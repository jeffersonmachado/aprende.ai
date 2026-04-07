import { useState } from 'react';
import { Button, ExperienceCard, StageWrapper } from '../../components/index.js';
import { useJourneyEngineRuntime } from '../../context/JourneyEngineRuntimeContext.jsx';

export default function ReflectionPage({ campaignPhase, onAdvance, advanceLabel = 'Abrir resultado' }) {
  const { runtime, loading, error, submitReflection } = useJourneyEngineRuntime();
  const [text, setText] = useState(runtime?.reflection?.text || '');
  const [saving, setSaving] = useState(false);
  const [localError, setLocalError] = useState('');
  const prompt = runtime?.reflection?.prompt || campaignPhase?.content?.prompt || 'O que esta fase ensinou sobre sua tomada de decisão?';
  const mentorCue = runtime?.reflection?.mentorCue || campaignPhase?.content?.description || 'Escreva o aprendizado extraído, o ajuste necessário e o próximo teste.';

  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setLocalError('');
    try {
      await submitReflection({
        chapterId: campaignPhase?.chapterId,
        reflectionText: text
      });
      if (onAdvance) onAdvance();
    } catch (err) {
      setLocalError(err.message || 'Falha ao registrar a reflexão.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <StageWrapper
      stageKey="reflection"
      title={campaignPhase?.content?.title || 'Reflexão / debrief'}
      subtitle={campaignPhase?.description || 'Etapa própria de mentoria e aprendizagem extraída.'}
      completed={runtime?.reflection ? 100 : 0}
      total={100}
      variant="mentor"
      loading={loading}
    >
      {error ? <div className="error-box">{error}</div> : null}
      {localError ? <div className="error-box">{localError}</div> : null}
      <ExperienceCard title="Debrief orientado" variant="mentor" active>
        <p className="campaign-kicker">Reflexão calma</p>
        <h3>{prompt}</h3>
        <p>{mentorCue}</p>
        <form className="stack-form mt-3" onSubmit={handleSubmit}>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="Descreva o aprendizado extraído, o critério validado e o que você mudaria na próxima fase."
          />
          <div className="campaign-actions">
            <Button type="submit" disabled={saving || !text.trim()}>{saving ? 'Registrando...' : advanceLabel}</Button>
          </div>
        </form>
      </ExperienceCard>
    </StageWrapper>
  );
}