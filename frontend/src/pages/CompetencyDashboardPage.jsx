import { useEffect, useState } from 'react';
import { Button, ExperienceCard, StageWrapper } from '../components/index.js';
import { getJourneyEngineCompetencies } from '../services/journeyEngineApi.js';

function getTrendLabel(trend) {
  if (trend?.direction === 'up') return 'Subindo';
  if (trend?.direction === 'down') return 'Oscilando';
  return 'Estável';
}

export default function CompetencyDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setError('');
    try {
      setData(await getJourneyEngineCompetencies());
    } catch (err) {
      setError(err.message || 'Falha ao carregar dashboard de competências.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <StageWrapper
      stageKey="competency-dashboard"
      title="Dashboard de competências"
      subtitle="Radar real, tendências, confiança, consistência, growth e recomendações derivadas do estado consolidado." 
      completed={Number(data?.summary?.averageMastery || 0)}
      total={100}
      variant="result"
      loading={loading}
    >
      {error ? <div className="error-box">{error}</div> : null}
      <ExperienceCard title="Leitura consolidada" variant="mentor" active>
        <div className="campaign-competency-vitals">
          <div>
            <span>Mastery média</span>
            <strong>{Number(data?.summary?.averageMastery || 0).toFixed(0)}</strong>
          </div>
          <div>
            <span>Confiança média</span>
            <strong>{Number(data?.summary?.averageConfidence || 0).toFixed(0)}</strong>
          </div>
          <div>
            <span>Consistência média</span>
            <strong>{Number(data?.summary?.averageConsistency || 0).toFixed(0)}</strong>
          </div>
        </div>
        <div className="campaign-actions">
          <Button type="button" variant="secondary" onClick={load}>Atualizar leitura</Button>
        </div>
      </ExperienceCard>

      <div className="grid-two gap-6">
        <ExperienceCard title="Forças" variant="default">
          <div className="list compact-list">
            {(data?.strengths || []).map((item) => (
              <div key={item.id} className="list-item">
                <div className="row-between gap-sm wrap">
                  <strong>{item.name}</strong>
                  <span>{Number(item.metrics?.mastery || item.score || 0).toFixed(0)}</span>
                </div>
                <p>Confiança {Number(item.metrics?.confidence || 0).toFixed(0)} · Consistência {Number(item.metrics?.consistency || 0).toFixed(0)} · {getTrendLabel(item.trend)}</p>
              </div>
            ))}
          </div>
        </ExperienceCard>

        <ExperienceCard title="Focos" variant="result">
          <div className="list compact-list">
            {(data?.focus || []).map((item) => (
              <div key={item.id} className="list-item">
                <div className="row-between gap-sm wrap">
                  <strong>{item.name}</strong>
                  <span>{Number(item.metrics?.mastery || item.score || 0).toFixed(0)}</span>
                </div>
                <p>{item.recommendation}</p>
              </div>
            ))}
          </div>
        </ExperienceCard>
      </div>

      <ExperienceCard title="Competências observadas" variant="default">
        <div className="list compact-list">
          {(data?.items || []).map((item) => (
            <div key={item.id} className="list-item">
              <div className="row-between gap-sm wrap">
                <strong>{item.name}</strong>
                <span>{item.level}</span>
              </div>
              <p>Mastery {Number(item.metrics?.mastery || 0).toFixed(0)} · Confidence {Number(item.metrics?.confidence || 0).toFixed(0)} · Consistency {Number(item.metrics?.consistency || 0).toFixed(0)} · Growth {Number(item.metrics?.growth || 0).toFixed(0)}</p>
              <p>Evidências diretas {item.evidence?.direct || 0} · inferidas {item.evidence?.inferred || 0}</p>
              <p>{item.recommendation}</p>
            </div>
          ))}
        </div>
      </ExperienceCard>
    </StageWrapper>
  );
}