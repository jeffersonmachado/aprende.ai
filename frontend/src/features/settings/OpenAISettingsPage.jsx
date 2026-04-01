import { useEffect, useState } from 'react';
import { Button, ExperienceCard, StageWrapper } from '../../components';
import { getOpenAISettings, saveOpenAISettings } from '../../services/openaiSettingsApi.js';

export default function OpenAISettingsPage() {
  const [token, setToken] = useState('');
  const [status, setStatus] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    getOpenAISettings()
      .then(setStatus)
      .catch((err) => setError(err.message));
  }, []);

  async function handleSave(event) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      const data = await saveOpenAISettings({ token });
      setStatus(data);
      setSaved(true);
      setToken('');
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <StageWrapper
      stageKey="openai-settings"
      title="Configuração OpenAI"
      subtitle="Defina o token para habilitar geração de cenários e feedback IA em tempo real"
      completed={saved || status?.configured ? 1 : 0}
      total={1}
      variant="default"
      loading={saving && !status}
    >
      <ExperienceCard variant="default" title="Status atual">
        <div className="list-item">
          <strong>Status atual</strong>
          <p>Configurado: {status?.configured ? 'sim' : 'não'}</p>
          <p>Origem: {status?.source || 'não definido'}</p>
          <small>Observação: a configuração atual é em runtime (reinício pode limpar se não estiver em variável de ambiente).</small>
        </div>
      </ExperienceCard>

      <ExperienceCard variant="destaque" title="Token" className="mt-4">
        <form className="stack-form" onSubmit={handleSave}>
          <label>
            Token OpenAI
            <input
              type="password"
              placeholder="sk-..."
              value={token}
              onChange={(event) => setToken(event.target.value)}
            />
          </label>

          {error ? <div className="error-box">{error}</div> : null}
          {saved ? <div className="list-item">Token atualizado com sucesso.</div> : null}

          <Button type="submit" disabled={saving || !token.trim()}>
            {saving ? 'Salvando...' : 'Salvar token'}
          </Button>
        </form>
      </ExperienceCard>
    </StageWrapper>
  );
}
