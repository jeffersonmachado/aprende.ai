import { useEffect, useState } from 'react';
import { CompetencyMeter } from '../../components/DomainComponents.jsx';
import { Badge, Button, ExperienceCard, Progress, StageWrapper } from '../../components';
import { getEvolution } from '../../services/simulationApi.js';
import { getGamificationLeaderboard, getMyGamificationSummary } from '../../services/gamificationApi.js';

function getAchievementLabel(item) {
  if (!item || typeof item !== 'object') return 'Conquista';
  return item.achievement?.title || item.title || item.name || item.code || 'Conquista';
}

function getAchievementKey(item, index) {
  if (!item || typeof item !== 'object') return `achievement-${index}`;
  return item.id || item.achievementId || item.achievement?.id || item.code || `achievement-${index}`;
}

export default function EvolutionPage({ campaignMode = false, onAdvance = null, advanceLabel = 'Seguir para a proxima fase', campaignPhase = null }) {
  const [data, setData] = useState(null);
  const [gamification, setGamification] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getEvolution(), getMyGamificationSummary(), getGamificationLeaderboard(5)])
      .then(([evolutionData, gamificationData, leaderboardData]) => {
        setData(evolutionData);
        setGamification(gamificationData);
        setLeaderboard(Array.isArray(leaderboardData) ? leaderboardData : []);
      })
      .catch((err) => setError(err.message));
  }, []);

  const progress = Number(data?.progression?.progressPercent || 0);

  return (
    <div className="page-stack">
      <StageWrapper
        stageKey="evolution"
        title={campaignPhase?.content?.title || 'Evolução'}
        subtitle={campaignPhase?.content?.description || 'Acompanhe competências, histórico de decisões e recomendações do próximo ciclo.'}
        completed={Math.round(progress)}
        total={100}
        variant="result"
        loading={!data && !error}
      >
        {error ? <div className="error-box">{error}</div> : null}

        {!data && !error ? <ExperienceCard title="Carregando evolução" loading /> : null}

        {data ? (
          <>
            <ExperienceCard title="Progresso global" variant="result" active className="evolution-hero-card">
              <div className="evolution-hero-head">
                <div>
                  <p className="campaign-kicker">Fechamento do capitulo</p>
                  <h3>{progress >= 75 ? 'Parabens, voce consolidou a fase.' : 'A fase fechou com sinais claros de progresso.'}</h3>
                </div>
                <div className="evolution-hero-score">{progress.toFixed(1)}%</div>
              </div>
              <Progress value={progress} max={100} variant="journey" className="my-2" />
              <p>Dificuldade adaptativa: {data.progression?.adaptiveDifficulty || 'medium'}</p>
              <p>Próxima recomendação: {data.progression?.nextRecommendation?.focus || 'n/d'}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Badge variant="xp">XP {gamification?.xp?.total || 0}</Badge>
                <Badge variant="level">Nível {gamification?.level || 1}</Badge>
                <Badge variant="streak">Streak {gamification?.streak?.current || 0}d</Badge>
              </div>
              <div className="evolution-reward-strip">
                <div>
                  <span>Ritmo</span>
                  <strong>{gamification?.streak?.current || 0} dias</strong>
                </div>
                <div>
                  <span>Recompensas</span>
                  <strong>{(gamification?.achievements?.unlocked || []).length}</strong>
                </div>
                <div>
                  <span>Próximo foco</span>
                  <strong>{data.progression?.nextRecommendation?.focus || 'Consolidar fase'}</strong>
                </div>
              </div>
            </ExperienceCard>

            <ExperienceCard className="mt-4" title="Competências" variant="default">
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
            </ExperienceCard>

            <ExperienceCard className="mt-4" title="Histórico de decisões" variant="active">
              <p>Total recente: {(data.decisionHistory || []).length}</p>
              {(gamification?.achievements?.unlocked || []).length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {gamification.achievements.unlocked.slice(0, 3).map((item, index) => (
                    <Badge key={getAchievementKey(item, index)} variant="achieved">{getAchievementLabel(item)}</Badge>
                  ))}
                </div>
              ) : null}
            </ExperienceCard>

            <ExperienceCard className="mt-4 evolution-next-step-card" title="Próximo passo hero" variant="mentor">
              <p>{campaignPhase?.content?.recommendation || data.progression?.nextRecommendation?.focus || 'Escolha a próxima trilha a partir do gap mais crítico.'}</p>
              <div className="campaign-actions">
                {campaignMode && onAdvance ? <Button type="button" onClick={onAdvance}>{advanceLabel}</Button> : <Button type="button">Iniciar próxima trilha</Button>}
              </div>
            </ExperienceCard>

            <ExperienceCard className="mt-4" title="Ranking de progressão" variant="mentor">
              {leaderboard.length ? (
                <div className="space-y-2">
                  {leaderboard.map((entry) => (
                    <div key={entry.userId} className="flex items-center justify-between rounded-lg border border-muted-200 bg-white/70 px-3 py-2 text-sm dark:border-dark-700 dark:bg-dark-800/50">
                      <div className="flex items-center gap-2">
                        <Badge variant={entry.rank <= 3 ? 'achieved' : 'locked'}>#{entry.rank}</Badge>
                        <span className="font-medium text-muted-900 dark:text-muted-100">{entry.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="xp">{entry.xpTotal} XP</Badge>
                        <Badge variant="level">Nível {entry.level}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-600 dark:text-muted-400">Ranking ainda sem dados suficientes para exibição.</p>
              )}
            </ExperienceCard>

            {campaignMode ? (
              <ExperienceCard className="mt-4 campaign-phase-next-card" title="Fechamento do ciclo" variant="mentor" active>
                <p>{campaignPhase?.content?.summary || 'Leitura consolidada concluída. Use esta síntese para abrir o próximo ciclo da campanha.'}</p>
                <p>{campaignPhase?.content?.recommendation || 'Avance quando quiser transformar esta leitura em nova decisão prática.'}</p>
                {onAdvance ? <Button type="button" onClick={onAdvance}>{advanceLabel}</Button> : <span className="muted-text">Campanha concluída e registrada.</span>}
              </ExperienceCard>
            ) : null}
          </>
        ) : null}
      </StageWrapper>
    </div>
  );
}
