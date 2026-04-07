import { useState } from 'react';
import { DiagnosticMiniCard, JourneySummaryCard } from '../../components/DomainComponents.jsx';
import { Badge, Button, ExperienceCard, StageWrapper } from '../../components';
import { evaluateAssessment } from '../../services/assessmentApi.js';

function getRubricLabel(item) {
  if (typeof item === 'string' || typeof item === 'number') return String(item);
  if (!item || typeof item !== 'object') return 'Critério';
  return item.title || item.label || item.description || item.name || 'Critério';
}

function getRubricKey(item, index) {
  if (typeof item === 'string' || typeof item === 'number') return `rubric-${item}-${index}`;
  if (!item || typeof item !== 'object') return `rubric-${index}`;
  return item.id || item.code || `${getRubricLabel(item).replace(/\s+/g, '-').toLowerCase()}-${index}`;
}

export default function AssessmentPage({ campaignMode = false, onAdvance = null, advanceLabel = 'Seguir para a proxima fase', campaignPhase = null, linkedSimulationRunId = null }) {
  const [answer, setAnswer] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const assessmentContent = campaignPhase?.content || null;

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await evaluateAssessment({
        assessmentId: assessmentContent?.apiContext?.phaseLabel ? `${campaignPhase?.chapterId || 'campaign'}-${campaignPhase?.id || 'assessment'}` : null,
        competencyId: assessmentContent?.competencyLabel || null,
        simulationRunId: linkedSimulationRunId,
        answers: [{ questionId: 'open', answerText: answer, campaignContext: assessmentContent?.apiContext || null }],
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
        title={campaignPhase?.content?.title || 'Assessment contextual'}
        subtitle={campaignPhase?.content?.description || 'Avaliacao conectada a competencias, criterio e evidencia da sua decisao.'}
        completed={result ? 1 : 0}
        total={1}
        variant={result ? 'result' : 'decision'}
        loading={loading}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <ExperienceCard variant="default"><DiagnosticMiniCard label="Competencia avaliada" value={assessmentContent?.competencyLabel || 'Tomada de decisao'} /></ExperienceCard>
          <ExperienceCard variant="default"><DiagnosticMiniCard label="Criterio usado" value={assessmentContent?.criterionLabel || 'clareza, risco e consistencia'} /></ExperienceCard>
          <ExperienceCard variant="default"><DiagnosticMiniCard label="Nivel atual" value={assessmentContent?.levelLabel || 'intermediario'} /></ExperienceCard>
          <ExperienceCard variant="default"><DiagnosticMiniCard label="Evidencia esperada" value={assessmentContent?.evidenceLabel || 'racional + impacto + proximo passo'} /></ExperienceCard>
        </div>

        <ExperienceCard className="mt-4" title="Sua resposta" variant="decision" active>
          <form className="space-y-3" onSubmit={handleSubmit}>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={assessmentContent?.promptPlaceholder || 'Descreva sua estratégia para lidar com o cenário.'}
              className="min-h-28 w-full rounded-xl border border-muted-300 bg-white/90 px-3 py-2 text-sm text-muted-900 shadow-soft focus:border-primary-500 focus:outline-none dark:border-dark-700 dark:bg-dark-800/90 dark:text-muted-100"
            />
            {assessmentContent?.rubric?.length ? (
              <div className="rounded-xl border border-muted-200 bg-muted-50/80 p-3 text-sm text-muted-700 dark:border-dark-700 dark:bg-dark-800/60 dark:text-muted-300">
                <strong>Rubrica desta fase</strong>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {assessmentContent.rubric.map((item, index) => <li key={getRubricKey(item, index)}>{getRubricLabel(item)}</li>)}
                </ul>
              </div>
            ) : null}
            {campaignMode && linkedSimulationRunId ? (
              <div className="rounded-xl border border-primary-200 bg-primary-50/80 p-3 text-sm text-primary-800 dark:border-primary-900/40 dark:bg-primary-950/20 dark:text-primary-200">
                Assessment vinculado ao run de simulação {linkedSimulationRunId.slice(0, 8)}.
              </div>
            ) : null}
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
            {campaignMode ? (
              <ExperienceCard variant="mentor" title="Capitulo concluido" className="md:col-span-2 campaign-phase-next-card">
                <p>Assessment finalizado. Esta fase já consolidou critério, evidência e próximo movimento.</p>
                {onAdvance ? <Button type="button" onClick={onAdvance}>{advanceLabel}</Button> : <span className="muted-text">Fim do capitulo atual.</span>}
              </ExperienceCard>
            ) : null}
          </div>
        ) : null}
      </StageWrapper>
    </div>
  );
}
