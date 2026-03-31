import { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { JourneySummaryCard, RewardPill } from '../components/DomainComponents.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusPill from '../components/StatusPill.jsx';
import { api } from '../services/api.js';

const initialForm = {
  title: '',
  description: '',
  status: 'draft',
  visibility: 'private'
};

export default function TracksPage() {
  const [tracks, setTracks] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  async function load() {
    setTracks(await api.get('/api/tracks'));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/api/tracks', form);
      setForm(initialForm);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Estrutura"
        title="Trilhas de aprendizagem"
        description="Cada trilha comunica publico-alvo, dificuldade, competencias principais e indicacao de recomendacao."
      />

      <div className="grid-two">
        <Card title="Nova trilha">
          <form className="stack-form" onSubmit={handleSubmit}>
            <label>
              Título
              <input value={form.title} onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))} />
            </label>
            <label>
              Descrição
              <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            </label>
            <label>
              Status
              <select value={form.status} onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}>
                <option value="draft">draft</option>
                <option value="published">published</option>
              </select>
            </label>
            <label>
              Visibilidade
              <select value={form.visibility} onChange={(e) => setForm((prev) => ({ ...prev, visibility: e.target.value }))}>
                <option value="private">private</option>
                <option value="public">public</option>
              </select>
            </label>
            {error ? <div className="error-box">{error}</div> : null}
            <button type="submit">Salvar trilha</button>
          </form>
        </Card>

        <Card title="Trilhas cadastradas">
          {tracks.length ? (
            <div className="list">
              {tracks.map((track) => (
                <JourneySummaryCard key={track.id} title={track.title}>
                  <div className="row-between gap-sm wrap">
                    <div className="inline-pills">
                      <StatusPill value={track.status} />
                      <StatusPill value={track.visibility} />
                      <RewardPill label="Recomendacao" value={track.status === 'published' ? 'alta' : 'moderada'} />
                    </div>
                  </div>
                  <p>{track.description || 'Sem descrição.'}</p>
                  <div className="inline-pills">
                    <span className="reward-pill">Publico: gestores e profissionais</span>
                    <span className="reward-pill">Dificuldade: media</span>
                    <span className="reward-pill">Competencias: decisao e execucao</span>
                  </div>
                </JourneySummaryCard>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhuma trilha cadastrada"
              description="Crie a primeira trilha para iniciar o catálogo de aprendizagem do projeto."
            />
          )}
        </Card>
      </div>
    </div>
  );
}
