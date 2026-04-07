import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getJourneyRuntime, resolvePlotTwist, saveJourneyCampaignProgress, triggerPlotTwist } from '../services/journeyRuntimeApi.js';

const JourneyRuntimeContext = createContext(null);

export function JourneyRuntimeProvider({ children }) {
  const [runtime, setRuntime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refreshRuntime = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const payload = await getJourneyRuntime();
      setRuntime(payload);
      return payload;
    } catch (err) {
      setError(err.message || 'Falha ao carregar runtime da jornada.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const firePlotTwist = useCallback(async (payload = {}) => {
    setError('');
    try {
      const response = await triggerPlotTwist(payload);
      if (response?.runtime) {
        setRuntime(response.runtime);
      }
      return response;
    } catch (err) {
      setError(err.message || 'Falha ao acionar plot twist.');
      throw err;
    }
  }, []);

  const resolveActivePlotTwist = useCallback(async (payload = {}) => {
    setError('');
    try {
      const response = await resolvePlotTwist(payload);
      if (response?.runtime) {
        setRuntime(response.runtime);
      }
      return response;
    } catch (err) {
      setError(err.message || 'Falha ao resolver plot twist.');
      throw err;
    }
  }, []);

  const saveCampaignProgress = useCallback(async (payload = {}) => {
    setError('');
    try {
      const response = await saveJourneyCampaignProgress(payload);
      if (response?.runtime) {
        setRuntime(response.runtime);
      }
      return response;
    } catch (err) {
      setError(err.message || 'Falha ao persistir progresso da campanha.');
      throw err;
    }
  }, []);

  useEffect(() => {
    refreshRuntime();
  }, [refreshRuntime]);

  const value = useMemo(() => ({
    runtime,
    loading,
    error,
    refreshRuntime,
    firePlotTwist,
    resolveActivePlotTwist,
    saveCampaignProgress,
    setRuntime
  }), [runtime, loading, error, refreshRuntime, firePlotTwist, resolveActivePlotTwist, saveCampaignProgress]);

  return (
    <JourneyRuntimeContext.Provider value={value}>
      {children}
    </JourneyRuntimeContext.Provider>
  );
}

export function useJourneyRuntime() {
  const value = useContext(JourneyRuntimeContext);
  if (!value) {
    throw new Error('useJourneyRuntime precisa ser usado dentro de JourneyRuntimeProvider.');
  }

  return value;
}
