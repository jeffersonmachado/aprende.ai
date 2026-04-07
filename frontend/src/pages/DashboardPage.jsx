import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { EmptyState, SkeletonBlock, ExperienceCard, StageWrapper, Progress } from '../components/index.js';
import { RewardPill, CompetencyMeter, JourneySummaryCard } from '../components/DomainComponents.jsx';
import { getJourneySummary } from '../services/journeyApi.js';
import { getAdaptiveJourneyRuntime } from '../services/journeyAdaptiveApi.js';
import { getEvolution } from '../services/simulationApi.js';

function formatDecisionLabel(item, index) {
  return item?.title || item?.focus || item?.decisionLabel || `Decisao ${index + 1}`;
}

function getPerformanceNarrative(progressPercent, strongest, weakest) {
  if (!strongest && !weakest) {
    return 'A jornada ainda está calibrando sinais de desempenho. Conclua novas decisões para liberar uma leitura mais precisa.';
  }

  if (progressPercent >= 70) {
    return `Sua evolução já mostra tração em ${strongest?.competencyId || strongest?.name || 'competências-chave'}, mas ainda pede consistência em ${weakest?.competencyId || weakest?.name || 'lacunas críticas'}.`;
  }

  return `Você já ativou sinais de progresso, mas a fase ainda exige consolidar repertório em ${weakest?.competencyId || weakest?.name || 'competências centrais'} antes de acelerar a dificuldade.`;
}

