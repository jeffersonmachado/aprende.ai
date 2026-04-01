import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  getEvolution,
  getScenarioState,
  getSimulationCatalog,
  getSimulationState,
  postDecision,
  saveScenarioState,
  startSimulation,
  submitSimulationDecision
} from '../../services/scenarioApi.js';

export const SCENARIO_STEPS = [
  { id: 'contexto', title: 'Contexto', accent: 'context' },
  { id: 'analise', title: 'Analise', accent: 'analysis' },
  { id: 'exploracao', title: 'Exploracao', accent: 'exploration' },
  { id: 'decisao', title: 'Decisao', accent: 'decision' },
  { id: 'simulacao', title: 'Simulacao', accent: 'simulation' },
  { id: 'resultado', title: 'Resultado', accent: 'result' },
  { id: 'evolucao', title: 'Evolucao', accent: 'evolution' }
];

const DEFAULT_STATE = {
  currentStep: 'contexto',
  completedSteps: [],
  decisions: { selectedOptionIds: [], justification: '' },
  runtime: {
    catalog: [],
    scenario: null,
    runId: null,
    episode: null,
    decisionResult: null,
    evolution: null
  },
  metrics: {
    stageDurationsMs: {},
    interactionCount: 0,
    totalInteractionMs: 0,
    telemetryEvents: [],
    stepSyncStatus: {},
    lastSyncAt: null,
    updatedAt: null
  }
};

function clampStep(stepId) {
  return SCENARIO_STEPS.some((step) => step.id === stepId) ? stepId : SCENARIO_STEPS[0].id;
}

