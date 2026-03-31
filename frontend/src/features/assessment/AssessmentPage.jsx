import { useState } from 'react';
import { DiagnosticMiniCard, JourneySummaryCard } from '../../components/DomainComponents.jsx';
import { evaluateAssessment } from '../../services/assessmentApi.js';

export default function AssessmentPage() {
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await evaluateAssessment({
        answers: [{ questionId: 'open', answerText: answer }],
        textAnswer: answer
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <h2>Assessment contextual</h2>
      <p>Avaliacao conectada a competencias, criterio e evidencia da sua decisao.</p>

      <div className="grid-two">
        <DiagnosticMiniCard label="Competencia avaliada" value="Tomada de decisao" />
        <DiagnosticMiniCard label="Criterio usado" value="clareza, risco e consistencia" />
        <DiagnosticMiniCard label="Nivel atual" value="intermediario" />
        <DiagnosticMiniCard label="Evidencia esperada" value="racional + impacto + proximo passo" />
      </div>

      <form className="stack-form" onSubmit={handleSubmit}>
        <label>
          Sua resposta
          <textarea value={answer} onChange={(e) => setAnswer(e.target.value)} placeholder="Descreva sua estratégia para lidar com o cenário." />
        </label>
        {error ? <div className="error-box">{error}</div> : null}
        <button type="submit" disabled={loading || !answer.trim()}>{loading ? 'Avaliando...' : 'Enviar avaliação'}</button>
      </form>

      {result ? (
        <div className="grid-two">
          <JourneySummaryCard title={`Score: ${result.score}`}>
            <p>{result.feedback}</p>
          </JourneySummaryCard>
          <JourneySummaryCard title="Recomendacao pratica">
            <p>{result.recommendation}</p>
            <p><strong>Proximo passo:</strong> {result.nextStepSuggestion}</p>
          </JourneySummaryCard>
        </div>
      ) : null}
    </div>
  );
}
