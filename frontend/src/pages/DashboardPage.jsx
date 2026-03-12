import { useEffect, useMemo, useState } from 'react';
import Card from '../components/Card.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import StatusPill from '../components/StatusPill.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { api } from '../services/api.js';

export default function DashboardPage() {
  const [tracks, setTracks] = useState([]);
  const [competencies, setCompetencies] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/api/tracks'),
      api.get('/api/competencies'),
      api.get('/api/knowledge/documents'),
      api.get('/api/integration/events')
    ])
      .then(([tracksData, competencyData, documentData, eventData]) => {
        setTracks(tracksData);
        setCompetencies(competencyData);
        setDocuments(documentData);
        setEvents(eventData);
      })
      .catch((err) => setError(err.message));
  }, []);

  const latestEvents = useMemo(() => events.slice(0, 5), [events]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Produto"
        title="Dashboard do aprende.AI"
        description="Base inicial do projeto próprio, com front em Vite e backend modular em Sequelize, pronta para evoluir e integrar com o r-agent2."
      />

      {error ? <div className="error-box">{error}</div> : null}

      <div className="stats-grid">
        <StatCard label="Trilhas" value={tracks.length} helper="Catálogo de aprendizagem" />
        <StatCard label="Competências" value={competencies.length} helper="Mapa inicial de habilidades" />
        <StatCard label="Documentos" value={documents.length} helper="Base para RAG" />
        <StatCard label="Eventos" value={events.length} helper="Integração com o ecossistema" />
      </div>

      <div className="grid-two">
        <Card title="Princípios desta versão">
          <div className="list compact-list">
            <div className="list-item">
              <strong>Projeto separado</strong>
              <p>O domínio educacional não fica acoplado ao núcleo operacional do r-agent2.</p>
            </div>
            <div className="list-item">
              <strong>Mesmo padrão técnico</strong>
              <p>Sequelize, migrations, seed, organização modular e multi-tenant por tenant slug.</p>
            </div>
            <div className="list-item">
              <strong>Integração preparada</strong>
              <p>O módulo de eventos já está pronto para receber e publicar sinais do r-agent2.</p>
            </div>
          </div>
        </Card>

        <Card title="Últimos eventos de integração">
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
              description="Publique um evento na área de integração para validar o fluxo inicial com o ecossistema."
            />
          )}
        </Card>
      </div>
    </div>
  );
}
