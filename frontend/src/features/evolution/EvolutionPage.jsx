import { useEffect, useState } from 'react';
import { CompetencyMeter, RewardPill } from '../../components/DomainComponents.jsx';
import { getEvolution } from '../../services/simulationApi.js';

export default function EvolutionPage() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getEvolution()
      .then(setData)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="page-stack">
      <h2>Evolução</h2>
      <p>Acompanhe competências, histórico de decisões e recomendações do próximo ciclo.</p>

      {error ? <div className="error-box">{error}</div> : null}

      {!data && !error ? <div>Carregando evolução...</div> : null}

      {data ? (
        <>
          <div className="list-item">
            <strong>Progresso</strong>
            <p>{Number(data.progression?.progressPercent || 0).toFixed(1)}%</p>
            <p>Dificuldade adaptativa: {data.progression?.adaptiveDifficulty || 'medium'}</p>
            <p>Próxima recomendação: {data.progression?.nextRecommendation?.focus || 'n/d'}</p>
            <div className="inline-pills">
              <RewardPill label="XP" value={Math.round(Number(data.progression?.progressPercent || 0) * 8)} />
              <RewardPill label="Streak" value={`${Math.max(1, (data.decisionHistory || []).length)} dias`} />
            </div>
          </div>

          <div className="list">
            {(data.competencies || []).map((item) => (
              <CompetencyMeter
                key={item.id}
                label={`${item.competencyId} · nivel ${item.level}`}
                value={Number(item.score || 0)}
                baseline={Math.max(0, Number(item.score || 0) - 10)}
              />
            ))}
          </div>

          <div className="list-item">
            <strong>Histórico de decisões</strong>
            <p>Total recente: {(data.decisionHistory || []).length}</p>
          </div>
        </>
      ) : null}
    </div>
  );
}
