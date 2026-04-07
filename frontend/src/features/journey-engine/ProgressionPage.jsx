import { Link } from 'react-router-dom';
import { Button, ExperienceCard, StageWrapper } from '../../components/index.js';
import { useJourneyEngineRuntime } from '../../context/JourneyEngineRuntimeContext.jsx';

function getUnlockLabel(item, index) {
  if (typeof item === 'string' || typeof item === 'number') return String(item);
  if (!item || typeof item !== 'object') return `unlock-${index + 1}`;
  return item.title || item.label || item.name || item.code || item.id || `unlock-${index + 1}`;
}

export default function ProgressionPage({ campaignPhase, onAdvance, advanceLabel = 'Avançar' }) {
  const { runtime, loading, error } = useJourneyEngineRuntime();
  const progression = runtime?.progression;
  const unlocks = campaignPhase?.content?.unlocks || [];

  return (
    <StageWrapper
      stageKey="progression"
      title={campaignPhase?.content?.title || 'Evolução / próximo passo'}
      subtitle={campaignPhase?.description || 'Conecta jornada, competência, conteúdo e desbloqueios da fase seguinte.'}
      completed={100}
      total={100}
      variant="mentor"
      loading={loading}
    >
      {error ? <div className="error-box">{error}</div> : null}
      <div className="grid-two gap-6">
        <ExperienceCard title="Plano de progressão" variant="mentor" active>
          <p className="campaign-kicker">Transição oficial</p>
          <h3>{progression?.nextFocus || campaignPhase?.content?.nextMissionTitle || 'Próxima fase pronta'}</h3>
          <p>{progression?.recommendation || campaignPhase?.content?.recommendation || 'Use o próximo passo para fechar o gap mais crítico com base no estado real.'}</p>
          {unlocks.length ? (
            <div className="campaign-tag-cloud compact">
              {unlocks.map((item, index) => <span key={`unlock-${index}`}>{getUnlockLabel(item, index)}</span>)}
            </div>
          ) : null}
          <div className="campaign-actions">
            {onAdvance ? <Button type="button" onClick={onAdvance}>{advanceLabel}</Button> : null}
          </div>
        </ExperienceCard>

        <ExperienceCard title="Aprofundamento por competência" variant="result">
          <p className="campaign-kicker">Continuidade backend-first</p>
          <h3>Jornada adaptativa oficial</h3>
          <p>
            Quando o capítulo linear fecha, você pode continuar por competência com inserção controlada de reforço,
            aceleração e encerramento explicável pelo backend.
          </p>
          <div className="campaign-actions">
            <Link to="/adaptive-journey" className="secondary-button">Ir para jornada adaptativa</Link>
          </div>
        </ExperienceCard>
      </div>
    </StageWrapper>
  );
}