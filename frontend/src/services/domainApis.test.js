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
    expect(apiPostMock).toHaveBeenCalledWith('/api/mentor/message', { message: 'Oi' });
  });

  test('assessmentApi usa endpoint esperado', async () => {
    apiPostMock.mockResolvedValueOnce({ score: 8 });
    const payload = { answers: [] };
    await evaluateAssessment(payload);
    expect(apiPostMock).toHaveBeenCalledWith('/api/assessment/evaluate', payload);
  });
});