export default function DashboardPage() {
  const [journey, setJourney] = useState(null);
  const [evolution, setEvolution] = useState(null);
  const [adaptiveRuntime, setAdaptiveRuntime] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([getJourneySummary(), getEvolution(), getAdaptiveJourneyRuntime()])
      .then(([journeyResult, evolutionResult, adaptiveResult]) => {
        if (journeyResult.status === 'rejected') {
          throw journeyResult.reason;
        }

        if (evolutionResult.status === 'rejected') {
          throw evolutionResult.reason;
        }

        setJourney(journeyResult.value);
        setEvolution(evolutionResult.value);

        if (adaptiveResult.status === 'fulfilled') {
          setAdaptiveRuntime(adaptiveResult.value);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const journeyCompetencies = useMemo(() => evolution?.competencies || [], [evolution]);
  const lastDecision = useMemo(() => evolution?.decisionHistory?.[0], [evolution]);
  const recentDecisions = useMemo(() => evolution?.decisionHistory?.slice(0, 3) || [], [evolution]);
  const progressPercent = useMemo(() => Number(evolution?.progression?.progressPercent || 0), [evolution]);
  const strongestCompetency = useMemo(() => {
    if (!journeyCompetencies.length) return null;
    return [...journeyCompetencies].sort((a, b) => Number(b.score || 0) - Number(a.score || 0))[0];
  }, [journeyCompetencies]);
  const weakestCompetency = useMemo(() => {
    if (!journeyCompetencies.length) return null;
    return [...journeyCompetencies].sort((a, b) => Number(a.score || 0) - Number(b.score || 0))[0];
  }, [journeyCompetencies]);
  const performanceNarrative = useMemo(
    () => getPerformanceNarrative(progressPercent, strongestCompetency, weakestCompetency),
    [progressPercent, strongestCompetency, weakestCompetency]
  );
  const decisionPattern = useMemo(() => {
    if (!lastDecision) return 'Aguardando primeira simulacao para detectar padrão de resposta.';
    if (progressPercent >= 70) return 'Você mantém avanço consistente, com evidência de decisão mais estruturada.';
    if (progressPercent >= 40) return 'Seu padrão atual mistura boas leituras com momentos de oscilação sob pressão.';
    return 'O padrão ainda está em formação; a próxima sequência de decisões vai revelar onde há maior atrito.';
  }, [lastDecision, progressPercent]);

  const rewards = useMemo(() => {
    const xp = Math.round(progressPercent * 8);
    const streak = Math.max(1, Math.min(30, evolution?.decisionHistory?.length || 1));
    const badges = journey?.adaptive?.scenarios?.length ? 'Analista de Cenarios' : 'Primeiro Ciclo';
    return { xp, streak, badges };
  }, [evolution, journey]);
  const adaptiveSummary = useMemo(() => {
    if (!adaptiveRuntime) return null;

    const progress = adaptiveRuntime.progress || null;
    const competency = progress?.competency || null;
    const currentChapter = adaptiveRuntime.currentChapter || null;

    return {
      status: adaptiveRuntime.status || 'idle',
      journeyId: adaptiveRuntime.journeyId || null,
      competencyName: competency?.name || 'Competência em definição',
      score: Number(competency?.score || 0),
      targetScore: Number(competency?.targetScore || 0),
      completedChapters: Number(progress?.completedChapters || 0),
      estimatedChapterCount: Number(progress?.estimatedChapterCount || 0),
      canClose: Boolean(progress?.canClose),
      currentChapterTitle: currentChapter?.title || null,
      mentorPresetId: adaptiveRuntime?.mentorPreset?.id || null
    };
  }, [adaptiveRuntime]);

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

      <ExperienceCard variant="mentor" className="dashboard-hero dashboard-story-hero" title="Painel de leitura da jornada">
        <p className="dashboard-hero-text">
          {performanceNarrative}
        </p>
        <div className="inline-pills">
          <RewardPill label="XP estimado" value={rewards.xp} />
          <RewardPill label="Streak" value={`${rewards.streak} dias`} />
          <RewardPill label="Modo" value="Acompanhamento" />
        </div>
        <div className="dashboard-insight-grid">
          <div className="dashboard-insight-card">
            <span>Competencia dominante</span>
            <strong>{strongestCompetency?.competencyId || 'Em leitura'}</strong>
            <p>{strongestCompetency ? `Score ${Number(strongestCompetency.score || 0).toFixed(0)} com melhor estabilidade recente.` : 'Complete uma nova decisão para consolidar uma força.'}</p>
          </div>
          <div className="dashboard-insight-card">
            <span>Gap principal</span>
            <strong>{weakestCompetency?.competencyId || 'Sem gap dominante'}</strong>
            <p>{weakestCompetency ? `Hoje esta é a competência com menor score relativo: ${Number(weakestCompetency.score || 0).toFixed(0)}.` : 'Ainda não há lacuna dominante registrada.'}</p>
          </div>
          <div className="dashboard-insight-card">
            <span>Padrão de decisão</span>
            <strong>{lastDecision ? 'Ritmo ativo' : 'Pendente'}</strong>
            <p>{decisionPattern}</p>
          </div>
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
        <div className="grid grid-cols-4 gap-4 mb-8 dashboard-stat-grid">
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
        <ExperienceCard variant="default" title="Competências em Evolução" className="dashboard-deep-card">
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

        <ExperienceCard variant="default" title="Leitura de Perfil" className="dashboard-deep-card">
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
            <JourneySummaryCard title="Leitura pedagógica">
              <p>{decisionPattern}</p>
            </JourneySummaryCard>
          </div>
        </ExperienceCard>
      </div>

      <ExperienceCard variant="mentor" title="Resumo da jornada adaptativa" className="dashboard-deep-card">
        {adaptiveSummary ? (
          <div className="list compact-list space-y-3">
            <JourneySummaryCard title="Status atual">
              <p>{adaptiveSummary.status} · {adaptiveSummary.completedChapters}/{adaptiveSummary.estimatedChapterCount} capítulos</p>
            </JourneySummaryCard>
            <JourneySummaryCard title="Competência em foco">
              <p>{adaptiveSummary.competencyName}</p>
              <p>Score {adaptiveSummary.score.toFixed(0)} / meta {adaptiveSummary.targetScore.toFixed(0)}</p>
            </JourneySummaryCard>
            <JourneySummaryCard title="Capítulo corrente">
              <p>{adaptiveSummary.currentChapterTitle || 'Aguardando nova inferência de capítulo.'}</p>
            </JourneySummaryCard>
            <JourneySummaryCard title="Mentoria aplicada">
              <p>{adaptiveSummary.mentorPresetId || 'Preset padrão do backend'}</p>
            </JourneySummaryCard>
            <div className="campaign-actions">
              <Link to="/adaptive-journey" className="secondary-button">
                {adaptiveSummary.canClose ? 'Revisar e encerrar jornada adaptativa' : 'Abrir jornada adaptativa'}
              </Link>
            </div>
          </div>
        ) : (
          <EmptyState
            title="Sem jornada adaptativa ativa"
            description="Quando o backend criar uma sessão adaptativa, o resumo oficial aparecerá aqui com competência, capítulos e elegibilidade de encerramento."
          />
        )}
      </ExperienceCard>

      <ExperienceCard variant="resultado" title="Próxima melhor decisão" className="dashboard-recommendation-card">
        <Progress value={progressPercent} max={100} tone="success" />
        <div className="mt-4 flex gap-4 justify-around wrap">
          <RewardPill label="XP" value={rewards.xp} />
          <RewardPill label="Streak" value={`${rewards.streak} dias`} />
          <RewardPill label="Badge" value={rewards.badges} />
        </div>
        <div className="mt-4 p-4 bg-experience-bg rounded-lg dashboard-recommendation-panel">
          <strong className="block mb-1">{evolution?.progression?.nextRecommendation?.focus || 'Aguardando diagnóstico'}</strong>
          <p className="text-sm text-gray-600">Dificuldade: {evolution?.progression?.nextRecommendation?.difficulty || 'medium'}</p>
          <p className="text-sm text-gray-600">Racional: {evolution?.progression?.nextRecommendation?.rationale || 'Continue evoluindo com foco na competência menos consolidada.'}</p>
        </div>
        <div className="dashboard-recent-decisions">
          <p className="campaign-kicker">Historico recente</p>
          {recentDecisions.length ? (
            <div className="list compact-list">
              {recentDecisions.map((item, index) => (
                <div key={item.id || index} className="list-item dashboard-decision-item">
                  <strong>{formatDecisionLabel(item, index)}</strong>
                  <p>{item.feedbackText || item.outcome || 'Decisão registrada e disponível para leitura contextual.'}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sem decisões recentes"
              description="Execute uma simulação para desbloquear histórico e leitura de padrão." 
            />
          )}
        </div>
      </ExperienceCard>
    </StageWrapper>
  );
}
