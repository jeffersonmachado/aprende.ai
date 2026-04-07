import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useCampaignRuntime } from './CampaignRuntimeContext.jsx';
import {
  finalizeJourneyEnginePhase,
  getJourneyEngineRuntime,
  resolveJourneyEngineTwist,
  startJourneyEnginePhase,
  submitJourneyEngineDecision,
  submitJourneyEngineReflection
} from '../services/journeyEngineApi.js';

const JourneyEngineRuntimeContext = createContext(null);

function mergeRuntimeState(previousRuntime, nextRuntime) {
  if (!previousRuntime) return nextRuntime;
  if (!nextRuntime) return previousRuntime;

  return {
    ...previousRuntime,
    ...nextRuntime,
    worldState: nextRuntime.worldState || previousRuntime.worldState,
    mission: nextRuntime.mission || previousRuntime.mission,
    competencyDashboard: nextRuntime.competencyDashboard || previousRuntime.competencyDashboard,
    latestDecision: nextRuntime.latestDecision || previousRuntime.latestDecision,
    latestConsequence: nextRuntime.latestConsequence || previousRuntime.latestConsequence,
    latestTwist: nextRuntime.latestTwist || previousRuntime.latestTwist,
    reflection: nextRuntime.reflection || previousRuntime.reflection,
    result: nextRuntime.result || previousRuntime.result,
    progression: nextRuntime.progression || previousRuntime.progression
  };
}

export function JourneyEngineRuntimeProvider({ children }) {
  const { currentPhase } = useCampaignRuntime();
  const [runtime, setRuntime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const startedPhaseRef = useRef('');

  const reloadRuntime = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getJourneyEngineRuntime();
      setRuntime((previousRuntime) => mergeRuntimeState(previousRuntime, data));
      return data;
    } catch (err) {
      setError(err.message || 'Falha ao carregar o runtime do journey engine.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const startPhase = useCallback(async (phase = currentPhase) => {
    if (!phase) return null;
    setError('');
    try {
      const response = await startJourneyEnginePhase(phase.id, {
        chapterId: phase.chapterId,
        missionId: phase?.content?.mission?.id || null
      });
      if (response?.runtime) setRuntime((previousRuntime) => mergeRuntimeState(previousRuntime, response.runtime));
      return response;
    } catch (err) {
      setError(err.message || 'Falha ao iniciar a fase atual.');
      return null;
    }
  }, [currentPhase]);

  const applyDecision = useCallback(async (payload = {}) => {
    setError('');
    try {
      const response = await submitJourneyEngineDecision(payload);
      if (response?.runtime) setRuntime((previousRuntime) => mergeRuntimeState(previousRuntime, response.runtime));
      return response;
    } catch (err) {
      setError(err.message || 'Falha ao aplicar a decisão.');
      throw err;
    }
  }, []);

  const resolveTwist = useCallback(async (payload = {}) => {
    setError('');
    try {
      const response = await resolveJourneyEngineTwist(payload);
      if (response?.runtime) setRuntime((previousRuntime) => mergeRuntimeState(previousRuntime, response.runtime));
      return response;
    } catch (err) {
      setError(err.message || 'Falha ao resolver o plot twist.');
      throw err;
    }
  }, []);

  const submitReflection = useCallback(async (payload = {}) => {
    setError('');
    try {
      const response = await submitJourneyEngineReflection(payload);
      if (response?.runtime) setRuntime((previousRuntime) => mergeRuntimeState(previousRuntime, response.runtime));
      return response;
    } catch (err) {
      setError(err.message || 'Falha ao registrar a reflexão.');
      throw err;
    }
  }, []);

  const finalizePhase = useCallback(async (payload = {}) => {
    setError('');
    try {
      const response = await finalizeJourneyEnginePhase(payload);
      if (response?.runtime) setRuntime((previousRuntime) => mergeRuntimeState(previousRuntime, response.runtime));
      return response;
    } catch (err) {
      setError(err.message || 'Falha ao finalizar a fase.');
      throw err;
    }
  }, []);

  useEffect(() => {
    reloadRuntime();
  }, [reloadRuntime]);

  useEffect(() => {
    if (!currentPhase) return;
    const phaseKey = `${currentPhase.chapterId}:${currentPhase.id}`;
    if (startedPhaseRef.current === phaseKey) return;
    startedPhaseRef.current = phaseKey;
    startPhase(currentPhase).catch(() => null);
  }, [currentPhase, startPhase]);

  const value = useMemo(() => ({
    runtime,
    loading,
    error,
    reloadRuntime,
    startPhase,
    applyDecision,
    resolveTwist,
    submitReflection,
    finalizePhase
  }), [runtime, loading, error, reloadRuntime, startPhase, applyDecision, resolveTwist, submitReflection, finalizePhase]);

  return (
    <JourneyEngineRuntimeContext.Provider value={value}>
      {children}
    </JourneyEngineRuntimeContext.Provider>
  );
}

export function useJourneyEngineRuntime() {
  const value = useContext(JourneyEngineRuntimeContext);
  if (!value) {
    throw new Error('useJourneyEngineRuntime precisa ser usado dentro de JourneyEngineRuntimeProvider.');
  }
  return value;
}