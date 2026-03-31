import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusPill from '../components/StatusPill.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { api } from '../services/api.js';

export default function TechnicalDashboardPage() {
  const [competencies, setCompetencies] = useState([]);
  const [evolution, setEvolution] = useState(null);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/api/competencies'),
      api.get('/api/evolution/me'),
      api.get('/api/integration/events')
    ])
      .then(([competencyData, evolutionData, eventData]) => {
        setCompetencies(competencyData);
        setEvolution(evolutionData);
        setEvents(eventData);
      })
      .catch((err) => setError(err.message));
  }, []);

  const latestEvents = useMemo(() => events.slice(0, 6), [events]);

  return (
    <div className="page-stack admin-surface">
      <PageHeader
        eyebrow="Sistema"
        title="Dashboard tecnico"
        description="Integracoes, telemetria, health e dados operacionais com backend como fonte oficial."
      />

      {error ? <div className="error-box">{error}</div> : null}

      <div className="stats-grid">
        <StatCard label="Eventos" value={events.length} helper="Fila operacional" />
        <StatCard label="Competencias" value={competencies.length} helper="Entidades registradas" />
        <StatCard label="Evolucao" value={`${Number(evolution?.progression?.progressPercent || 0).toFixed(0)}%`} helper="Progresso agregado" />
        <StatCard label="Direction" value={latestEvents[0]?.direction || 'n/d'} helper="Ultimo fluxo" />
      </div>

      <div className="grid-two">
        <Card title="Eventos recentes">
          {latestEvents.length ? (
            <div className="list compact-list">
              {latestEvents.map((event) => (
                <div className="list-item" key={event.id}>
                  <div className="row-between">
                    <strong>{event.eventType}</strong>
                    <StatusPill value={event.status} />
                  </div>
                  <span>{event.sourceSystem} · {event.direction}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Sem eventos ainda"
              description="Publique eventos em Integracao para validar sincronismo entre sistemas."
            />
          )}
        </Card>

        <Card title="Health operacional">
          <div className="list compact-list">
            <div className="list-item">
              <strong>Source system</strong>
              <p>{latestEvents[0]?.sourceSystem || 'aprende-ai'}</p>
            </div>
            <div className="list-item">
              <strong>Telemetria ativa</strong>
              <p>{events.length ? 'Sim' : 'Aguardando eventos'}</p>
            </div>
            <div className="list-item">
              <strong>Decision history</strong>
              <p>{evolution?.decisionHistory?.length || 0} itens coletados</p>
            </div>
            <div className="list-item">
              <strong>Direction predominante</strong>
              <p>{latestEvents[0]?.direction || 'outbound'}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
