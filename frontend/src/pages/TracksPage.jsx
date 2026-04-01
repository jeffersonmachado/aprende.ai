import { useEffect, useState } from 'react';
import { FormField, Button, Alert, EmptyState, StatusPill, ExperienceCard, StageWrapper } from '../components/index.js';
import { JourneySummaryCard, RewardPill } from '../components/DomainComponents.jsx';
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
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const publishedCount = tracks.filter((item) => item.status === 'published').length;
  const publicCount = tracks.filter((item) => item.visibility === 'public').length;

  async function load() {
    try {
      setTracks(await api.get('/api/tracks'));
    } catch (err) {
      setError(err.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      await api.post('/api/tracks', form);
      setForm(initialForm);
      setSuccess('Trilha criada com sucesso!');
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <StageWrapper
      stageKey="tracks"
      title="Trilhas de Aprendizagem"
      subtitle="Estruture jornadas de desenvolvimento com competências e dificuldade"
      completed={tracks.length > 0 ? 1 : 0}
      total={1}
      variant="destaque"
      loading={loading}
    >
      <ExperienceCard variant="mentor" className="tracks-hero" title="Catalogo de trilhas">
        <p className="tracks-hero-text">
          Estruture trilhas por objetivo, status e visibilidade para orientar a progressao da jornada.
        </p>
        <div className="inline-pills">
          <RewardPill label="Total" value={tracks.length} />
          <RewardPill label="Publicadas" value={publishedCount} />
          <RewardPill label="Publicas" value={publicCount} />
        </div>
      </ExperienceCard>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Formulário - Criar nova trilha */}
        <ExperienceCard variant="destaque" title="Nova Trilha">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert 
                variant="destructive"
                title="Erro"
                description={error}
              />
            )}
            
            {success && (
              <Alert
                variant="success"
                title="Sucesso"
                description={success}
              />
            )}

            <FormField
              id="track-title"
              label="Título"
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Ex: Leadership em decisões complexas"
            />

            <FormField
              id="track-description"
              label="Descrição"
              type="textarea"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Descreva o conteúdo e objetivo da trilha"
            />

            <div className="space-y-2">
              <label htmlFor="track-status" className="block text-sm font-semibold text-muted-900 dark:text-muted-50">
                Status
              </label>
              <select
                id="track-status"
                value={form.status}
                onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value }))}
                className="state-select-shell w-full rounded-lg border border-muted-200 dark:border-dark-700 bg-white dark:bg-dark-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              >
                <option value="draft">Rascunho (Draft)</option>
                <option value="published">Publicado</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="track-visibility" className="block text-sm font-semibold text-muted-900 dark:text-muted-50">
                Visibilidade
              </label>
              <select
                id="track-visibility"
                value={form.visibility}
                onChange={(e) => setForm((prev) => ({ ...prev, visibility: e.target.value }))}
                className="state-select-shell w-full rounded-lg border border-muted-200 dark:border-dark-700 bg-white dark:bg-dark-800 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                disabled={loading}
              >
                <option value="private">Privado</option>
                <option value="public">Público</option>
              </select>
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar trilha'}
            </Button>
          </form>
        </ExperienceCard>

        {/* Listagem - Trilhas cadastradas */}
        <ExperienceCard variant="default" title="Trilhas Cadastradas">
          {tracks.length ? (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {tracks.map((track) => (
                <JourneySummaryCard key={track.id} title={track.title}>
                  <div className="space-y-3">
                    {/* Status badges */}
                    <div className="flex flex-wrap gap-2">
                      <StatusPill value={track.status} />
                      <StatusPill value={track.visibility} />
                      {track.status === 'published' && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success-100 text-success-700 dark:bg-success-900/30 dark:text-success-400">
                          Recomendação: Alta
                        </span>
                      )}
                    </div>

                    {/* Descrição */}
                    <p className="text-sm text-muted-600 dark:text-muted-400">
                      {track.description || 'Sem descrição.'}
                    </p>

                    {/* Tags de metadados */}
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-muted-100 dark:bg-dark-700 text-muted-700 dark:text-muted-300">
                        👥 Gestores
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-muted-100 dark:bg-dark-700 text-muted-700 dark:text-muted-300">
                        ⚖️ Média
                      </span>
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-muted-100 dark:bg-dark-700 text-muted-700 dark:text-muted-300">
                        🎯 Decisão & Execução
                      </span>
                    </div>
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
        </ExperienceCard>
      </div>
    </StageWrapper>
  );
}
