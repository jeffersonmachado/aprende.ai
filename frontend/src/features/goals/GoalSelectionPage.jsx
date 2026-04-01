import { useState } from 'react';
import { Badge, Button, ExperienceCard, StageWrapper } from '../../components';
import { saveLearningGoal } from '../../services/profileApi.js';

const goalTypes = [
  'resolver problema',
  'aprender algo novo',
  'desenvolver habilidade',
  'melhorar performance',
  'preparar para novo desafio'
];

export default function GoalSelectionPage() {
  const [form, setForm] = useState({
    goalType: goalTypes[2],
    goalTitle: 'Tomar decisões com mais assertividade',
    goalDescription: ''
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    setSaved(false);
    try {
      await saveLearningGoal(form);
      setSaved(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <StageWrapper
        stageKey="goals"
        title="Seleção da meta de aprendizagem"
        subtitle="Escolha o tipo de meta e detalhe o resultado desejado."
        completed={saved ? 1 : 0}
        total={1}
        variant="active"
        loading={loading}
      >
        <ExperienceCard variant="decision" title="Defina sua meta" active>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <label className="block text-sm font-medium text-muted-700 dark:text-muted-300">
              Tipo de meta
              <select
                value={form.goalType}
                onChange={(event) => setForm((prev) => ({ ...prev, goalType: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-muted-300 bg-white/90 px-3 py-2 text-sm text-muted-900 shadow-soft focus:border-primary-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800/90 dark:text-muted-100"
              >
                {goalTypes.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>

            <label className="block text-sm font-medium text-muted-700 dark:text-muted-300">
              Título da meta
              <input
                value={form.goalTitle}
                onChange={(event) => setForm((prev) => ({ ...prev, goalTitle: event.target.value }))}
                className="mt-1 w-full rounded-xl border border-muted-300 bg-white/90 px-3 py-2 text-sm text-muted-900 shadow-soft focus:border-primary-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800/90 dark:text-muted-100"
              />
            </label>

            <label className="block text-sm font-medium text-muted-700 dark:text-muted-300">
              Descrição da meta
              <textarea
                value={form.goalDescription}
                onChange={(event) => setForm((prev) => ({ ...prev, goalDescription: event.target.value }))}
                className="mt-1 min-h-24 w-full rounded-xl border border-muted-300 bg-white/90 px-3 py-2 text-sm text-muted-900 shadow-soft focus:border-primary-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800/90 dark:text-muted-100"
              />
            </label>

            {error ? <div className="error-box">{error}</div> : null}
            {saved ? <Badge variant="achieved">Meta salva com sucesso</Badge> : null}
            <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar meta'}</Button>
          </form>
        </ExperienceCard>
      </StageWrapper>
    </div>
  );
}
