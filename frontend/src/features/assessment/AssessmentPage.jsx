import { useState } from 'react';
import { DiagnosticMiniCard, JourneySummaryCard } from '../../components/DomainComponents.jsx';
import { Badge, Button, ExperienceCard, StageWrapper } from '../../components';
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
      <StageWrapper
        stageKey="assessment"
        title="Assessment contextual"
        subtitle="Avaliacao conectada a competencias, criterio e evidencia da sua decisao."
        completed={result ? 1 : 0}
        total={1}
        variant={result ? 'result' : 'decision'}
        loading={loading}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <ExperienceCard variant="default"><DiagnosticMiniCard label="Competencia avaliada" value="Tomada de decisao" /></ExperienceCard>
          <ExperienceCard variant="default"><DiagnosticMiniCard label="Criterio usado" value="clareza, risco e consistencia" /></ExperienceCard>
          <ExperienceCard variant="default"><DiagnosticMiniCard label="Nivel atual" value="intermediario" /></ExperienceCard>
          <ExperienceCard variant="default"><DiagnosticMiniCard label="Evidencia esperada" value="racional + impacto + proximo passo" /></ExperienceCard>
        </div>

        <ExperienceCard className="mt-4" title="Sua resposta" variant="decision" active>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Descreva sua estratégia para lidar com o cenário."
              className="min-h-28 w-full rounded-xl border border-muted-300 bg-white/90 px-3 py-2 text-sm text-muted-900 shadow-soft focus:border-primary-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800/90 dark:text-muted-100"
            />
            {error ? <div className="error-box">{error}</div> : null}
            <Button type="submit" disabled={loading || !answer.trim()}>{loading ? 'Avaliando...' : 'Enviar avaliação'}</Button>
          </form>
        </ExperienceCard>

        {result ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <ExperienceCard variant="result" title={`Score: ${result.score}`} active>
              <div className="pb-2">
                <Badge variant="xp">+22 XP potencial</Badge>
              </div>
              <JourneySummaryCard title="Feedback">
                <p>{result.feedback}</p>
              </JourneySummaryCard>
            </ExperienceCard>
            <ExperienceCard variant="success" title="Recomendacao pratica">
              <JourneySummaryCard title="Proximos passos">
                <p>{result.recommendation}</p>
                <p><strong>Proximo passo:</strong> {result.nextStepSuggestion}</p>
              </JourneySummaryCard>
            </ExperienceCard>
          </div>
        ) : null}
      </StageWrapper>
    </div>
  );
}
