import { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import { api } from '../services/api.js';

const initialForm = { code: '', name: '', description: '', category: '' };

export default function CompetenciesPage() {
  const [competencies, setCompetencies] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');

  async function load() {
    setCompetencies(await api.get('/api/competencies'));
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/api/competencies', form);
      setForm(initialForm);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Competências"
        title="Mapa inicial de habilidades"
        description="Camada importante para avaliação, recomendação adaptativa e integração futura com dados operacionais do r-agent2."
      />

      <div className="grid-two">
        <Card title="Nova competência">
          <form className="stack-form" onSubmit={handleSubmit}>
            <label>
              Código
              <input value={form.code} onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))} />
            </label>
            <label>
              Nome
              <input value={form.name} onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))} />
            </label>
            <label>
              Categoria
              <input value={form.category} onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value }))} />
            </label>
            <label>
              Descrição
              <textarea value={form.description} onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))} />
            </label>
            {error ? <div className="error-box">{error}</div> : null}
            <button type="submit">Salvar competência</button>
          </form>
        </Card>

        <Card title="Competências cadastradas">
          {competencies.length ? (
            <div className="list">
              {competencies.map((item) => (
                <div className="list-item" key={item.id}>
                  <div className="row-between gap-sm wrap">
                    <strong>{item.name}</strong>
                    <span className="muted-text">{item.category || 'sem categoria'}</span>
                  </div>
                  <span>{item.code || 'sem código'}</span>
                  <p>{item.description || 'Sem descrição.'}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhuma competência cadastrada"
              description="Cadastre competências como empatia, comunicação, negociação e pensamento crítico."
            />
          )}
        </Card>
      </div>
    </div>
  );
}
