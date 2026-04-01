import { useState } from 'react';
import { Button, ExperienceCard, StageWrapper } from '../../components';
import { saveOnboarding } from '../../services/profileApi.js';

const initialForm = {
  displayName: '',
  contextType: 'B2C',
  area: 'Produto',
  experienceLevel: 'intermediario',
  primaryObjective: 'Evoluir tomada de decisão em cenários críticos',
  goalTitle: 'Melhorar tomada de decisão',
  goalType: 'desenvolver habilidade',
  goalDescription: 'Quero decidir melhor em cenários com pressão.',
  dominantStyle: 'pratico'
};

export default function OnboardingPage() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await saveOnboarding(form);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <StageWrapper
      stageKey="onboarding"
      title="Onboarding do aprendiz"
      subtitle="Defina perfil, meta e estilo para gerar jornada personalizada"
      completed={result ? 1 : 0}
      total={1}
      variant="destaque"
      loading={loading}
    >
      <ExperienceCard variant="destaque" title="Configuração inicial">
        <form className="stack-form" onSubmit={handleSubmit}>
          <label>
            Nome de exibição
            <input value={form.displayName} onChange={(e) => setForm((prev) => ({ ...prev, displayName: e.target.value }))} />
          </label>
          <label>
            Contexto
            <select className="state-select-shell" value={form.contextType} onChange={(e) => setForm((prev) => ({ ...prev, contextType: e.target.value }))}>
              <option value="B2C">B2C</option>
              <option value="B2B">B2B</option>
            </select>
          </label>
          <label>
            Área de atuação
            <input value={form.area} onChange={(e) => setForm((prev) => ({ ...prev, area: e.target.value }))} />
          </label>
          <label>
            Nível de experiência
            <select className="state-select-shell" value={form.experienceLevel} onChange={(e) => setForm((prev) => ({ ...prev, experienceLevel: e.target.value }))}>
              <option value="iniciante">iniciante</option>
              <option value="intermediario">intermediário</option>
              <option value="avancado">avançado</option>
            </select>
          </label>
          <label>
            Objetivo principal
            <input value={form.primaryObjective} onChange={(e) => setForm((prev) => ({ ...prev, primaryObjective: e.target.value }))} />
          </label>
          <label>
            Meta de aprendizagem
            <input value={form.goalTitle} onChange={(e) => setForm((prev) => ({ ...prev, goalTitle: e.target.value }))} />
          </label>
          <label>
            Tipo de meta
            <select className="state-select-shell" value={form.goalType} onChange={(e) => setForm((prev) => ({ ...prev, goalType: e.target.value }))}>
              <option value="resolver problema">resolver problema</option>
              <option value="aprender algo novo">aprender algo novo</option>
              <option value="desenvolver habilidade">desenvolver habilidade</option>
              <option value="melhorar performance">melhorar performance</option>
              <option value="preparar para novo desafio">preparar para novo desafio</option>
            </select>
          </label>
          <label>
            Detalhes da meta
            <textarea value={form.goalDescription} onChange={(e) => setForm((prev) => ({ ...prev, goalDescription: e.target.value }))} />
          </label>
          <label>
            Estilo dominante
            <select className="state-select-shell" value={form.dominantStyle} onChange={(e) => setForm((prev) => ({ ...prev, dominantStyle: e.target.value }))}>
              <option value="explorador">explorador</option>
              <option value="pratico">prático</option>
              <option value="narrativo">narrativo</option>
              <option value="analitico">analítico</option>
            </select>
          </label>

          {error ? <div className="error-box">{error}</div> : null}
          <Button type="submit" disabled={loading}>{loading ? 'Salvando...' : 'Salvar onboarding e gerar jornada'}</Button>
        </form>
      </ExperienceCard>

      {result ? (
        <ExperienceCard variant="result" title="Jornada gerada" className="mt-4">
          <div className="list-item">
            <strong>{result.journey?.title}</strong>
            <p>Passos gerados: {result.journey?.steps?.length || 0}</p>
          </div>
        </ExperienceCard>
      ) : null}
    </StageWrapper>
  );
}
