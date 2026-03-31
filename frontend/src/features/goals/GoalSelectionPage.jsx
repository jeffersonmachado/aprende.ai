import { useState } from 'react';
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
      <h2>Seleção da meta de aprendizagem</h2>
      <p>Escolha o tipo de meta e detalhe o resultado desejado.</p>

      <form className="stack-form" onSubmit={handleSubmit}>
        <label>
          Tipo de meta
          <select value={form.goalType} onChange={(event) => setForm((prev) => ({ ...prev, goalType: event.target.value }))}>
            {goalTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </label>

        <label>
          Título da meta
          <input value={form.goalTitle} onChange={(event) => setForm((prev) => ({ ...prev, goalTitle: event.target.value }))} />
        </label>

        <label>
          Descrição da meta
          <textarea value={form.goalDescription} onChange={(event) => setForm((prev) => ({ ...prev, goalDescription: event.target.value }))} />
        </label>

        {error ? <div className="error-box">{error}</div> : null}
        {saved ? <div className="list-item">Meta salva com sucesso.</div> : null}
        <button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar meta'}</button>
      </form>
    </div>
  );
}
