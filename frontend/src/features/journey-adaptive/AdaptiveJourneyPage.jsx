import { useEffect, useState } from 'react';
import { Button, ExperienceCard } from '../../components/index.js';
import {
  completeAdaptiveJourney,
  createAdaptiveJourneySession,
  getAdaptiveJourneyCurrentChapter,
  getAdaptiveJourneyExplanations,
  getAdaptiveJourneyHistory,
  getAdaptiveJourneyRuntime,
  recalculateAdaptiveJourney,
  startAdaptiveDiagnostic,
  submitAdaptiveJourneyDecision
} from '../../services/journeyAdaptiveApi.js';

const DEFAULT_COMPETENCY = 'negociacao_adaptativa';

function renderList(items = [], emptyLabel = 'Sem itens registrados.') {
  if (!items.length) return <p>{emptyLabel}</p>;
  return (
    <div className="campaign-tag-cloud compact">
      {items.map((item, index) => <span key={`${String(item)}-${index}`}>{String(item)}</span>)}
    </div>
  );
}

export default function AdaptiveJourneyPage() {
  const [runtime, setRuntime] = useState(null);
  const [history, setHistory] = useState(null);
  const [explanations, setExplanations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [selectedOption, setSelectedOption] = useState('');
  const [responseText, setResponseText] = useState('');
  const [localNote, setLocalNote] = useState('');

  async function reloadAll() {
    setLoading(true);
    setError('');
    try {
      const [runtimeData, historyData, explanationData, chapterData] = await Promise.all([
        getAdaptiveJourneyRuntime(),
        getAdaptiveJourneyHistory(),
        getAdaptiveJourneyExplanations(),
        getAdaptiveJourneyCurrentChapter().catch(() => null)
      ]);
      setRuntime(runtimeData ? { ...runtimeData, currentChapter: chapterData || runtimeData.currentChapter } : null);
      setHistory(historyData);
      setExplanations(explanationData);
      if ((chapterData?.cycle?.decisionOptions || []).length) {
        setSelectedOption((current) => current || chapterData.cycle.decisionOptions[0]);
      }
    } catch (err) {
      setError(err.message || 'Falha ao carregar jornada adaptativa.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reloadAll();
  }, []);

  async function handleBootstrapJourney() {
    setSubmitting(true);
    setError('');
    try {
      await startAdaptiveDiagnostic({
        targetCompetencyCode: DEFAULT_COMPETENCY,
        diagnostic: { baselineScore: 48, confidence: 44, consistency: 42 }
      });
      await createAdaptiveJourneySession({ targetCompetencyCode: DEFAULT_COMPETENCY });
      await reloadAll();
    } catch (err) {
      setError(err.message || 'Falha ao criar jornada adaptativa.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDecision() {
    if (!runtime?.currentChapter || !selectedOption) return;
    setSubmitting(true);
    setLocalNote('');
    setError('');
    try {
      const response = await submitAdaptiveJourneyDecision({
        chapterId: runtime.currentChapter.id,
        selectedOption,
        responseText,
        outcome: {
          evidenceText: responseText || selectedOption
        }
      });
      setLocalNote(response?.chapterResult?.result?.mentorFeedback || 'Capítulo registrado com sucesso.');
      setResponseText('');
      await reloadAll();
    } catch (err) {
      setError(err.message || 'Falha ao enviar decisão adaptativa.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRecalculate() {
    setSubmitting(true);
    setError('');
    try {
      await recalculateAdaptiveJourney({ force: true, reason: 'Recalibração manual pela interface.' });
      await reloadAll();
    } catch (err) {
      setError(err.message || 'Falha ao recalcular jornada adaptativa.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleComplete() {
    setSubmitting(true);
    setError('');
    try {
      await completeAdaptiveJourney({ reason: 'Encerramento confirmado pelo aprendiz.' });
      await reloadAll();
    } catch (err) {
      setError(err.message || 'Falha ao encerrar jornada adaptativa.');
    } finally {
      setSubmitting(false);
    }
  }

  const progress = runtime?.progress;
  const currentChapter = runtime?.currentChapter;

  return (
    <div className="campaign-flow-shell">
      <ExperienceCard title="Jornada adaptativa oficial" variant="mentor" className="campaign-flow-rail campaign-flow-hero-rail">
        <div className="campaign-flow-header">
          <div className="campaign-flow-title-block">
            <p className="campaign-kicker">Competência como centro</p>
            <h2>{progress?.competency?.name || 'Jornada adaptativa controlada'}</h2>
            <p className="campaign-flow-lead">
              O backend infere capítulos, valida o plano, registra evidências e decide reforço, aceleração ou encerramento.
            </p>
          </div>
          <div className="campaign-flow-counter campaign-flow-counter-hero">
            <strong>{runtime?.status || 'idle'}</strong>
            <span>
              {progress
                ? `${progress.completedChapters}/${progress.estimatedChapterCount} capítulos executados · score ${Number(progress.competency?.score || 0).toFixed(1)}`
                : 'Nenhuma jornada ativa'}
            </span>
          </div>
        </div>
        {error ? <div className="error-box mt-3">{error}</div> : null}
      </ExperienceCard>

      {!runtime?.journeyId && !currentChapter ? (
        <ExperienceCard title="Iniciar jornada" variant="mentor" active>
          <p>Crie um diagnóstico inicial e deixe o backend montar o plano adaptativo oficial.</p>
          <div className="campaign-actions">
            <Button type="button" onClick={handleBootstrapJourney} disabled={submitting || loading}>
              {submitting ? 'Criando...' : 'Iniciar jornada adaptativa'}
            </Button>
          </div>
        </ExperienceCard>
      ) : null}

      {currentChapter ? (
        <div className="campaign-dashboard-grid mt-6">
          <ExperienceCard title="Capítulo atual" variant="active" active>
            <p className="campaign-kicker">{currentChapter.type}</p>
            <h3>{currentChapter.title}</h3>
            <p>{currentChapter.description}</p>
            <div className="campaign-context-grid mt-3">
              <div className="campaign-context-panel">
                <span>Contexto</span>
                <strong>{currentChapter.cycle.context}</strong>
              </div>
              <div className="campaign-context-panel">
                <span>Desafio</span>
                <strong>{currentChapter.cycle.challenge}</strong>
              </div>
              <div className="campaign-context-panel">
                <span>Objetivo pedagógico</span>
                <strong>{currentChapter.pedagogicalObjective}</strong>
              </div>
            </div>
            <label className="mt-3">
              Decisão oficial
              <select value={selectedOption} onChange={(event) => setSelectedOption(event.target.value)}>
                {(currentChapter.cycle.decisionOptions || []).map((option) => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="mt-3">
              Raciocínio do aprendiz
              <textarea
                value={responseText}
                onChange={(event) => setResponseText(event.target.value)}
                placeholder="Explique o critério usado, o trade-off assumido e a evidência que sustenta a decisão."
              />
            </label>
            <div className="campaign-feedback-callout mt-3">
              <span>Pergunta do mentor</span>
              <strong>{currentChapter.cycle.reflectionPrompt}</strong>
              <p>{currentChapter.reasoning}</p>
            </div>
            {localNote ? <div className="campaign-feedback-callout mt-3"><p>{localNote}</p></div> : null}
            <div className="campaign-actions mt-3">
              <Button type="button" onClick={handleDecision} disabled={submitting || loading || !selectedOption}>
                {submitting ? 'Enviando...' : 'Registrar decisão'}
              </Button>
              <Button type="button" onClick={handleRecalculate} disabled={submitting || loading}>
                Recalcular jornada
              </Button>
              {progress?.canClose ? (
                <Button type="button" onClick={handleComplete} disabled={submitting || loading}>
                  Encerrar jornada
                </Button>
              ) : null}
            </div>
          </ExperienceCard>

          <ExperienceCard title="Progresso por competência" variant="mentor">
            <p className="campaign-kicker">Autoridade oficial do backend</p>
            <h3>{progress?.competency?.name || 'Sem competência ativa'}</h3>
            <p>Score atual: {Number(progress?.competency?.score || 0).toFixed(1)} / {progress?.competency?.targetScore || 0}</p>
            <p>Consistência: {Number(progress?.competency?.consistency || 0).toFixed(1)} / {progress?.competency?.minimumConsistency || 0}</p>
            <p>Evidências: {progress?.competency?.evidenceCount || 0} / {progress?.competency?.minimumEvidenceCount || 0}</p>
            <p>Perfil de proficiência: {progress?.competency?.proficiencyLevel || 'n/a'}</p>
            <div className="campaign-feedback-callout mt-3">
              <span>Mentoria aplicada</span>
              <strong>{runtime?.mentorPreset?.id || 'analitico'}</strong>
              <p>{runtime?.mentorPreset?.promptStyle || 'Sem preset ativo.'}</p>
            </div>
            <div className="campaign-context-panel mt-3">
              <span>Requisitos para encerramento</span>
              <strong>{(progress?.closureRequirements || []).length ? progress.closureRequirements.join(' · ') : 'Todos os requisitos atendidos.'}</strong>
            </div>
          </ExperienceCard>
        </div>
      ) : null}

      <div className="campaign-dashboard-grid mt-6">
        <ExperienceCard title="Justificativas de reforço e aceleração" variant="mentor">
          <p className="campaign-kicker">Rastreabilidade</p>
          <h3>Explicações do motor adaptativo</h3>
          <p>O sistema registra por que inseriu reforços, acelerou ou bloqueou encerramento.</p>
          <div className="mt-3">
            <span>Reforços</span>
            {renderList((explanations?.reinforcement || []).map((item) => item.reason))}
          </div>
          <div className="mt-3">
            <span>Aceleração</span>
            {renderList((explanations?.acceleration || []).map((item) => item.reason))}
          </div>
          <div className="mt-3">
            <span>Encerramento</span>
            {renderList((explanations?.closure || []).map((item) => item.reason))}
          </div>
        </ExperienceCard>

        <ExperienceCard title="Histórico observável" variant="mentor">
          <p className="campaign-kicker">Execução auditável</p>
          <h3>Capítulos executados</h3>
          {(history?.executions || []).length ? (
            <div className="campaign-flow-phase-track">
              {history.executions.map((execution) => (
                <div key={execution.id} className="campaign-flow-phase-pill done">
                  <span>{execution.chapterType}</span>
                  <div>
                    <strong>{execution.selectedOption}</strong>
                    <small>{Number(execution.result?.scoreDelta || 0).toFixed(1)} pts · {execution.actionTaken?.kind}</small>
                  </div>
                </div>
              ))}
            </div>
          ) : <p>Nenhum capítulo executado ainda.</p>}
        </ExperienceCard>
      </div>

      {loading ? <div className="page-stack"><div>Carregando jornada adaptativa...</div></div> : null}
    </div>
  );
}
