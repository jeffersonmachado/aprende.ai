import { useEffect, useState } from 'react';
import { Card, PageHeader, EmptyState, StatCard, StatusPill, FormField, Button, ExperienceCard, StageWrapper } from '../components/index.js';
import { CompetencyMeter, JourneySummaryCard } from '../components/DomainComponents.jsx';
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
    <StageWrapper
      stageKey="competencies"
      title="Mapa de Competências"
      subtitle="Define habilidades, dimensões e evidências para evolução na jornada"
      completed={competencies.length > 0 ? 1 : 0}
      total={1}
      variant="default"
      loading={false}
    >
      <div className="grid-two gap-6">
        <ExperienceCard variant="destaque" title="Nova Competência">
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
        </ExperienceCard>

        <ExperienceCard variant="default" title="Competências Cadastradas">
          {competencies.length ? (
            <div className="list">
              {competencies.map((item) => (
                <JourneySummaryCard key={item.id} title={item.name}>
                  <div className="row-between gap-sm wrap">
                    <span className="muted-text">Tipo: {item.category || 'comportamental'}</span>
                    <span className="muted-text">Peso: 0.6</span>
                  </div>
                  <span>{item.code || 'sem codigo'}</span>
                  <p>{item.description || 'Sem descrição.'}</p>
                  <p>Dimensoes: clareza de criterio, qualidade de execucao, consistencia sob pressao.</p>
                  <p>Evidencias tipicas: racional da escolha, impacto medido e revisao de proximo passo.</p>
                  <p>Impacto na jornada: acelera recomendacoes e define foco de reforco pedagogico.</p>
                  <CompetencyMeter label="Maturidade estimada" value={58} baseline={42} />
                </JourneySummaryCard>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhuma competência cadastrada"
              description="Cadastre competências como empatia, comunicação, negociação e pensamento crítico."
            />
          )}
        </ExperienceCard>
      </div>
    </StageWrapper>
  );
}
