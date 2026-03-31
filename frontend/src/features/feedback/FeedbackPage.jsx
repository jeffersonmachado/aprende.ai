import { useState } from 'react';
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
    <div className="page-stack admin-surface">
      <h2>Feedback IA (utilitario tecnico)</h2>
      <p>Tela interna para validacao de prompts e estilos. Na experiencia principal, feedback aparece dentro da jornada.</p>

      <form className="stack-form" onSubmit={handleGenerate}>
        <label>
          Estilo de feedback
          <select value={selectedStyle} onChange={(event) => setSelectedStyle(event.target.value)}>
            {styles.map((style) => <option key={style} value={style}>{style}</option>)}
          </select>
        </label>

        <label>
          Decisão
          <textarea value={decision} onChange={(event) => setDecision(event.target.value)} />
        </label>

        {error ? <div className="error-box">{error}</div> : null}
        <button type="submit">Gerar feedback</button>
      </form>

      {feedback ? (
        <div className="list-item">
          <strong>Feedback ({selectedStyle})</strong>
          <p>{feedback}</p>
        </div>
      ) : null}
    </div>
  );
}
