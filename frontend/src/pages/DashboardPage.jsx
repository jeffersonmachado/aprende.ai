import { useEffect, useMemo, useState } from 'react';
import { EmptyState, SkeletonBlock, ExperienceCard, StageWrapper, Progress } from '../components/index.js';
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
  const progressPercent = useMemo(() => Number(evolution?.progression?.progressPercent || 0), [evolution]);

  const rewards = useMemo(() => {
    const xp = Math.round(progressPercent * 8);
    const streak = Math.max(1, Math.min(30, evolution?.decisionHistory?.length || 1));
    const badges = journey?.adaptive?.scenarios?.length ? 'Analista de Cenarios' : 'Primeiro Ciclo';
    return { xp, streak, badges };
  }, [evolution, journey]);

  return (
    <StageWrapper
      stageKey="dashboard"
      title="Seu dashboard de aprendizagem"
      subtitle="Acompanhe progresso, competências e próxima melhor decisão"
      completed={journey ? 1 : 0}
      total={1}
      variant="resultado"
      loading={loading}
    >
      {error ? <div className="error-box">{error}</div> : null}

      <ExperienceCard variant="mentor" className="dashboard-hero" title="Painel executivo de evolução">
        <p className="dashboard-hero-text">
          Monitore progresso da jornada, consistência de decisão e recomendação adaptativa em um único painel.
        </p>
        <div className="inline-pills">
          <RewardPill label="XP estimado" value={rewards.xp} />
          <RewardPill label="Streak" value={`${rewards.streak} dias`} />
          <RewardPill label="Modo" value="Acompanhamento" />
        </div>
        <div className="dashboard-progress-block">
          <div className="dashboard-progress-head">
            <strong>Progresso consolidado</strong>
            <span>{progressPercent.toFixed(0)}% total</span>
          </div>
          <Progress value={progressPercent} max={100} tone="journey" />
        </div>
      </ExperienceCard>

      {loading ? (
        <div className="grid grid-cols-4 gap-4">
          <SkeletonBlock className="card skeleton-stat" />
          <SkeletonBlock className="card skeleton-stat" />
          <SkeletonBlock className="card skeleton-stat" />
          <SkeletonBlock className="card skeleton-stat" />
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-4 mb-8">
          <ExperienceCard variant="destaque">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{progressPercent.toFixed(0)}%</div>
              <p className="text-sm text-gray-600">Jornada Atual</p>
            </div>
          </ExperienceCard>
          <ExperienceCard variant="destaque">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{journeyCompetencies.length}</div>
              <p className="text-sm text-gray-600">Competências</p>
            </div>
          </ExperienceCard>
          <ExperienceCard variant="destaque">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{lastDecision ? 'Concluída' : 'Pendente'}</div>
              <p className="text-sm text-gray-600">Ultima Simulacao</p>
            </div>
          </ExperienceCard>
          <ExperienceCard variant="destaque">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600">{evolution?.progression?.adaptiveDifficulty || 'medium'}</div>
              <p className="text-sm text-gray-600">Dificuldade Sugerida</p>
            </div>
          </ExperienceCard>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6 mb-8">
        <ExperienceCard variant="default" title="Competências em Evolução">
          {journeyCompetencies.length ? (
            <div className="list compact-list space-y-3">
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
              description="Conclua a etapa inicial da jornada e execute uma simulação."
            />
          )}
        </ExperienceCard>

        <ExperienceCard variant="default" title="Resumo de Perfil">
          <div className="list compact-list space-y-3">
            <JourneySummaryCard title="Perfil Atual">
              <p>{journey?.adaptive?.persona || 'Perfil em calibração'}</p>
            </JourneySummaryCard>
            <JourneySummaryCard title="Objetivo da Jornada">
              <p>{journey?.adaptive?.goal || 'Definir objetivo principal'}</p>
            </JourneySummaryCard>
            <JourneySummaryCard title="Próxima Ação">
              <p>{evolution?.progression?.nextRecommendation?.focus || 'Aguardando primeira decisão'}</p>
            </JourneySummaryCard>
          </div>
        </ExperienceCard>
      </div>

      <ExperienceCard variant="resultado" title="Progresso e Desempenho">
        <Progress value={progressPercent} max={100} tone="success" />
        <div className="mt-4 flex gap-4 justify-around">
          <RewardPill label="XP" value={rewards.xp} />
          <RewardPill label="Streak" value={`${rewards.streak} dias`} />
          <RewardPill label="Badge" value={rewards.badges} />
        </div>
        <div className="mt-4 p-4 bg-experience-bg rounded-lg">
          <strong className="block mb-1">{evolution?.progression?.nextRecommendation?.focus || 'Aguardando diagnóstico'}</strong>
          <p className="text-sm text-gray-600">Dificuldade: {evolution?.progression?.nextRecommendation?.difficulty || 'medium'}</p>
        </div>
      </ExperienceCard>
    </StageWrapper>
  );
}
