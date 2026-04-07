import { useState } from 'react';
import { Button, ExperienceCard, StageWrapper } from '../../components/index.js';
import { useJourneyEngineRuntime } from '../../context/JourneyEngineRuntimeContext.jsx';

export default function PlotTwistPage({ campaignPhase, onAdvance, advanceLabel = 'Continuar' }) {
  const { runtime, loading, error, resolveTwist } = useJourneyEngineRuntime();
  const [resolving, setResolving] = useState(false);
  const twist = runtime?.latestTwist;

  async function handleResolve() {
    if (!twist || twist.status === 'resolved') {
      if (onAdvance) onAdvance();
      return;
    }

    setResolving(true);
    try {
      await resolveTwist({ resolutionNotes: 'Twist resolvido na etapa dedicada do frontend.' });
      if (onAdvance) onAdvance();
    } finally {
      setResolving(false);
    }
  }

  return (
    <StageWrapper
      stageKey="plot-twist"
      title={campaignPhase?.content?.title || 'Plot Twist'}
      subtitle={campaignPhase?.description || 'Evento inesperado com urgência alta e alteração perceptível do clima da fase.'}
      completed={twist?.status === 'resolved' || !twist ? 100 : 0}
      total={100}
      variant="mentor"
      loading={loading}
    >
      {error ? <div className="error-box">{error}</div> : null}
      <ExperienceCard title="Overlay narrativo" variant="mentor" className="campaign-twist-banner" active>
        <div className="campaign-twist-inner">
          <p className="campaign-twist-label">TWIST</p>
          <h3>{twist?.title || 'Sem twist ativo neste momento'}</h3>
          <p>{twist?.narrative || campaignPhase?.content?.summary || 'O sistema não detectou ruptura ativa para esta fase. Você pode seguir adiante.'}</p>
          <p><strong>Status:</strong> {twist?.status || 'idle'}</p>
          {twist?.suggestedAction ? <p><strong>Ação sugerida:</strong> {twist.suggestedAction}</p> : null}
          <div className="campaign-actions">
            <Button type="button" onClick={handleResolve} disabled={resolving}>{resolving ? 'Processando...' : advanceLabel}</Button>
          </div>
        </div>
      </ExperienceCard>
    </StageWrapper>
  );
}