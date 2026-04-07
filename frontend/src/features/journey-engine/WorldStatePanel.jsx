import { ExperienceCard } from '../../components/index.js';

const STATE_LABELS = {
  tension_level: 'Tensão',
  stakeholder_trust: 'Confiança',
  budget: 'Budget',
  morale: 'Moral',
  time_pressure: 'Pressão de tempo',
  learning_confidence: 'Confiança de aprendizagem',
  team_alignment: 'Alinhamento do time',
  market_perception: 'Percepção de mercado',
  execution_risk: 'Risco de execução'
};

function getTone(value, key) {
  const numeric = Number(value || 0);
  if (key === 'execution_risk' || key === 'time_pressure' || key === 'tension_level') {
    return numeric >= 70 ? 'warning' : numeric >= 45 ? 'pending' : 'active';
  }
  return numeric >= 70 ? 'active' : numeric >= 45 ? 'pending' : 'warning';
}

export default function WorldStatePanel({ worldState = {}, title = 'Estado do mundo' }) {
  return (
    <ExperienceCard title={title} variant="default">
      <div className="list compact-list">
        {Object.entries(worldState || {}).map(([key, value]) => (
          <div key={key} className="list-item">
            <div className="row-between gap-sm wrap">
              <strong>{STATE_LABELS[key] || key}</strong>
              <span className={`status-pill ${getTone(value, key)}`}>{Number(value || 0).toFixed(0)}</span>
            </div>
            <div className="meter-track mt-2">
              <div className="meter-fill" style={{ width: `${Math.max(0, Math.min(100, Number(value || 0)))}%` }} />
            </div>
          </div>
        ))}
      </div>
    </ExperienceCard>
  );
}