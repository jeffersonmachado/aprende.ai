import { beforeEach, describe, expect, test, vi } from 'vitest';

const apiGetMock = vi.fn();
const apiPostMock = vi.fn();

vi.mock('./api.js', () => ({
  default: {
    get: (...args) => apiGetMock(...args),
    post: (...args) => apiPostMock(...args)
  }
}));

import { saveOnboarding } from './profileApi.js';
import { getJourneySummary } from './journeyApi.js';
import { getSimulationCatalog, getSimulationState, startSimulation, submitDecision } from './simulationApi.js';
import { sendMentorMessage } from './mentorApi.js';
import { evaluateAssessment } from './assessmentApi.js';
import {
  finalizeJourneyEnginePhase,
  getJourneyEngineCompetencies,
  getJourneyEngineRuntime,
  resolveJourneyEngineTwist,
  startJourneyEnginePhase,
  submitJourneyEngineDecision,
  submitJourneyEngineReflection
} from './journeyEngineApi.js';

describe('domain api wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('profileApi usa endpoint esperado', async () => {
    apiPostMock.mockResolvedValueOnce({ ok: true });
    await saveOnboarding({ goalTitle: 'Meta' });
    expect(apiPostMock).toHaveBeenCalledWith('/api/profile/onboarding', { goalTitle: 'Meta' });
  });

  test('journeyApi usa endpoint esperado', async () => {
    apiGetMock.mockResolvedValueOnce({});
    await getJourneySummary();
    expect(apiGetMock).toHaveBeenCalledWith('/api/journey/me');
  });

  test('simulationApi usa endpoints esperados', async () => {
    apiGetMock.mockResolvedValue({});
    apiPostMock.mockResolvedValue({});

    await getSimulationCatalog();
    await startSimulation({ scenarioId: 'sc-1' });
    await getSimulationState('run-1');
    await submitDecision('run-1', { selectedOptionId: 'opt-1' });

    expect(apiGetMock).toHaveBeenNthCalledWith(1, '/api/simulation/catalog');
    expect(apiPostMock).toHaveBeenNthCalledWith(1, '/api/simulation/start', { scenarioId: 'sc-1' });
    expect(apiGetMock).toHaveBeenNthCalledWith(2, '/api/simulation/run-1');
    expect(apiPostMock).toHaveBeenNthCalledWith(2, '/api/simulation/run-1/decision', { selectedOptionId: 'opt-1' });
  });

  test('mentorApi usa endpoint esperado', async () => {
    apiPostMock.mockResolvedValueOnce({ reply: 'ok' });
    await sendMentorMessage('Oi');
    expect(apiPostMock).toHaveBeenCalledWith('/api/mentor/message', { message: 'Oi', mode: undefined, context: null });
  });

  test('assessmentApi usa endpoint esperado', async () => {
    apiPostMock.mockResolvedValueOnce({ score: 8 });
    const payload = { answers: [] };
    await evaluateAssessment(payload);
    expect(apiPostMock).toHaveBeenCalledWith('/api/assessment/evaluate', payload);
  });

  test('journeyEngineApi usa endpoints esperados', async () => {
    apiGetMock.mockResolvedValue({});
    apiPostMock.mockResolvedValue({});

    await getJourneyEngineRuntime();
    await startJourneyEnginePhase('briefing', { chapterId: 'capitulo-1' });
    await submitJourneyEngineDecision({ choiceId: 'choice-1' });
    await resolveJourneyEngineTwist({ resolutionNotes: 'ok' });
    await submitJourneyEngineReflection({ reflectionText: 'aprendizado' });
    await finalizeJourneyEnginePhase({ chapterId: 'capitulo-1' });
    await getJourneyEngineCompetencies();

    expect(apiGetMock).toHaveBeenNthCalledWith(1, '/api/journey-engine/runtime');
    expect(apiPostMock).toHaveBeenNthCalledWith(1, '/api/journey-engine/phases/briefing/start', { chapterId: 'capitulo-1' });
    expect(apiPostMock).toHaveBeenNthCalledWith(2, '/api/journey-engine/decision', { choiceId: 'choice-1' });
    expect(apiPostMock).toHaveBeenNthCalledWith(3, '/api/journey-engine/twist/resolve', { resolutionNotes: 'ok' });
    expect(apiPostMock).toHaveBeenNthCalledWith(4, '/api/journey-engine/reflection', { reflectionText: 'aprendizado' });
    expect(apiPostMock).toHaveBeenNthCalledWith(5, '/api/journey-engine/finalize', { chapterId: 'capitulo-1' });
    expect(apiGetMock).toHaveBeenNthCalledWith(2, '/api/journey-engine/competencies');
  });
});
