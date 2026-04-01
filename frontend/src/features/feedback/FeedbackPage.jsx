import { useState } from 'react';
import { Button, ExperienceCard, StageWrapper } from '../../components';
import { generateFeedback } from '../../services/feedbackApi.js';

const styles = ['socratico', 'direto', 'reflexivo', 'analitico'];

export default function FeedbackPage() {
  const [selectedStyle, setSelectedStyle] = useState('socratico');
  const [decision, setDecision] = useState('Escolhi priorizar o alinhamento com stakeholders antes de executar.');
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');

  async function handleGenerate(event) {
    event.preventDefault();
    setError('');
    try {
      const data = await generateFeedback({
        style: selectedStyle,
        decision: {
          selectedOption: { label: decision },
          impact: {
            velocidade: 2,
            assertividade: 4,
            analise_risco: 3,
            consistencia: 5
          }
        }
      });
      setFeedback(data.feedback || 'Sem feedback retornado.');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <StageWrapper
      stageKey="feedback"
      title="Feedback IA (utilitario tecnico)"
      subtitle="Validação de prompts e estilos de feedback fora da jornada principal"
      completed={feedback ? 1 : 0}
      total={1}
      variant="default"
      loading={false}
    >
      <div className="admin-surface">
        <ExperienceCard variant="default" title="Gerar feedback">
          <form className="stack-form" onSubmit={handleGenerate}>
            <label>
              Estilo de feedback
              <select className="state-select-shell" value={selectedStyle} onChange={(event) => setSelectedStyle(event.target.value)}>
                {styles.map((style) => <option key={style} value={style}>{style}</option>)}
              </select>
            </label>

            <label>
              Decisão
              <textarea value={decision} onChange={(event) => setDecision(event.target.value)} />
            </label>

            {error ? <div className="error-box">{error}</div> : null}
            <Button type="submit">Gerar feedback</Button>
          </form>
        </ExperienceCard>

        {feedback ? (
          <ExperienceCard variant="result" title="Resposta do modelo" className="mt-4">
            <div className="list-item">
              <strong>Feedback ({selectedStyle})</strong>
              <p>{feedback}</p>
            </div>
          </ExperienceCard>
        ) : null}
      </div>
    </StageWrapper>
  );
}
