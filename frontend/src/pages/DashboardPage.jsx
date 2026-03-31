import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import EmptyState from '../components/EmptyState.jsx';
import SkeletonBlock from '../components/SkeletonBlock.jsx';
import { RewardPill, CompetencyMeter, JourneySummaryCard } from '../components/DomainComponents.jsx';
import { getJourneySummary } from '../services/journeyApi.js';
import { getEvolution } from '../services/simulationApi.js';

export default function DashboardPage() {
  const [journey, setJourney] = useState(null);
  const [evolution, setEvolution] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getJourneySummary(), getEvolution()])
      .then(([journeyData, evolutionData]) => {
        setJourney(journeyData);
        setEvolution(evolutionData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const journeyCompetencies = useMemo(() => evolution?.competencies || [], [evolution]);
  const lastDecision = useMemo(() => evolution?.decisionHistory?.[0], [evolution]);

  const rewards = useMemo(() => {
    const xp = Math.round(Number(evolution?.progression?.progressPercent || 0) * 8);
    const streak = Math.max(1, Math.min(30, evolution?.decisionHistory?.length || 1));
    const badges = journey?.adaptive?.scenarios?.length ? 'Analista de Cenarios' : 'Primeiro Ciclo';
    return { xp, streak, badges };
  }, [evolution, journey]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Experiencia"
        title="Seu dashboard de aprendizagem"
        description="Acompanhe progresso da jornada, competencias em evolucao e sua proxima melhor decisao com backend como autoridade oficial do estado."
      />

      {error ? <div className="error-box">{error}</div> : null}

      {loading ? (
        <div className="stats-grid">
          <SkeletonBlock className="card skeleton-stat" />
          <SkeletonBlock className="card skeleton-stat" />
          <SkeletonBlock className="card skeleton-stat" />
          <SkeletonBlock className="card skeleton-stat" />
        </div>
      ) : (
        <div className="stats-grid">
          <StatCard label="Progresso" value={`${Number(evolution?.progression?.progressPercent || 0).toFixed(0)}%`} helper="Jornada atual" />
          <StatCard label="Competencias" value={journeyCompetencies.length} helper="Em desenvolvimento" />
          <StatCard label="Ultima simulacao" value={lastDecision ? 'Concluida' : 'Pendente'} helper="Estado da missao" />
          <StatCard label="Proxima recomendacao" value={evolution?.progression?.adaptiveDifficulty || 'medium'} helper="Dificuldade sugerida" />
        </div>
      )}

      <div className="grid-two">
        <Card title="Competencias em evolucao">
          {journeyCompetencies.length ? (
            <div className="list compact-list">
              {journeyCompetencies.map((score) => (
                <CompetencyMeter
                  key={score.id}
                  label={score.competencyId}
                  value={Number(score.score || 0)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sem evolução registrada"
              description="Conclua a etapa inicial da jornada e execute uma simulacao para liberar os indicadores de competencia."
            />
          )}
        </Card>

        <Card title="Resumo de perfil e objetivo">
          <div className="list compact-list">
            <JourneySummaryCard title="Perfil atual">
              <p>{journey?.adaptive?.persona || 'Perfil em calibracao'}</p>
            </JourneySummaryCard>
            <JourneySummaryCard title="Objetivo da jornada">
              <p>{journey?.adaptive?.goal || 'Definir objetivo principal'}</p>
            </JourneySummaryCard>
            <JourneySummaryCard title="Proxima acao recomendada">
              <p>{evolution?.progression?.nextRecommendation?.focus || 'Aguardando primeira decisao'}</p>
            </JourneySummaryCard>
          </div>
        </Card>
      </div>

      <Card title="Progresso gamificado com sobriedade">
        <div className="inline-pills">
          <RewardPill label="XP" value={rewards.xp} />
          <RewardPill label="Streak" value={`${rewards.streak} dias`} />
          <RewardPill label="Badge" value={rewards.badges} />
        </div>
        <div className="list-item">
          <strong>{evolution?.progression?.nextRecommendation?.focus || 'Aguardando diagnostico'}</strong>
          <p>Dificuldade sugerida: {evolution?.progression?.nextRecommendation?.difficulty || 'medium'}</p>
          <p>{evolution?.progression?.nextRecommendation?.rationale || 'A recomendacao aparece apos novas decisoes em simulacao.'}</p>
        </div>
      </Card>
    </div>
  );
}
