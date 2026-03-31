import { describe, expect, test, vi, beforeEach } from 'vitest';

const apiGetMock = vi.fn();
const apiPostMock = vi.fn();

vi.mock('./api', () => ({
  default: {
    get: (...args) => apiGetMock(...args),
    post: (...args) => apiPostMock(...args)
  }
}));

import { getJourneySummary } from './journeyApi';
import { sendMentorMessage } from './mentorApi';
import { evaluateAssessment } from './assessmentApi';
import { saveOnboarding } from './profileApi';
import {
  getSimulationCatalog,
  getSimulationState,
  startSimulation,
  submitDecision
} from './simulationApi';

describe('domain api wrappers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('journeyApi usa endpoint correto', async () => {
    apiGetMock.mockResolvedValueOnce({ title: 'ok' });

    await getJourneySummary();

    expect(apiGetMock).toHaveBeenCalledWith('/journey/me');
  });

  test('mentorApi usa endpoint e payload corretos', async () => {
    apiPostMock.mockResolvedValueOnce({ reply: 'ok' });

    await sendMentorMessage('mensagem');

    expect(apiPostMock).toHaveBeenCalledWith('/mentor/message', { message: 'mensagem' });
  });

  test('assessmentApi usa endpoint e payload corretos', async () => {
    const payload = { answers: [] };
    apiPostMock.mockResolvedValueOnce({ score: 10 });

    await evaluateAssessment(payload);

    expect(apiPostMock).toHaveBeenCalledWith('/assessment/evaluate', payload);
  });

  test('profileApi usa endpoint e payload corretos', async () => {
    const payload = { goalTitle: 'Objetivo' };
    apiPostMock.mockResolvedValueOnce({ ok: true });

    await saveOnboarding(payload);

    expect(apiPostMock).toHaveBeenCalledWith('/profile/onboarding', payload);
  });

  test('simulationApi usa endpoints corretos', async () => {
    apiGetMock.mockResolvedValue({});
    apiPostMock.mockResolvedValue({});

    await getSimulationCatalog();
    await getSimulationState('run-1');
    await startSimulation({ scenarioId: 'sc-1' });
    await submitDecision('run-1', { selectedOptionId: 'opt-1' });

    expect(apiGetMock).toHaveBeenNthCalledWith(1, '/simulation/catalog');
    expect(apiGetMock).toHaveBeenNthCalledWith(2, '/simulation/run-1');
    expect(apiPostMock).toHaveBeenNthCalledWith(1, '/simulation/start', { scenarioId: 'sc-1' });
    expect(apiPostMock).toHaveBeenNthCalledWith(2, '/simulation/run-1/decision', {
      selectedOptionId: 'opt-1'
    });
  });
});