export function useScenarioEngine() {
  const [engineState, setEngineState] = useState(DEFAULT_STATE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const stageEnteredAtRef = useRef(Date.now());
  const simulationTimerRef = useRef(null);

  const currentStepIndex = useMemo(() => {
    return SCENARIO_STEPS.findIndex((step) => step.id === engineState.currentStep);
  }, [engineState.currentStep]);

  const canAdvance = useMemo(() => {
    return engineState.completedSteps.includes(engineState.currentStep);
  }, [engineState.completedSteps, engineState.currentStep]);

  const selectedOption = useMemo(() => {
    const selectedId = engineState.decisions.selectedOptionIds[0];
    const options = engineState.runtime?.episode?.options || [];
    return options.find((option) => option.id === selectedId) || null;
  }, [engineState.decisions.selectedOptionIds, engineState.runtime]);

  const recordTelemetryEvent = useCallback((eventType, payload = {}, stepId) => {
    setEngineState((previous) => {
      const safeStep = clampStep(stepId || previous.currentStep);
      const nextEvents = [
        ...(previous.metrics.telemetryEvents || []),
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: eventType,
          stepId: safeStep,
          payload,
          createdAt: new Date().toISOString()
        }
      ].slice(-150);

      return {
        ...previous,
        metrics: {
          ...previous.metrics,
          telemetryEvents: nextEvents,
          updatedAt: new Date().toISOString()
        }
      };
    });
  }, []);

  const persistState = useCallback(async (nextState) => {
    setSaving(true);
    setError('');

    setEngineState((previous) => ({
      ...previous,
      metrics: {
        ...previous.metrics,
        stepSyncStatus: {
          ...(previous.metrics.stepSyncStatus || {}),
          [nextState.currentStep]: 'pending'
        },
        updatedAt: new Date().toISOString()
      }
    }));

    try {
      await saveScenarioState({
        step: nextState.currentStep,
        scenarioEngine: nextState
      });

      setEngineState((previous) => ({
        ...previous,
        metrics: {
          ...previous.metrics,
          stepSyncStatus: {
            ...(previous.metrics.stepSyncStatus || {}),
            [nextState.currentStep]: 'synced'
          },
          lastSyncAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      }));
    } catch (err) {
      setError(err.message || 'Nao foi possivel salvar o progresso.');

      setEngineState((previous) => ({
        ...previous,
        metrics: {
          ...previous.metrics,
          stepSyncStatus: {
            ...(previous.metrics.stepSyncStatus || {}),
            [nextState.currentStep]: 'error'
          },
          updatedAt: new Date().toISOString()
        }
      }));
    } finally {
      setSaving(false);
    }
  }, []);

  const registerInteraction = useCallback((extra = {}) => {
    recordTelemetryEvent('interaction', extra);

    setEngineState((previous) => {
      const elapsed = Math.max(0, Date.now() - stageEnteredAtRef.current);
      const nextState = {
        ...previous,
        metrics: {
          ...previous.metrics,
          ...extra,
          interactionCount: previous.metrics.interactionCount + 1,
          totalInteractionMs: previous.metrics.totalInteractionMs + elapsed,
          updatedAt: new Date().toISOString()
        }
      };

      persistState(nextState);
      return nextState;
    });
  }, [persistState, recordTelemetryEvent]);

  const markStageCompleted = useCallback(async (stageId = engineState.currentStep) => {
    const safeStageId = clampStep(stageId);
    const elapsed = Math.max(0, Date.now() - stageEnteredAtRef.current);
    recordTelemetryEvent('stage_completed', { stageId: safeStageId }, safeStageId);

    setEngineState((previous) => {
      const completedSet = new Set(previous.completedSteps);
      completedSet.add(safeStageId);

      const nextState = {
        ...previous,
        completedSteps: Array.from(completedSet),
        metrics: {
          ...previous.metrics,
          stageDurationsMs: {
            ...previous.metrics.stageDurationsMs,
            [safeStageId]: (previous.metrics.stageDurationsMs[safeStageId] || 0) + elapsed
          },
          updatedAt: new Date().toISOString()
        }
      };

      persistState(nextState);
      return nextState;
    });
  }, [engineState.currentStep, persistState, recordTelemetryEvent]);

  const setCurrentStep = useCallback((stepId) => {
    const target = clampStep(stepId);
    recordTelemetryEvent('step_changed', { targetStep: target }, target);

    setEngineState((previous) => {
      const unlockedIndex = Math.min(
        SCENARIO_STEPS.length - 1,
        previous.completedSteps.length
      );
      const targetIndex = SCENARIO_STEPS.findIndex((step) => step.id === target);

      if (targetIndex > unlockedIndex) {
        return previous;
      }

      const nextState = {
        ...previous,
        currentStep: target,
        metrics: {
          ...previous.metrics,
          updatedAt: new Date().toISOString()
        }
      };

      persistState(nextState);
      stageEnteredAtRef.current = Date.now();
      return nextState;
    });
  }, [persistState, recordTelemetryEvent]);

  const goNext = useCallback(() => {
    if (!canAdvance) return;

    const nextIndex = Math.min(SCENARIO_STEPS.length - 1, currentStepIndex + 1);
    setCurrentStep(SCENARIO_STEPS[nextIndex].id);
  }, [canAdvance, currentStepIndex, setCurrentStep]);

  const updateDecision = useCallback((payload) => {
    recordTelemetryEvent('decision_updated', {
      selectedOptionIds: payload.selectedOptionIds,
      hasJustification: Boolean(payload.justification)
    }, 'decisao');

    setEngineState((previous) => ({
      ...previous,
      decisions: {
        ...previous.decisions,
        ...payload
      }
    }));

    registerInteraction();
  }, [registerInteraction, recordTelemetryEvent]);

  const confirmDecision = useCallback(async (payload) => {
    setError('');
    recordTelemetryEvent('decision_confirm_attempt', {
      selectedCount: (payload.selectedOptionIds || []).length
    }, 'decisao');

    try {
      if ((payload.selectedOptionIds || []).length > 1) {
        setError('Para envio ao simulador, selecione apenas uma opcao.');
        return;
      }

      const selectedOptionId = payload.selectedOptionIds?.[0];
      if (!selectedOptionId) {
        setError('Selecione uma opcao antes de confirmar.');
        return;
      }

      if (engineState.runtime.runId) {
        const result = await submitSimulationDecision(engineState.runtime.runId, {
          selectedOptionId,
          feedbackStyle: 'analitico'
        });

        setEngineState((previous) => ({
          ...previous,
          runtime: {
            ...previous.runtime,
            decisionResult: result
          }
        }));
      }

      await postDecision(payload).catch(() => null);
      await markStageCompleted('decisao');
      recordTelemetryEvent('decision_confirmed', { selectedOptionId }, 'decisao');
    } catch (err) {
      setError(err.message || 'Nao foi possivel enviar a decisao.');
      recordTelemetryEvent('decision_error', { message: err.message || 'erro desconhecido' }, 'decisao');
    }
  }, [engineState.runtime.runId, markStageCompleted, recordTelemetryEvent]);

  const runSimulation = useCallback(() => {
    recordTelemetryEvent('simulation_started', {}, 'simulacao');
    registerInteraction({ simulationStatus: 'running' });

    if (simulationTimerRef.current) {
      clearTimeout(simulationTimerRef.current);
    }

    simulationTimerRef.current = setTimeout(() => {
      markStageCompleted('simulacao');
      registerInteraction({ simulationStatus: 'completed' });
      recordTelemetryEvent('simulation_completed', {}, 'simulacao');

      getEvolution()
        .then((evolution) => {
          setEngineState((previous) => ({
            ...previous,
            runtime: {
              ...previous.runtime,
              evolution
            }
          }));
        })
        .catch(() => null);
    }, 1800);
  }, [markStageCompleted, recordTelemetryEvent, registerInteraction]);

  useEffect(() => {
    Promise.all([getScenarioState(), getSimulationCatalog()])
      .then(async ([journeyData, catalog]) => {
        const activeCatalog = Array.isArray(catalog) ? catalog : [];
        const primaryScenario = activeCatalog[0] || null;
        let runState = null;
        let runId = null;
        const persistedRunId = journeyData?.scenarioEngine?.runtime?.runId || null;

        if (persistedRunId) {
          runId = persistedRunId;
          runState = await getSimulationState(runId).catch(() => null);
        }

        if (!runState && primaryScenario?.id) {
          const run = await startSimulation({ scenarioId: primaryScenario.id });
          runId = run?.id || null;
          if (runId) {
            runState = await getSimulationState(runId);
          }
        }

        const serverState = journeyData?.scenarioEngine || {
          currentStep: journeyData?.step,
          decisions: journeyData?.decision ? { selectedOptionIds: [String(journeyData.decision)], justification: '' } : undefined
        };

        setEngineState((previous) => ({
          ...previous,
          ...serverState,
          currentStep: clampStep(serverState.currentStep),
          completedSteps: Array.isArray(serverState.completedSteps) ? serverState.completedSteps : previous.completedSteps,
          decisions: {
            ...previous.decisions,
            ...(serverState.decisions || {})
          },
          runtime: {
            ...previous.runtime,
            ...(serverState.runtime || {}),
            catalog: activeCatalog,
            scenario: runState?.scenario || primaryScenario,
            runId,
            episode: runState?.episode || null
          },
          metrics: {
            ...previous.metrics,
            ...(serverState.metrics || {})
          }
        }));
      })
      .catch((err) => {
        setError(err.message || 'Nao foi possivel carregar a jornada.');
      })
      .finally(() => {
        setLoading(false);
      });

    return () => {
      if (simulationTimerRef.current) {
        clearTimeout(simulationTimerRef.current);
      }
    };
  }, []);

  return {
    steps: SCENARIO_STEPS,
    loading,
    saving,
    error,
    state: engineState,
    selectedOption,
    currentStepIndex,
    canAdvance,
    setCurrentStep,
    goNext,
    registerInteraction,
    markStageCompleted,
    updateDecision,
    confirmDecision,
    runSimulation
  };
}

export default useScenarioEngine;
