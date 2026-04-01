import { useEffect, useState } from 'react';
import { EmptyState, StatusPill, Button, ExperienceCard, StageWrapper } from '../components/index.js';
import { api } from '../services/api.js';

const initialForm = {
  sourceSystem: 'aprende-ai',
  eventType: 'learning.track.recommended',
  direction: 'outbound',
  payload: '{\n  "example": true\n}'
};

export default function IntegrationPage() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  async function load() {
    setEvents(await api.get('/api/integration/events'));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/api/integration/events', {
        sourceSystem: form.sourceSystem,
        eventType: form.eventType,
        direction: form.direction,
        payload: JSON.parse(form.payload)
      });
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <StageWrapper
      stageKey="integration"
      title="Eventos prontos para o ecossistema"
      subtitle="Camada de integração por eventos e APIs, preservando isolamento do domínio educacional"
      completed={events.length > 0 ? 1 : 0}
      total={1}
      variant="default"
      loading={false}
    >
      <div className="grid-two">
        <ExperienceCard title="Publicar evento" variant="destaque">
          <form className="stack-form" onSubmit={handleSubmit}>
            <label>
              Sistema de origem
              <input value={form.sourceSystem} onChange={(e) => setForm((prev) => ({ ...prev, sourceSystem: e.target.value }))} />
            </label>
            <label>
              Tipo do evento
              <input value={form.eventType} onChange={(e) => setForm((prev) => ({ ...prev, eventType: e.target.value }))} />
            </label>
            <label>
              Direção
              <select className="state-select-shell" value={form.direction} onChange={(e) => setForm((prev) => ({ ...prev, direction: e.target.value }))}>
                <option value="outbound">outbound</option>
                <option value="inbound">inbound</option>
              </select>
            </label>
            <label>
              Payload JSON
              <textarea value={form.payload} onChange={(e) => setForm((prev) => ({ ...prev, payload: e.target.value }))} className="code-area" />
            </label>
            {error ? <div className="error-box">{error}</div> : null}
            <Button type="submit">Publicar evento</Button>
          </form>
        </ExperienceCard>

        <ExperienceCard title="Fila de eventos" variant="default">
          {events.length ? (
            <div className="list">
              {events.map((item) => (
                <div className="list-item" key={item.id}>
                  <div className="row-between gap-sm wrap">
                    <strong>{item.eventType}</strong>
                    <StatusPill value={item.status} />
                  </div>
                  <span>{item.sourceSystem} · {item.direction}</span>
                  <pre>{JSON.stringify(item.payload, null, 2)}</pre>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhum evento publicado"
              description="Publique o primeiro evento para validar a ponte entre o aprende.AI e o restante do ecossistema."
            />
          )}
        </ExperienceCard>
      </div>
    </StageWrapper>
  );
}
