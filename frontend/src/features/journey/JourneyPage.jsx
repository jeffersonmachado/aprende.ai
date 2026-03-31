import { useEffect, useState } from 'react';
import { getJourneySummary } from '../../services/journeyApi.js';

export default function JourneyPage() {
  const [journey, setJourney] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getJourneySummary().then(setJourney).catch((err) => setError(err.message));
  }, []);

  if (!journey && !error) return <div>Carregando jornada...</div>;

  return (
    <div className="page-stack">
      <h2>Jornada personalizada</h2>
      {error ? <div className="error-box">{error}</div> : null}
      {journey ? (
        <>
          <div className="list-item">
            <strong>{journey.title}</strong>
            <p>Progresso: {journey.progressPercent}%</p>
            {journey.adaptive?.contentType ? <p>Conteúdo recomendado: {journey.adaptive.contentType}</p> : null}
            {journey.adaptive?.challengeType ? <p>Tipo de desafio: {journey.adaptive.challengeType}</p> : null}
            {journey.adaptive?.difficulty ? <p>Dificuldade: {journey.adaptive.difficulty}</p> : null}
          </div>

          {journey.adaptive?.scenarios?.length ? (
            <div className="list-item">
              <strong>Cenários sugeridos</strong>
              {journey.adaptive.scenarios.map((scenario) => (
                <p key={scenario.title}>{scenario.title} · {scenario.difficulty}</p>
              ))}
            </div>
          ) : null}

          <div className="list">
            {journey.steps?.map((step) => (
              <div className="list-item" key={step.id}>
                <strong>{step.title}</strong>
                <p>{step.description}</p>
                <small>{step.stepType} · {step.status}</small>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
